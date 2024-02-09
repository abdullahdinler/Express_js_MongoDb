const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

exports.getProduct = (req, res, next) => {
  Product.find()
    .then((result) => {
      res.render("shop/product-list", {
        prods: result,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductDetail = (req, res, next) => {
  const productId = req.params.productId; // productId is the name of the parameter in the route

  // Birinci yol
  Product.findById(productId)
    .then((product) => {
      // Eğer ürün bulunamazsa null kontrolü yapın
      if (!product) {
        console.error(`Ürün bulunamadı. productId: ${productId}`);
        // veya isteğe göre bir hata sayfasına yönlendirme yapabilirsiniz.
        // res.render('error', { pageTitle: 'Hata', errorMessage: 'Ürün bulunamadı.' });
        return;
      }

      // Eğer ürün bulunursa, sayfayı render edin
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      // Hata durumunda hatayı konsola yazdırın veya uygun bir hata sayfasına yönlendirme yapabilirsiniz.
      console.error(err);
      // veya res.render('error', { pageTitle: 'Hata', errorMessage: 'Beklenmeyen bir hata oluştu.' });
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((result) => {
      res.render("shop/index", {
        prods: result,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = async (req, res, next) => {
  try {
    // Kullanıcının ID'sini al
    const userId = req.user._id;

    // Kullanıcıyı bul ve sepetindeki ürünlerin detaylarını getir
    const user = await User.findById(userId).populate("cart.items.productId");

    // Eğer kullanıcı bulunamazsa 404 hatası gönder
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Her bir sepet ürününü uygun formata dönüştür
    const products = user.cart.items.map((item) => ({
      ...(item.productId && item.productId.toJSON()), // Ürün detaylarını JSON formatına çevir
      quantity: item.quantity, // Ürün miktarını ekle
    }));

    // "shop/cart" sayfasını render et ve ürünleri gönder
    res.render("shop/cart", {
      pageTitle: "Cart",
      path: "/cart",
      products: products,
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (error) {
    // Hata durumunda hatayı logla ve 500 Internal Server Error gönder
    console.error("Error fetching user cart:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      // Burada addToCart methodunu kullanmamızın sebebi, bu methodun içinde cartItem'ı kontrol ediyoruz.
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));

};

exports.postOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("cart.items.productId");

    if (!user) {
      return res.status(404).send("User not found");
    }

    const products = user.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } }; // i.productId._doc ile product'ın tüm bilgilerini alıyoruz.
    });

    const order = new Order({
      products: products,
      user: {
        name: user.name, // this.name yerine user.name kullanılmalı
        userId: userId, // this._id yerine userId kullanılmalı
      },
    });

    // Asenkron işlemleri beklemek için await eklenmeli
    await order.save();

    // Kullanıcının sepetini temizle
    req.user.clearCart();

    res.redirect("/orders");
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ "user.userId": userId }).populate(
      "products.product"
    );
    res.render("shop/orders", {
      pageTitle: "Orders",
      path: "/orders",
      orders: orders,
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.body.productId;

    // deleteItemFromCart fonksiyonunu kullanıcı üzerinde çağır ve işlemi bekleyerek tamamla
    await req.user.deleteItemFromCart(productId);

    // İşlem başarılıysa, alışveriş sepeti sayfasına yönlendir
    res.redirect("/cart");
  } catch (error) {
    // Hata durumunda hatayı logla ve kullanıcıya hata mesajı gönder
    console.error("Error deleting item from cart:", error);
    res.status(500).send("Internal Server Error");
  }
};
