
import { Router } from "express";
import User from "../Schemas/UserModel.js";

const userRoutes = Router();

userRoutes.post("/get-set-user", async (req, res) => {
  try {
    const { id, email, name} = req.body;

    if (!id || !email ) {
      return res.status(400).json({ success: false, message: "id, email, and name are required" });
    }

    
    const user = await User.findByIdAndUpdate(
      id, 
      { email, name },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error saving user:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default userRoutes;
