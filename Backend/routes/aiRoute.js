const express = require("express");

const {
  testGemini,
  suggestDepartment,
} = require("../controllers/aiController");

const aiRouter = express.Router();

aiRouter.get("/test", testGemini);
aiRouter.post("/suggest-department",suggestDepartment);


module.exports = aiRouter;