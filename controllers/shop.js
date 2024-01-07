const Product = require("../models/product");


exports.getProduct = (req, res, next) => {
  Product.fetchAll()
    .then((result) => {
      res.render("shop/product-list", {
        prods: result,
        pageTitle: "All Products",
        path: "/products",
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
      });
    })
    .catch((err) => {
      // Hata durumunda hatayı konsola yazdırın veya uygun bir hata sayfasına yönlendirme yapabilirsiniz.
      console.error(err);
      // veya res.render('error', { pageTitle: 'Hata', errorMessage: 'Beklenmeyen bir hata oluştu.' });
    });

  // İkinci yol
  // modelProduct
  //   .findAll({ where: { id: productId } })
  //   .then((result) => {
  //     res.render("shop/product-detail", {
  //       product: result[0],
  //       pageTitle: result[0].title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((result) => {
      res.render("shop/index", {
        prods: result,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      // Burada addToCart methodunu kullanmamızın sebebi, bu methodun içinde cartItem'ı kontrol ediyoruz.
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));

  // const productId = req.body.productId;
  // let fetchedCart;
  // let newQuantity = 1;

  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: productId } });
  //   })
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }

  //     return modelProduct.findByPk(productId);
  //   })
  //   .then((product) => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity },
  //     });
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => res.redirect("/orders"))
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrder()
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .deleteItemFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};
