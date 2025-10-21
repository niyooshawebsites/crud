import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";

dotenv.config();

// const connection = async () => {
//   try {
//     const connectionString = process.env.MONGO_URI;
//     const connectDB = await mongoose.connect(`${connectionString}`);

//     connectDB
//       ? console.log(colors.bgGreen(`Connected to DB successfully`))
//       : console.log(colors.red(`Failed to connect to DB`));
//   } catch (err) {
//     console.log(err.message);
//   }
// };

let isConnected = null;

const connection = async () => {
  if (isConnected) {
    console.log(colors.green("Using exsiting DB connection"));
    return;
  }
  try {
    console.log("Conection string", process.env.MONGO_URI);
    const connectionString = process.env.MONGO_URI;

    const connectDB = await mongoose.connect(`${connectionString}`);

    console.log(connectDB);
    console.log(connectDB.connections);

    isConnected = connectDB.connections[0].readyState;
    console.log(colors.magenta("Successfully created a new connection"));
  } catch (err) {
    console.error(colors.bgRed(`DB connection failed: ${err.message}`));
    throw new Error("Database connection failed");
  }
};

export default connection;
