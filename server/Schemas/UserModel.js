// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Firebase UID
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
