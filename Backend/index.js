const express = require("express");
const { mongoose } = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const patientRoute = require("./routes/patientRoute");
const authRoute = require("./routes/authRoute");
dotenv.config();

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

  })
  .catch((err) => console.log("❌ MongoDB connection error", err));

app.use(express.json()); 

app.get('/',(req , res)=>{
    res.json("hi there");
});

const PORT = 3000;

app.use("/api/auth", authRoute);
app.use("/api/patients", patientRoute);

app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}`);
})
