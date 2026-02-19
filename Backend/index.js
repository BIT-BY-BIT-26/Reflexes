const express = require("express");
const { mongoose } = require("mongoose");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

  })
  .catch((err) => console.log("❌ MongoDB connection error", err));

app.get('/',(req , res)=>{
    res.json("hi there");
});
const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}`);
})
