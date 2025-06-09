const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attribute.controller');

// Route lấy giá trị thuộc tính Size
router.get('/attributes/size', attributeController.getSizeValues);
router.get('/attributes/color', attributeController.getColorValues);

module.exports = router;
