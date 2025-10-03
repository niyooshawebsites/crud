import mongoose from "mongoose";
import colors from "colors";

const connection = async () => {
  try {
    const connectionString = process.env.MONGO_URI;
    const connectDB = await mongoose.connect(`${connectionString}`);

    connectDB
      ? console.log(colors.bgGreen(`Connected to DB successfully`))
      : console.log(colors.red(`Failed to connect to DB`));
  } catch (err) {
    console.log(err.message);
  }
};

export default connection;
