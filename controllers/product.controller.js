import Product from "../models/product.model.js";

const createProductController = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!price) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    const product = await Product.findOne({ name });

    if (product) {
      return res.status(409).json({
        success: false,
        message: "Product creation failed. Product already exists",
      });
    }

    const newProduct = await new Product({ name, price }).save();

    return res.status(201).json({
      success: true,
      message: "Product creation successful",
      data: newProduct,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      err: err.message,
    });
  }
};

export { createProductController };
