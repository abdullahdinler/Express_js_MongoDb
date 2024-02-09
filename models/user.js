const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    // Burada cart'ın içindeki items'ın bir array olduğunu belirtiyoruz.
    items: [
      {
        // Burada items'ın içindeki her bir item'ın bir product'a ait olduğunu belirtiyoruz.
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // Burada items'ın içindeki her bir item'ın quantity'sinin bir number olduğunu belirtiyoruz.
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
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
      productId: product._id,
      quantity: newQuantity,
    });
  }

  // Yeni bir cart oluşturuyoruz.
  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((items) => {
    return items.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();

};

userSchema.methods.clearCart = function () { 
  this.cart = { items: [] };
  return this.save();
};


module.exports = mongoose.model("User", userSchema);
