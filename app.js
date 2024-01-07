const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

// Middleware - body-parser
app.use(express.static(path.join(__dirname, "public"))); // to serve static files. css, js, images etc
app.use(bodyParser.urlencoded({ extended: false })); // to parse the body of the request

// EJS template engine
app.set("view engine", "ejs"); // to set the view engine
app.set("views", "views"); // to set the views folder

// User'ı request'e eklemek için kullanılan middleware. Bu sayede her request'te user'ı kullanabiliriz.
app.use((req, res, next) => {
  User.findById('65897d4d88a1dda22aa6a577')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
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
