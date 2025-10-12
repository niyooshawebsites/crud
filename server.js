import express from "express";
import dotenv from "dotenv";
import connection from "./config/db.js";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import UserRoutes from "./routes/user.route.js";
import ProductRotues from "./routes/product.route.js";
import OrderRotues from "./routes/order.route.js";
import cookieParser from "cookie-parser";

// express initialization
const app = express();

// configuration
dotenv.config();
const PORT = process.env.PORT || 8500;

// start the connection
connection();

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan());

app.use(process.env.API_VERSION, UserRoutes);
app.use(process.env.API_VERSION, ProductRotues);
app.use(process.env.API_VERSION, OrderRotues);

// listen on PORT
app.listen(PORT, () => {
  console.log(colors.bgYellow(`The app is running on port ${PORT}`));
});
