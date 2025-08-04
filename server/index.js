import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import cors from "cors"
import mongoConnect from './Config/mongoConnect.js';



const app = express()
const port = 3000


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"], 
    allowedHeaders: ["Content-Type", "Authorization"] 
}));
app.use(express.json());




app.get("/",async(req,res)=>{
  return res.json({message:"hiiii"})
})






mongoConnect()//monogDB se connect
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})