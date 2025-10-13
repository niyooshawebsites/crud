import express from "express";
import { createProductController } from "../controllers/product.controller.js";
import isAdmin from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/create-product", createProductController);

export default router;
