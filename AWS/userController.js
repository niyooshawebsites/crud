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
import sharp from "sharp";

// configuration
dotenv.config();

// S3 Config
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const awsAccessKey = process.env.AWS_ACCESS_KEY;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretAccessKey,
  },
  region: bucketRegion,
});

// SAVING THE IMAGE IN AWS S3 BUCKET AND IN MONGODB DATABASE
// register controller - create
const registerController = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.file", req.file);

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

    // Upload file to S3 if it exists
    let fileName = null;
    if (req.file) {
      // resizing the image
      const buffer = await sharp(req.file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();

      fileName = `${v4()}`;

      const params = {
        Bucket: bucketName, // bucket name
        Key: fileName, //  file name
        Body: buffer, //  actual file
        ContentType: req.file.mimetype, // mimetype
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
    }

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

// FETCHING THE IMAGE FROM S3
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

// DELETING IMAGE FROM S3
const deleteUserController = async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "Uid is required",
      });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
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
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      err: err.message,
    });
  }
};
