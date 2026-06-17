const mongoose = require("mongoose");
const {
  validateDeliveryDetails,
  validateCartItems,
  validateAdminStatusUpdate,
} = require("../utils/orderValidation");

const createOrderController = ({ orderModel, productModel, razorpay }) => {
  const buildOrderItems = async (cartItems) => {
    const orderItems = [];
    let totalAmount = 0;

    for (const { productId, quantity } of cartItems) {
      const product = await productModel.findById(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }
      if (product.status !== "AVAILABLE") {
        throw new Error(`"${product.name}" is not available for ordering`);
      }

      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        category: product.category,
        image: product.image,
        price: product.price,
        quantity,
        itemTotal,
      });
    }

    return { orderItems, totalAmount };
  };

  const createPaymentOrder = async (req, res) => {
    try {
      const { items, deliveryDetails } = req.body;

      const deliveryErrors = validateDeliveryDetails(deliveryDetails);
      if (deliveryErrors.errors.length) {
        return res.status(400).json({
          message: deliveryErrors.errors.join(", "),
          alert: false,
        });
      }

      const { errors, sanitized } = validateCartItems(items);
      if (errors.length) {
        return res.status(400).json({ message: errors.join(", "), alert: false });
      }

      const { orderItems, totalAmount } = await buildOrderItems(sanitized);
      const amountInPaise = Math.round(totalAmount * 100);

      const order = await orderModel.create({
        user: req.user._id,
        userDetails: {
          name: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim(),
          email: req.user.email,
          phone: deliveryDetails.phone,
        },
        deliveryDetails: {
          fullName:
            deliveryDetails.fullName ||
            `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim(),
          phone: deliveryDetails.phone,
          addressLine1: deliveryDetails.addressLine1,
          addressLine2: deliveryDetails.addressLine2 || "",
          city: deliveryDetails.city || "Chandausi",
          state: deliveryDetails.state || "UP",
          pincode: deliveryDetails.pincode || "",
          landmark: deliveryDetails.landmark || "",
        },
        items: orderItems,
        totalAmount,
        status: "DRAFT",
        payment: {
          provider: "RAZORPAY",
          status: "PENDING",
          amount: totalAmount,
          currency: "INR",
        },
      });

      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order._id.toString(),
        notes: {
          orderId: order._id.toString(),
          userId: req.user._id.toString(),
        },
      });

      order.payment.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.json({
        message: "Payment order created",
        alert: true,
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
        customerName: order.userDetails.name,
        customerEmail: order.userDetails.email,
        customerPhone: deliveryDetails.phone,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message || "Failed to create payment order",
        alert: false,
      });
    }
  };

  const getMyOrders = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ user: req.user._id })
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders", alert: false });
    }
  };

  const getAllOrders = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ status: { $ne: "DRAFT" } })
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders", alert: false });
    }
  };

  const getOrderById = async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID", alert: false });
      }

      const order = await orderModel.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found", alert: false });
      }

      const isOwner = order.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied", alert: false });
      }

      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch order", alert: false });
    }
  };

  const updateOrderStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const validation = validateAdminStatusUpdate(status);

      if (!validation.valid) {
        return res.status(400).json({ message: validation.message, alert: false });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID", alert: false });
      }

      const order = await orderModel.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found", alert: false });
      }

      if (order.status === "DRAFT") {
        return res.status(400).json({
          message: "Cannot update status of a draft order",
          alert: false,
        });
      }

      order.status = status;
      await order.save();

      res.json({
        message: "Order status updated",
        alert: true,
        data: order,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to update order status", alert: false });
    }
  };

  return {
    createPaymentOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
  };
};

module.exports = createOrderController;
