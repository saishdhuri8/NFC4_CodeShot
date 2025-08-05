import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import cors from "cors"
import mongoConnect from './Config/mongoConnect.js';
import codeRoutes from './Routes/code.js';



const app = express()
const port = 3000


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"], 
    allowedHeaders: ["Content-Type", "Authorization"] 
}));
app.use(express.json());

app.use(codeRoutes);


app.post("/",async(req,res)=>{
  console.log(req.body);
  

  return res.json({message:"hiiii"})
})






mongoConnect()//monogDB se connect
app.listen(port, () => {
  console.log(` app listening on port ${port}`)
})