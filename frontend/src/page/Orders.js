import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  fetchAllOrders,
  fetchMyOrders,
  formatDeliveryAddress,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
  updateOrderStatus,
} from "../utility/orderApi";

const ADMIN_STATUS_OPTIONS = [
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const statusColor = (status) => {
  const map = {
    DRAFT: "bg-slate-400",
    ORDERED: "bg-blue-500",
    PREPARING: "bg-yellow-500",
    OUT_FOR_DELIVERY: "bg-purple-500",
    DELIVERED: "bg-green-600",
    CANCELLED: "bg-red-500",
    PAID: "bg-green-600",
    PENDING: "bg-orange-400",
    FAILED: "bg-red-500",
  };
  return map[status] || "bg-slate-400";
};

const CustomerOrders = ({ orders }) => {
  if (!orders.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg">You have no orders yet.</p>
        <a href="/menu" className="text-red-500 underline mt-2 inline-block">
          Browse Menu
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-lg shadow p-4 flex flex-col gap-3"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500">Order ID</p>
              <p className="font-mono text-sm font-semibold">
                #{String(order._id).slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{formatOrderDate(order.createdAt)}</p>
              <div className="flex gap-2 mt-1 justify-end">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(order.status)}`}
                >
                  {formatOrderStatus(order.status)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(order.payment?.status)}`}
                >
                  {formatPaymentStatus(order.payment?.status)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Items</p>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-100">
                <span>
                  {item.name}{" "}
                  <span className="text-slate-400">× {item.quantity}</span>
                </span>
                <span className="font-medium">₹{item.itemTotal}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-1">
            <div>
              <p className="text-xs text-slate-500">Delivery</p>
              <p className="text-sm text-slate-600">
                {formatDeliveryAddress(order.deliveryDetails)}
              </p>
            </div>
            <p className="font-bold text-lg">
              <span className="text-red-500">₹</span>
              {order.totalAmount}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminOrders = ({ orders, onStatusUpdate }) => {
  const handleStatusChange = async (orderId, newStatus) => {
    await onStatusUpdate(orderId, newStatus);
  };

  if (!orders.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="px-3 py-3 text-left">Order ID</th>
            <th className="px-3 py-3 text-left">Customer</th>
            <th className="px-3 py-3 text-left">Email</th>
            <th className="px-3 py-3 text-left">Amount</th>
            <th className="px-3 py-3 text-left">Payment</th>
            <th className="px-3 py-3 text-left">Status</th>
            <th className="px-3 py-3 text-left">Date</th>
            <th className="px-3 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3 font-mono">
                #{String(order._id).slice(-8).toUpperCase()}
              </td>
              <td className="px-3 py-3">
                {order.userDetails?.name ||
                  `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim()}
              </td>
              <td className="px-3 py-3 text-slate-600">
                {order.userDetails?.email || order.user?.email}
              </td>
              <td className="px-3 py-3 font-semibold">₹{order.totalAmount}</td>
              <td className="px-3 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(order.payment?.status)}`}
                >
                  {formatPaymentStatus(order.payment?.status)}
                </span>
              </td>
              <td className="px-3 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(order.status)}`}
                >
                  {formatOrderStatus(order.status)}
                </span>
              </td>
              <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                {formatOrderDate(order.createdAt)}
              </td>
              <td className="px-3 py-3">
                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                  <select
                    className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusChange(order._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Update…</option>
                    {ADMIN_STATUS_OPTIONS.filter((s) => s !== order.status).map(
                      (s) => (
                        <option key={s} value={s}>
                          {formatOrderStatus(s)}
                        </option>
                      )
                    )}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Orders = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const isAdmin = Boolean(user.isAdmin);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = isAdmin
        ? await fetchAllOrders(user.token)
        : await fetchMyOrders(user.token);
      setOrders(data);
    } catch {
      toast("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.email) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [user.email, user.token, isAdmin]);

  const handleStatusUpdate = async (orderId, status) => {
    const response = await updateOrderStatus(orderId, status, user.token);
    toast(response.message);
    if (response.alert) {
      await loadOrders();
    }
  };

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        {isAdmin ? "All Orders" : "My Orders"}
      </h1>
      <p className="text-slate-500 mb-6">
        {isAdmin
          ? "Manage and update order statuses for all customers."
          : "Track your order history and delivery status."}
      </p>

      {loading ? (
        <p className="text-center py-10 text-slate-500">Loading orders…</p>
      ) : isAdmin ? (
        <AdminOrders orders={orders} onStatusUpdate={handleStatusUpdate} />
      ) : (
        <CustomerOrders orders={orders.filter((o) => o.status !== "DRAFT")} />
      )}
    </div>
  );
};

export default Orders;
