const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attribute.controller');

router.get('/attributes/size', attributeController.getSizeValues);
router.get('/attributes/color', attributeController.getColorValues);
router.post('/attributes/size', attributeController.createSize);
router.post('/attributes/color', attributeController.createColor);
router.get('/attributes/shippingunit', attributeController.getAllShippingUnits);



module.exports = router;
