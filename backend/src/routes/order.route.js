const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.post("/order", orderController.createOrder);
router.get("/orders/detail", orderController.getAllOrdersWithDetails);

module.exports = router;
