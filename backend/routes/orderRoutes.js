const express = require("express");
const createOrderController = require("../controllers/orderController");

const createOrderRoutes = ({
  orderModel,
  productModel,
  stripe,
  protectRoute,
  adminOnly,
  customerOnly,
}) => {
  const router = express.Router();
  const controller = createOrderController({ orderModel, productModel, stripe });

  router.post(
    "/create-checkout-session",
    protectRoute,
    customerOnly,
    controller.createCheckoutSession
  );
  router.get("/my-orders", protectRoute, customerOnly, controller.getMyOrders);
  router.get("/admin/all", protectRoute, adminOnly, controller.getAllOrders);
  router.put(
    "/admin/:id/status",
    protectRoute,
    adminOnly,
    controller.updateOrderStatus
  );
  router.get("/:id", protectRoute, controller.getOrderById);

  return router;
};

module.exports = createOrderRoutes;
