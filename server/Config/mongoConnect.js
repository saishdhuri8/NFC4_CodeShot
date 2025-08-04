import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";

const mongoConnect = async () => {
  try {
    const url="mongodb+srv://NeedCode:ujWLY3ePFKbfLEJY@cluster0.rndue1t.mongodb.net/NeedForCode";
    const conn = await mongoose.connect(url);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

export default mongoConnect;