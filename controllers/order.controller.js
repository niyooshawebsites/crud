import Order from "../models/order.model.js";

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
