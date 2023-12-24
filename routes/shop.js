const express = require("express");
const router = express.Router();
const path = require("path");
const shopControler = require("../controllers/shop");

router.get("/", shopControler.getIndex);
router.get("/products", shopControler.getProduct);
router.get('/products/:productId' , shopControler.getProductDetail);
// router.get("/cart", shopControler.getCart);
// router.post("/cart", shopControler.postCart);
// router.post("/cart-delete-item", shopControler.postCartDeleteProduct);
// router.get("/checkout", shopControler.getCheckout);
// router.get("/orders", shopControler.getOrders);
// router.post("/create-order", shopControler.postOrder)

module.exports = router;
