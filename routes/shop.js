const express = require("express");
const router = express.Router();
const shopControler = require("../controllers/shop");

router.get("/", shopControler.getIndex);
router.get("/products", shopControler.getProduct);
router.get('/products/:productId' , shopControler.getProductDetail);
//router.get("/cart", shopControler.getCart);
router.post("/users", shopControler.postCart);
// router.post("/cart-delete-item", shopControler.postCartDeleteProduct);
// router.get("/checkout", shopControler.getCheckout);
// router.get("/orders", shopControler.getOrders);
// router.post("/create-order", shopControler.postOrder)

module.exports = router;
