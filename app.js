const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const mongoConnect = require("./util/database").mongoConnect;

// Middleware - body-parser
app.use(express.static(path.join(__dirname, "public"))); // to serve static files. css, js, images etc
app.use(bodyParser.urlencoded({ extended: false })); // to parse the body of the request

// EJS template engine
app.set("view engine", "ejs"); // to set the view engine
app.set("views", "views"); // to set the views folder

// User'ı request'e eklemek için kullanılan middleware. Bu sayede her request'te user'ı kullanabiliriz.
app.use((req, res, next) => {
  // User.findByPk(1)
  //   .then((user) => {
  //     req.user = user; // user'ı request'e ekledik.
  //     next();
  //   })
  //   .catch((err) => console.log(err));
  next();
});

// Middleware - routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoConnect(() => {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
