const express = require("express");
const createOrderController = require("../controllers/orderController");
const createPaymentController = require("../controllers/paymentController");

const createOrderRoutes = ({
  orderModel,
  productModel,
  razorpay,
  protectRoute,
  adminOnly,
  customerOnly,
}) => {
  const router = express.Router();
  const orderController = createOrderController({
    orderModel,
    productModel,
    razorpay,
  });
  const paymentController = createPaymentController({ orderModel, razorpay });

  router.post(
    "/create-payment-order",
    protectRoute,
    customerOnly,
    orderController.createPaymentOrder
  );
  router.post(
    "/verify-payment",
    protectRoute,
    customerOnly,
    paymentController.verifyPayment
  );
  router.get("/my-orders", protectRoute, customerOnly, orderController.getMyOrders);
  router.get("/admin/all", protectRoute, adminOnly, orderController.getAllOrders);
  router.put(
    "/admin/:id/status",
    protectRoute,
    adminOnly,
    orderController.updateOrderStatus
  );
  router.get("/:id", protectRoute, orderController.getOrderById);

  return router;
};

module.exports = createOrderRoutes;
