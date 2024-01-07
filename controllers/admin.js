const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const userId = req.user._id;

  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    null,
    userId
  );

  product
    .save()
    .then(() => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err)); //Burada user'ın createProduct metodu ile product oluşturulur. Bu metot sequelize tarafından otomatik olarak oluşturulur.
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect("/");
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) return res.redirect("/");
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;

  const updatedProduct = new Product(
    title,
    price,
    description,
    imageUrl,
    productId
  );

  updatedProduct
    .update()
    .then(() => {
      console.log("Update successful");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      // Handle the error if needed
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId; //Burada productId ile gelen değer productId olarak alınır

  // Destroy metodu ile silme işlemi yapılır. Burada id'si prodId olan product silinir.
  Product.deleteById(prodId)
    .then(() => {
      console.log("Deleted Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
