import express from "express";
const router = express.Router();
import {
  loginController,
  registerController,
  fetchAllUsersController,
  fetchAUserByIdAndParamsController,
  fetchAUserByIdAndQueryController,
  fetchAUserController,
  updateAUserController,
  deleteAUserController,
  deleteUserController,
  logoutController,
} from "../controllers/user.controller.js";
import isAdmin from "../middlewares/auth.middleware.js";

router.post("/register", registerController);
router.post("/login", loginController);

// protecting route using isAdmin middleware
router.get("/fetch-all-users", isAdmin, fetchAllUsersController);

// getting user id by params
router.get("/fetch-user/:uid", isAdmin, fetchAUserByIdAndParamsController);

// getting user id by query
router.get("/fetch-user", isAdmin, fetchAUserByIdAndQueryController);

// getting a user without params and query - body
router.get("/fetch-a-user", isAdmin, fetchAUserController);

// updating a user
router.patch("/update-user/:uid", isAdmin, updateAUserController);

// deleting a user - by id
router.delete("/delete-a-user", isAdmin, deleteAUserController);

// deleting user - by email
router.delete("/delete-user", isAdmin, deleteUserController);

router.get("/logout", logoutController);

export default router;
