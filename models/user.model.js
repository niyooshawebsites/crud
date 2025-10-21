import mongoose from "mongoose";

// schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: [true, "Email must be unique"],
      required: [true, "Email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      min: [5, "Password must be atleast 5 characters long"],
      max: [20, "Password can not be more 20 characaters long"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
        "Password format is invalid",
      ],
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    avatar: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
