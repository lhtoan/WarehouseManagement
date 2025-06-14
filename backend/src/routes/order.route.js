const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.post("/order", orderController.createOrder);
router.get("/orders/detail", orderController.getAllOrdersWithDetails);
router.post("/orders/:id/status", orderController.updateOrderStatus);
router.get('/status/:ma_hoa_don', orderController.getOrderStatusHistory);

module.exports = router;
