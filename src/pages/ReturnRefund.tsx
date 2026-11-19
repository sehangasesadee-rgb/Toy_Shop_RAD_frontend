import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

interface OrderItem {
  productId: string | { _id?: string; productId?: string };
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderStatus: string;
  totalPrice: number;
  items: OrderItem[];
}

interface ReturnRequest {
  _id: string;
  orderId: string | Order | null;
  productId:
    | string
    | OrderItem
    | { _id?: string; productId?: string; name?: string }
    | null;
  quantity: number;
  reason: string;
  details: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

function ReturnRefund() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ReturnRequest[]>([]);

  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("authToken");


  const getProductId = (value: any): string => {
    if (!value) return "";

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return String(value._id || value.productId || "");
    }

    return "";
  };

  const getOrderId = (value: any): string => {
    if (!value) return "";

    if (typeof value === "string") {
      return value;
    }

    return String(value._id || "");
  };

  const getProductImage = (image?: string): string => {
  if (!image) return "";

  const imagePath = image.trim();

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  if (
    imagePath.startsWith("/uploads/") ||
    imagePath.startsWith("uploads/")
  ) {
    return `http://localhost:5000/${imagePath.replace(/^\/+/, "")}`;
  }

  return `${window.location.origin}/${imagePath.replace(/^\/+/, "")}`;
};

  useEffect(() => {
    const fetchReturnData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [ordersResponse, requestsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/orders/my-orders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:5000/api/returns/my-requests", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const ordersResult = await ordersResponse.json();
        const requestsResult = await requestsResponse.json();

        if (!ordersResponse.ok || !ordersResult.success) {
          throw new Error(
            ordersResult.message || "Unable to load your orders."
          );
        }

        if (!requestsResponse.ok || !requestsResult.success) {
          throw new Error(
            requestsResult.message || "Unable to load return requests."
          );
        }

        const deliveredOrders: Order[] = (ordersResult.data || []).filter(
          (order: Order) => order.orderStatus === "DELIVERED"
        );

        setOrders(deliveredOrders);
        setRequests(requestsResult.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReturnData();
  }, [token]);

  const selectedOrderData = orders.find(
    (order) => order._id === selectedOrder
  );

  const selectedProductData = selectedOrderData?.items.find(
    (item) => getProductId(item.productId) === selectedProduct
  );

  const hasExistingRequest = (orderId: string, productId: string) => {
    return requests.some((request) => {
      const requestOrderId = getOrderId(request.orderId);
      const requestProductId = getProductId(request.productId);

      return (
        requestOrderId === orderId &&
        requestProductId === productId &&
        ["PENDING", "APPROVED"].includes(request.status)
      );
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !selectedOrder ||
      !selectedProduct ||
      !quantity ||
      !reason ||
      !details.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!token) {
      setError("Please login before submitting a return request.");
      return;
    }

    if (
      !selectedProductData ||
      quantity < 1 ||
      quantity > selectedProductData.quantity
    ) {
      setError("Please select a valid return quantity.");
      return;
    }

    if (hasExistingRequest(selectedOrder, selectedProduct)) {
      setError("A return request already exists for this product.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/returns",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: selectedOrder,
            productId: selectedProduct,
            quantity: Number(quantity),
            reason,
            details: details.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to submit return request."
        );
      }

      setRequests((previousRequests) => [
        result.data,
        ...previousRequests,
      ]);

      setMessage("Your return request was submitted successfully! 💗");

      setSelectedOrder("");
      setSelectedProduct("");
      setQuantity(1);
      setReason("");
      setDetails("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="info-page">
      <Link to="/" className="info-back">
        ← Back to Home
      </Link>

      <section className="info-hero returns-hero">
        <span className="info-hero-icon">↪</span>
        <h1>Return & Refund</h1>
        <small>
          We want every TootieToys shopping experience to be a happy one.
        </small>
      </section>

      <section className="return-form-section">
        <div className="return-form-heading">
          <h2>Request a Return</h2>
          <p>Let us know what went wrong. We are here to help!</p>
        </div>

        {loading ? (
          <p className="return-info-message">
            Loading your orders...
          </p>
        ) : !token ? (
          <div className="return-info-message">
            <p>Please login to request a return.</p>
            <Link to="/login" className="info-action">
              Login →
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="return-error-message">
                {error}
              </div>
            )}

            {message && (
              <div className="return-success-message">
                {message}
              </div>
            )}

            {orders.length === 0 ? (
              <div className="return-info-message">
                <p>
                  You don't have any delivered orders available for return.
                </p>
                <Link to="/my-orders" className="info-action">
                  View My Orders →
                </Link>
              </div>
            ) : (
              <form className="return-form" onSubmit={handleSubmit}>
                <div className="return-form-group">
                  <label htmlFor="returnOrder">
                    Select Delivered Order
                  </label>

                  <select
                    id="returnOrder"
                    value={selectedOrder}
                    onChange={(e) => {
                      setSelectedOrder(e.target.value);
                      setSelectedProduct("");
                      setQuantity(1);
                      setError("");
                    }}
                    required
                  >
                    <option value="">Choose an order</option>

                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        Order #{order._id.slice(-6)} — Rs.{" "}
                        {order.totalPrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOrderData && (
                  <div className="return-product-selection">
                    <h3>Select Product</h3>

                    {selectedOrderData.items.map((item) => {
                      const productId = getProductId(item.productId);

                      const alreadyRequested = hasExistingRequest(
                        selectedOrderData._id,
                        productId
                      );

                      const isSelected = selectedProduct === productId;

                      return (
                        <label
                          key={productId}
                          htmlFor={`return-product-${productId}`}
                          className={`return-product-card ${
                            isSelected ? "selected" : ""
                          } ${alreadyRequested ? "disabled" : ""}`}
                          onClick={() => {
                            if (!alreadyRequested) {
                              setSelectedProduct(productId);
                              setQuantity(1);
                              setError("");
                            }
                          }}
                        >
                          <input
                            id={`return-product-${productId}`}
                            type="radio"
                            name="returnProduct"
                            value={productId}
                            checked={isSelected}
                            disabled={alreadyRequested}
                            onChange={() => {
                              setSelectedProduct(productId);
                              setQuantity(1);
                              setError("");
                            }}
                          />

                          {item.image && (
  <img
    src={getProductImage(item.image)}
    alt={item.name}
    className="return-product-image"
    onError={(e) => {
      console.error("Product image failed to load:", e.currentTarget.src);
      e.currentTarget.style.display = "none";
    }}
  />
)}

                          <div className="return-product-info">
                            <h4>{item.name}</h4>

                            <p>
                              Price: Rs. {item.price.toLocaleString()}
                            </p>

                            <p>
                              Purchased Quantity: {item.quantity}
                            </p>

                            {alreadyRequested && (
                              <span className="return-existing-label">
                                Return request already submitted
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {selectedProductData && (
                  <div className="return-form-group">
                    <label htmlFor="returnQuantity">
                      Return Quantity
                    </label>

                    <select
                      id="returnQuantity"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Number(e.target.value))
                      }
                      required
                    >
                      {Array.from(
                        { length: selectedProductData.quantity },
                        (_, i) => i + 1
                      ).map((number) => (
                        <option key={number} value={number}>
                          {number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="return-form-group">
                  <label htmlFor="returnReason">
                    Reason for Return
                  </label>

                  <select
                    id="returnReason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="">Choose a reason</option>
                    <option value="DAMAGED_PRODUCT">
                      Damaged Product
                    </option>
                    <option value="WRONG_PRODUCT">
                      Wrong Product Received
                    </option>
                    <option value="MISSING_PARTS">
                      Missing Parts
                    </option>
                    <option value="QUALITY_ISSUE">
                      Quality Issue
                    </option>
                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </div>

                <div className="return-form-group">
                  <label htmlFor="returnDetails">
                    Describe Your Problem
                  </label>

                  <textarea
                    id="returnDetails"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please explain why you want to return this product..."
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="return-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Return Request "}
                </button>
              </form>
            )}
          </>
        )}
      </section>

      {token && requests.length > 0 && (
        <section className="return-history-section">
          <h2>My Return Requests</h2>

          <div className="return-history-list">
            {requests.map((request) => {
              const requestOrderId = getOrderId(request.orderId);

              const requestOrder =
                typeof request.orderId === "object"
                  ? request.orderId
                  : null;

              const productName =
                typeof request.productId === "object"
                  ? request.productId?.name || "Product"
                  : "Product";

              return (
                <article
                  className="return-history-card"
                  key={request._id}
                >
                  <div>
                    <h3>
                      Order #{requestOrderId.slice(-6)}
                    </h3>

                    <p>
                      <strong>Product:</strong> {productName}
                    </p>

                    <p>
                      <strong>Quantity:</strong> {request.quantity}
                    </p>

                    <p>
                      <strong>Reason:</strong>{" "}
                      {request.reason.replaceAll("_", " ")}
                    </p>

                    <p>{request.details}</p>

                    {requestOrder && (
                      <small>
                        Order Total: Rs.{" "}
                        {requestOrder.totalPrice.toLocaleString()}
                      </small>
                    )}
                  </div>

                  <span
                    className={`return-status ${request.status.toLowerCase()}`}
                  >
                    {request.status}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default ReturnRefund;
