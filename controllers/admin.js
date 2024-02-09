const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const userId = req.user;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: userId,
  });

  product
    .save()
    .then(() => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err)); //Burada user'ın createProduct metodu ile product oluşturulur. Bu metot sequelize tarafından otomatik olarak oluşturulur.
};

exports.getProducts = (req, res, next) => {
  Product.find().populate("userId", "name -_id") // populate ile userId'yi dolduruyoruz. İkinci parametre ile de name'i alıyoruz. _id'yi almamak için -_id yazıyoruz.
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn
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
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;

    await Product.findByIdAndUpdate(
      productId,
      { title, price, description, imageUrl },
      { new: true } // Bu, güncellenmiş belgeyi döndürmek için kullanılır
    );

    console.log("Update successful");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    // Handle the error if needed
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;

    // Silme işlemi
    await Product.findByIdAndDelete(prodId);

    console.log("Deleted Product");
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error deleting product:", error);
    // Hata durumunda kullanıcıya bilgi verilebilir veya loglanabilir
    res.status(500).send("Internal Server Error"); // Örnek: 500 Internal Server Error
  }
};
