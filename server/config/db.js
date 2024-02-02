import mongoose from "mongoose";
import config from "../config.js";

//for production
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      dbName: config.MONGODB_NAME,
    });
    console.log(`MongoDb Connected ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error ${error.message}`);
    process.exit(1);
  }
};

// for development 
// const connectDb = async () => {
//   try {
//     const conn = await mongoose.connect("mongodb://localhost:27017", {
//       dbName: "devsquadgpt_db",
//     });
//     console.log(`MongoDb Connected ${conn.connection.host}`);
//   } catch (error) {
//     console.log(`Error ${error.message}`);
//     process.exit(1);
//   }
// };

export default connectDb;
