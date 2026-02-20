const express = require("express");
const auth = require("../middleware/auth");
const { addMedicineToInventory, updateInventoryMedicine, getShopMedicineStats } = require("../controllers/inventoryController");
const inventoryRouter = express.Router();

inventoryRouter.post("/add", auth, addMedicineToInventory);
inventoryRouter.put(
  "/update/:inventoryId", auth,
  updateInventoryMedicine
);

inventoryRouter.get(
  "/stats", auth,
  getShopMedicineStats
);

module.exports = inventoryRouter;
