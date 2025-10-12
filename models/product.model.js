import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      min: [3, "Product name must be greater than 3 letter"],
      unique: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [1, "Product price must be greater than 0"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
