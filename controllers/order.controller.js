import Order from "../models/order.model.js";
import { sendEmail } from "../utils/mail.utils.js";

const createOrderController = async (req, res) => {
  try {
    const { product, user } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const newOrder = await new Order({ product, user }).save();

    const myOder = await Order.findById(newOrder._id)
      .populate("product")
      .populate("user");

    const subject = "Oder Received";
    const msg = `<h1>Welcome to Busy Store</h1><p>Thank you for placing order with us</p><a style="background-color: lime; padding: 5px 10px; border-radius: 10px" href="https://youtube.com">Check order status</a>`;

    // send registration email to user
    sendEmail(subject, msg, myOder.user.email);

    return res.status(201).json({
      success: true,
      message: "Order created successful",
      data: myOder,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      err: err.message,
    });
  }
};

export { createOrderController };
