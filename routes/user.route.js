import express from "express";
const router = express.Router();
import {
  loginController,
  registerController,
  fetchAllUsersController,
  fetchAUserByIdAndParamsController,
  fetchAUserByIdAndQueryController,
  fetchAUserController,
} from "../controllers/user.controller.js";

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/fetch-all-users", fetchAllUsersController);

// getting user id by params
router.get("/fetch-user/:uid", fetchAUserByIdAndParamsController);

// getting user id by query
router.get("/fetch-user", fetchAUserByIdAndQueryController);

// getting a user
router.get("/fetch-a-user", fetchAUserController);

export default router;
