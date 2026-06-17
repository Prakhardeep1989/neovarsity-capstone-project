const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    name: String,
    category: String,
    image: String,
    price: Number,
    quantity: Number,
    itemTotal: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    userDetails: {
      name: String,
      email: String,
      phone: String,
    },
    deliveryDetails: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "ORDERED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },
    payment: {
      provider: { type: String, default: "RAZORPAY" },
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      method: String,
      methodDetail: String,
      amount: Number,
      currency: String,
      paidAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
