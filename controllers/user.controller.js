import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mail.utils.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const bucketAccessKey = process.env.ACCESS_KEY;
const bucketSecretAccessKey = process.env.SECRET_ACCESS;

const s3 = new S3Client({
  credentials: {
    accessKeyId: bucketAccessKey,
    secretAccessKey: bucketSecretAccessKey,
  },
  region: bucketRegion,
});

// register controller - create
const registerController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: "Rgistration failed. Email already exists",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required for registration",
      });
    }

    // uplaoding images on AWS
    const fileName = `${v4()}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await new User({
      email,
      password: hashedPassword,
      avatar: fileName,
    }).save();

    const subject = "Registration Email";
    const msg = `<h1>Welcome to Busy Store</h1><p>Thank your resitering to your service</p><a style="background-color: lime; padding: 5px 10px; border-radius: 10px" href="https://youtube.com">Login now</a>`;

    // send registration email to user
    sendEmail(subject, msg, newUser.email);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: newUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      err: err.message,
    });
  }
};

// login controller
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email or Password is invalid",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email or Password is invalid",
      });
    }

    const userDetails = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const authToken = await jwt.sign(userDetails, process.env.JWT_SECRET, {
      expiresIn: 24 * 60 * 60 * 1000,
    });

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", //false,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // authorization....
    // saving the user in the requrest object for isAdmin middleware access
    req.user = userDetails;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: userDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      err: err.message,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: process.env.COOKIE_HTTPONLY,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error!",
      err: err.message,
    });
  }
};

// fetch all uesrs - read with pagination
const fetchAllUsersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "users found",
      data: users,
      pagination: {
        totalUsers,
        limit,
        page,
        totalPages: Math.ceil(totalUsers / limit),
        hasNextPage: page * limit < totalUsers,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
};

// fetch a user by id - read (using params)
const fetchAUserByIdAndParamsController = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    const params = {
      Bucket: bucketName,
      Key: user.avatar,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    user.imageUrl = url;

    return res.status(200).json({
      success: true,
      message: "user found",
      data: {
        _id: user._id,
        email: user.email,
        imageUrl: url,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

// fetch a user by id - read (using params)
const fetchAUserByIdAndQueryController = async (req, res) => {
  try {
    const { uid } = req.query;

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    const params = {
      Bucket: bucketName,
      Key: user.avatar,
    };

    const command = new GetObjectCommand(params);
    const imageUrl = await getSignedUrl(s3, command, { expiresIn: 15 });

    return res.status(200).json({
      success: true,
      message: "user found",
      data: {
        _id: user._id,
        email: user.email,
        avatar: imageUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

// fetch a user using other details - without id - read
const fetchAUserController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user found",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      err: err.message,
    });
  }
};

// update a user
const updateAUserController = async (req, res) => {
  try {
    const { uid } = req.params;
    const { password } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // const user = await User.findOne({ _id: uid });
    // const user = await User.findById(uid);

    const user = await User.findByIdAndUpdate(
      uid,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      err: err.message,
    });
  }
};

// delete a user
const deleteAUserController = async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const params = {
      Bucket: bucketName,
      Key: user.avatar,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    await User.findByIdAndDelete(uid);

    return res.status(200).json({
      success: true,
      message: "User details deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
};

// delete a user without query or params
const deleteUserController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    await User.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
};

export {
  registerController,
  loginController,
  fetchAllUsersController,
  fetchAUserByIdAndParamsController,
  fetchAUserByIdAndQueryController,
  fetchAUserController,
  updateAUserController,
  deleteAUserController,
  deleteUserController,
  logoutController,
};
