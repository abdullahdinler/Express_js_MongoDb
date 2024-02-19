const express = require("express");
const router = express.Router();
const shopControler = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");



router.get("/", shopControler.getIndex);
router.get("/products", shopControler.getProduct);
router.get('/products/:productId' , shopControler.getProductDetail);
router.get("/cart", isAuth, shopControler.getCart);
router.post("/users", isAuth, shopControler.postCart);
router.post("/cart-delete-item", isAuth, shopControler.postCartDeleteProduct);
router.get("/orders", isAuth, shopControler.getOrders);
router.post("/create-order", isAuth, shopControler.postOrder);

module.exports = router;
 