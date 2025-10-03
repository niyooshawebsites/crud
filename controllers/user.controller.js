import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await new User({
      email,
      password: hashedPassword,
    }).save();

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

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: { id: user._id, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      err: err.message,
    });
  }
};

// fetch all uesrs - read
const fetchAllUsersController = async (req, res) => {
  try {
    const users = await User.find();

    const noOfUsers = await User.countDocuments();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "users found",
      total: noOfUsers,
      data: users,
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

export {
  registerController,
  loginController,
  fetchAllUsersController,
  fetchAUserByIdAndParamsController,
  fetchAUserByIdAndQueryController,
  fetchAUserController,
};
