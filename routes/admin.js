const express = require("express");
const router = express.Router();
const adminControler = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

router.get("/products", isAuth, adminControler.getProducts);
router.get("/add-product", isAuth, adminControler.getAddProduct);
router.post("/add-product", isAuth, adminControler.postAddProduct);

router.get("/edit-product/:productId", isAuth, adminControler.getEditProduct);
router.post("/edit-product", isAuth, adminControler.postEditProduct);
router.post("/delete-product", isAuth, adminControler.postDeleteProduct);

module.exports = router;
