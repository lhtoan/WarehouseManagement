const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const upload = require('../middlewares/uploadImage');

router.get('/products', productController.getAllProducts);
router.post('/products/add', upload.single('hinh_anh'), productController.createProduct);
router.post('/products/:id/variants', upload.single('hinh_anh'), productController.addVariant);
router.put('/products/update/:variantId/:loHangId', upload.single('hinh_anh'), productController.updateProductVariant);
router.get('/productsdetail', productController.getAllProductsWithVariants);
module.exports = router;
