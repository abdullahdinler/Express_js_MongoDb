const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db
      .collection("users")
      .insertOne(this)
      .then(() => {
        console.log("Saved user");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  addToCart(product) {
    const db = getDb();

    ///Bunu yapmamızın sebebi, eğer daha önce bu ürünü eklemişsek, sadece quantity'sini arttırmak istiyoruz.
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...(this.cart?.items || [])]; // Eğer cart boşsa, items'ı boş bir array olarak alıyoruz. Eğer cart boş değilse, cart'ın items'larını alıyoruz.

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    // Yeni bir cart oluşturuyoruz.
    const updatedCart = {
      items: updatedCartItems,
    };

    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db = getDb();
    // Burada productsIds array'ini oluşturuyoruz. Bu array'de sadece product'ların id'leri olacak.
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });

    // Burada productIds array'indeki id'lere sahip olan product'ları buluyoruz. Bu product'ları bulurken, quantity'lerini de ekliyoruz. Bunu da map ile yapıyoruz. Bu sayede, product'ın quantity'sini de eklemiş oluyoruz. Bunu da product'ın içine ekliyoruz.
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        // products array'indeki her bir product için, quantity'lerini ekliyoruz.
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              // product'ın quantity'sini ekliyoruz.
              return i.productId.toString() === p._id.toString(); // product'ın id'si ile cartItem'ın productId'si eşitse, o cartItem'ın quantity'sini döndürüyoruz.
            }).quantity,
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter((items) => {
      return items.productId.toString() !== productId.toString();
    });
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then(() => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrder() {
    const db = getDb();
    return db
      .collection("orders")
      .find({"user._id": new mongodb.ObjectId(this._id)})
      .toArray()
      .then((orders) => {
        return orders;
      })
      .catch((err) => console.log(err));
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
