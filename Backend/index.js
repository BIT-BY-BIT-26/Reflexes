// const express = require("express");
// const { mongoose } = require("mongoose");
// const app = express();
// const cors = require("cors");
// const dotenv = require("dotenv");
// const patientRoute = require("./routes/patientRoute");
// const authRoute = require("./routes/authRoute");
// const pharmacyRouter = require("./routes/pharmacy");
// app.use(cors());
// const hospitalRoutes = require("./routes/hospital");
// const departmentRouter = require("./routes/departmentRoute");
// const doctorRouter = require("./routes/doctor");

// dotenv.config();
// app.use(cors({
//   origin: true,
//   credentials: true
// }));

// app.use(express.json());

// // MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(async () => {
//     console.log("✅ MongoDB connected successfully");

//   })
//   .catch((err) => console.log("❌ MongoDB connection error", err));

// app.use(express.json()); 

// app.get('/',(req , res)=>{
//     res.json("hi there");
// });

// const PORT = 3000;

// app.use("/api/auth", authRoute);
// app.use("/api/patients", patientRoute);
// app.use("/api",appointmentRouter);
// app.use("/api/reports",reportsRoute);
// // app.use("/api/consulation",consultationRouter);
// app.use("/api/pharmacy",pharmacyRouter);
// app.use("/api/departments",departmentRouter );
// app.use("/api/doctors",doctorRouter);
// app.use("/api",hospitalRoutes)

// app.listen(PORT,()=>{
//     console.log(`Listening to port ${PORT}`);
// })


const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { Server } = require("socket.io");

// Routes
const hospitalRoutes = require("./routes/hospital");
const authRoute = require("./routes/authRoute");
const departmentRouter = require("./routes/departmentRoute");
const patientRoute = require("./routes/patientRoute");
const appointmentRouter = require("./routes/appointment");
const socketHandler = require("./socket.js");
const prescriptionRoute = require("./routes/prescription.js");
const reportsRoute = require("./routes/reports.js");
const pharmacyRouter = require("./routes/pharmacy");
const doctorRouter = require("./routes/doctor.js");
const consultationRouter = require("./routes/consultationRoute.js");
const { addMedicineToInventory } = require("./controllers/inventoryController.js");
const inventoryRouter = require("./routes/inventoryRoute.js");

const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173", // local dev
        "https://your-frontend-deploy-url.com" // frontend deployed URL
    ],
    credentials: true, // if sending cookies
}));
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

  })
  .catch((err) => console.log("❌ MongoDB connection error", err));

// Root
app.get("/", (req, res) => {
  res.json("Server is running 🚀");
});

// HTTP + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const onlineDoctors = new Map();
const onlinePatients = new Map();
app.set("onlineDoctors", onlineDoctors);
app.set("onlinePatients", onlinePatients);

app.set("io", io);
socketHandler(io,onlineDoctors,onlinePatients);

// Routes
app.use("/api", hospitalRoutes);
app.use("/api/auth", authRoute);
app.use("/api/prescription", prescriptionRoute);
app.use("/api/departments", departmentRouter);
app.use("/api/patients", patientRoute);
app.use('/api/doctors', doctorRouter)
app.use("/api",appointmentRouter);
app.use("/api/reports",reportsRoute);
app.use("/api/doctors",doctorRouter);
app.use("/api/pharmacy",inventoryRouter);

// app.use("/api/consulation",consultationRouter);
app.use("/api/pharmacy",pharmacyRouter);
app.use("/api/consulation",consultationRouter);
// Listen
server.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
