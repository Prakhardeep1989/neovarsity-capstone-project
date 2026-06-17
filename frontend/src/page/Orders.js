import React, { useEffect, useMemo, useState } from "react";
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
  getOrderCustomerName,
  updateOrderStatus,
} from "../utility/orderApi";

const ADMIN_STATUS_TRANSITIONS = {
  ORDERED: ["PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
};

const getAdminStatusOptions = (currentStatus) =>
  ADMIN_STATUS_TRANSITIONS[currentStatus] || [];

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

const isWithinDateRange = (dateStr, dateFrom, dateTo) => {
  const date = new Date(dateStr);
  if (dateFrom) {
    const from = new Date(dateFrom);
    from.setHours(0, 0, 0, 0);
    if (date < from) return false;
  }
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    if (date > to) return false;
  }
  return true;
};

const compareValues = (a, b, sortDir) => {
  if (a < b) return sortDir === "asc" ? -1 : 1;
  if (a > b) return sortDir === "asc" ? 1 : -1;
  return 0;
};

const SortableHeader = ({ label, field, sortField, sortDir, onSort }) => {
  const active = sortField === field;
  return (
    <th className="px-3 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-slate-200 font-semibold"
      >
        {label}
        <span className="text-xs opacity-80">
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const handleStatusChange = async (orderId, newStatus) => {
    await onStatusUpdate(orderId, newStatus);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "createdAt" || field === "totalAmount" ? "desc" : "asc");
    }
  };

  const filteredOrders = useMemo(() => {
    if (!dateFrom && !dateTo) return orders;
    return orders.filter((order) =>
      isWithinDateRange(order.createdAt, dateFrom, dateTo)
    );
  }, [orders, dateFrom, dateTo]);

  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      switch (sortField) {
        case "customer":
          return compareValues(
            getOrderCustomerName(a).toLowerCase(),
            getOrderCustomerName(b).toLowerCase(),
            sortDir
          );
        case "totalAmount":
          return compareValues(a.totalAmount ?? 0, b.totalAmount ?? 0, sortDir);
        case "payment":
          return compareValues(
            (a.payment?.status || "").toLowerCase(),
            (b.payment?.status || "").toLowerCase(),
            sortDir
          );
        case "status":
          return compareValues(
            (a.status || "").toLowerCase(),
            (b.status || "").toLowerCase(),
            sortDir
          );
        case "createdAt":
        default:
          return compareValues(
            new Date(a.createdAt).getTime(),
            new Date(b.createdAt).getTime(),
            sortDir
          );
      }
    });
    return sorted;
  }, [filteredOrders, sortField, sortDir]);

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
  };

  if (!orders.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="date-from" className="block text-xs text-slate-500 mb-1">
            From date
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="date-to" className="block text-xs text-slate-500 mb-1">
            To date
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1.5 text-sm"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={clearDateFilter}
            className="text-sm text-red-600 hover:text-red-700 px-2 py-1.5"
          >
            Clear dates
          </button>
        )}
        <p className="text-sm text-slate-500 ml-auto">
          Showing {sortedOrders.length} of {orders.length} orders
        </p>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white rounded-lg shadow">
          <p className="text-lg">No orders match the selected date range.</p>
          <button
            type="button"
            onClick={clearDateFilter}
            className="text-red-500 underline mt-2"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-3 py-3 text-left">Order ID</th>
                <SortableHeader
                  label="Customer"
                  field="customer"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th className="px-3 py-3 text-left">Email</th>
                <th className="px-3 py-3 text-left min-w-[200px]">Delivery Details</th>
                <SortableHeader
                  label="Amount"
                  field="totalAmount"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Payment"
                  field="payment"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  field="status"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Date"
                  field="createdAt"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th className="px-3 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => {
                const delivery = order.deliveryDetails;
                return (
                  <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3 font-mono align-top">
                      #{String(order._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-3 py-3 align-top">{getOrderCustomerName(order)}</td>
                    <td className="px-3 py-3 text-slate-600 align-top">
                      {order.userDetails?.email || order.user?.email}
                    </td>
                    <td className="px-3 py-3 align-top min-w-[200px]">
                      <div className="flex flex-col gap-0.5 text-slate-600">
                        {delivery?.fullName && (
                          <span className="font-medium text-slate-800">
                            {delivery.fullName}
                          </span>
                        )}
                        {delivery?.phone && (
                          <span className="text-xs">{delivery.phone}</span>
                        )}
                        <span className="text-xs leading-relaxed">
                          {formatDeliveryAddress(delivery) || "—"}
                        </span>
                        {delivery?.landmark && (
                          <span className="text-xs text-slate-400">
                            Landmark: {delivery.landmark}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold align-top">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(order.payment?.status)}`}
                      >
                        {formatPaymentStatus(order.payment?.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(order.status)}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap align-top">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {getAdminStatusOptions(order.status).length > 0 && (
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {getAdminStatusOptions(order.status).includes("DELIVERED") && (
                            <button
                              type="button"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1.5 rounded font-medium whitespace-nowrap"
                              onClick={() => handleStatusChange(order._id, "DELIVERED")}
                            >
                              Mark Delivered
                            </button>
                          )}
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
                            <option value="">More actions…</option>
                            {getAdminStatusOptions(order.status)
                              .filter((s) => s !== "DELIVERED")
                              .map((s) => (
                                <option key={s} value={s}>
                                  {formatOrderStatus(s)}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
