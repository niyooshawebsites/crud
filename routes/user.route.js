import express from "express";
const router = express.Router();
import {
  loginController,
  registerController,
} from "../controllers/user.controller.js";

router.post("/register", registerController);
router.post("/login", loginController);

export default router;
