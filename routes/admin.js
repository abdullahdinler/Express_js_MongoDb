const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../util/path');
const adminControler = require('../controllers/admin');

router.get('/products', adminControler.getProducts);
router.get('/add-product', adminControler.getAddProduct );

router.post('/add-product', adminControler.postAddProduct);
router.get('/edit-product/:productId', adminControler.getEditProduct);
router.post('/edit-product', adminControler.postEditProduct);
// router.post('/delete-product', adminControler.postDeleteProduct);

module.exports = router;
