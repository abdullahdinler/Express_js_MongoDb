const Product = require("../models/product");
const modelCart = require("../models/cart");
const Order = require("../models/order");

exports.getProduct = (req, res, next) => {
  Product
    .fetchAll()
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
 Product
    .findById(productId)
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
  Product
    .fetchAll()
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
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render("shop/cart", {
            pageTitle: "Cart",
            path: "/cart",
            products: products,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }

      return modelProduct.findByPk(productId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch((err) => console.log(err));
    })
    .then((result) => fetchedCart.setProducts(null))
    .then(result => res.redirect("/orders"))
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']}).then((orders) => {
    res.render("shop/orders", {
      pageTitle: "Orders",
      path: "/orders",
      orders: orders
    });
    
  }).catch((err) => {
    console.log(err)
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
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};
