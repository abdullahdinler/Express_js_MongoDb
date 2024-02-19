const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRouts = require("./routes/auth");
const errorController = require("./controllers/error");
const User = require("./models/user");
const session = require("express-session");
const MongooDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");



// MongoDB URI - connection string
const MONGOODB_URI =
  "mongodb+srv://abdullahdinler:FRAsEZWWRxTLhZNB@cluster0.res2lma.mongodb.net/shop";

// Session store - MongoDB
const store = new MongooDbStore({
  uri: MONGOODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf(); // to use csrf protection in the app

// Middleware - body-parser and session
app.use(express.static(path.join(__dirname, "public"))); // to serve static files. css, js, images etc
app.use(bodyParser.urlencoded({ extended: false })); // to parse the body of the request
app.use(
  session({
    secret: "my secret you not secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
); // to use session middleware with express
app.use(csrfProtection); // to use csrf protection
app.use(flash()); // to use flash messages



// Middleware - user
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// Middleware - locals
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken(); // to use csrf token in the views
  next();
});

// EJS template engine
app.set("view engine", "ejs"); // to set the view engine
app.set("views", "views"); // to set the views folder

// Middleware - routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRouts);
app.use(errorController.get404);

// Connect to MongoDB and start the server
mongoose
  .connect(MONGOODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
