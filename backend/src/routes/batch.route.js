const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch.controller');


router.get('/batches', batchController.getAllBatches);
router.post('/batches/add', batchController.createBatch);

module.exports = router;
