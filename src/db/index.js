import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
     const connectionIntance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
     console.log(`\n Mongoose Connecting !! DB : HOST : ${connectionIntance.connection.host}`)
    } catch (error) {
        console.log("Mongo DB connection FAILED",error)
        process.exit(1)
    }
}
export default connectDB

// import mongoose from "mongoose";

//  const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`Mongo DB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.log("Mongo DB connection FAILED", error);
//   }
// };
// export default connectDB 