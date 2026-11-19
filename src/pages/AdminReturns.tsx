
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

interface ReturnUser {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface ReturnOrder {
  _id: string;
  customerName?: string;
  phone?: string;
  totalPrice?: number;
  orderStatus?: string;
}

interface ReturnProduct {
  _id?: string;
  name?: string;
  image?: string;
  price?: number;
}

interface ReturnRequest {
  _id: string;
  userId?: ReturnUser | string;
  orderId?: ReturnOrder | string;
  productId?: ReturnProduct | string;
  quantity: number;
  reason: string;
  details: string;
  image?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const API_URL = "http://localhost:5000";

const AdminReturns = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const navigate = useNavigate();

  const statuses = ["PENDING", "APPROVED", "REJECTED"];

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
      return `${API_URL}/${imagePath.replace(/^\/+/, "")}`;
    }

    return imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
  };

  useEffect(() => {
    const fetchReturnRequests = async () => {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!token) {
        navigate("/login");
        return;
      }

      if (user?.role !== "ADMIN") {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/returns/all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load return requests."
          );
        }

        setRequests(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReturnRequests();
  }, [navigate]);

  const handleStatusChange = async (
    requestId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setUpdatingId(requestId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/returns/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update return status."
        );
      }

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status: data.data.status,
              }
            : request
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getCustomerName = (
    user: ReturnUser | string | undefined
  ): string => {
    if (!user || typeof user === "string") {
      return "Customer";
    }

    return user.fullName || "Customer";
  };

  const getCustomerEmail = (
    user: ReturnUser | string | undefined
  ): string => {
    if (!user || typeof user === "string") {
      return "Not available";
    }

    return user.email || "Not available";
  };

  const getOrderId = (
    order: ReturnOrder | string | undefined
  ): string => {
    if (!order) return "";

    return typeof order === "string"
      ? order
      : order._id;
  };

  const getProductName = (
    product: ReturnProduct | string | undefined
  ): string => {
    if (!product || typeof product === "string") {
      return "Product";
    }

    return product.name || "Product";
  };

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED"
  ).length;

  if (loading) {
    return (
      <div className="admin-orders-message">
        <span className="admin-loading-icon">🧸</span>
        <p>Loading return requests...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">

        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              TOOTIETOYS • ADMIN PANEL
            </span>

            <h1>
              Return Requests <span>♡</span>
            </h1>

            <p className="admin-orders-subtitle">
              Review and manage customer return requests!
            </p>
          </div>

          <div className="admin-heading-decoration">
            🎁
          </div>
        </div>

        <div className="admin-dashboard-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
          >
            📦 Manage Orders →
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
          >
            🧸 Manage Products →
          </button>
        </div>

        {error && (
          <div className="return-error-message">
            {error}
          </div>
        )}

        <div className="admin-orders-summary">

          <div className="admin-summary-card total-card">
            <div className="summary-icon">📋</div>
            <div>
              <h3>Total Requests</h3>
              <p>{requests.length}</p>
            </div>
          </div>

          <div className="admin-summary-card pending-card">
            <div className="summary-icon">⏳</div>
            <div>
              <h3>Pending</h3>
              <p>{pendingCount}</p>
            </div>
          </div>

          <div className="admin-summary-card confirmed-card">
            <div className="summary-icon">✅</div>
            <div>
              <h3>Approved</h3>
              <p>{approvedCount}</p>
            </div>
          </div>

          <div className="admin-summary-card cancelled-card">
            <div className="summary-icon">❌</div>
            <div>
              <h3>Rejected</h3>
              <p>{rejectedCount}</p>
            </div>
          </div>

        </div>

        <div className="admin-orders-section-title">
          <div>
            <h2>
              Customer Return Requests <span>♡</span>
            </h2>

            <p>Review each request carefully.</p>
          </div>

          <span className="admin-order-count">
            {requests.length} Requests
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="admin-empty-orders">
            <div>🧸</div>
            <h2>No return requests yet!</h2>
            <p>
              Customer return requests will appear here.
            </p>
          </div>
        ) : (
          <div className="admin-orders-list">

            {requests.map((request) => {
              const product =
                typeof request.productId === "object" &&
                request.productId !== null
                  ? request.productId
                  : undefined;

              const productImage = getProductImage(
                product?.image
              );

              const orderId = getOrderId(request.orderId);

              return (
                <div
                  className="admin-order-card"
                  key={request._id}
                >

                  <div className="admin-order-header">
                    <div className="admin-order-heading-left">
                      <div className="admin-order-bag">
                        ↩️
                      </div>

                      <div>
                        <h3>
                          Return #{request._id.slice(-6)}
                        </h3>

                        <p>
                          📅{" "}
                          {new Date(
                            request.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`return-status ${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="admin-order-content">

                    <div className="admin-customer-details">
                      <h4>👤 Customer Details</h4>

                      <p>
                        <strong>
                          {getCustomerName(request.userId)}
                        </strong>
                      </p>

                      <p>
                        ✉️ {getCustomerEmail(request.userId)}
                      </p>

                      <p>
                        📦 Order #{orderId.slice(-6)}
                      </p>
                    </div>

                    <div className="admin-order-items">
                      <h4>🧸 Returned Product</h4>

                      <div className="admin-order-item">
                        <div className="admin-item-info">

                          {productImage && (
                            <img
                            src={productImage}
                            alt={getProductName(request.productId)}
                            className="admin-product-image"
                            loading="lazy"
                            />
                          )}

                          <div>
                            <p>
                              {getProductName(request.productId)}
                            </p>

                            <small>
                              Quantity: {request.quantity}
                            </small>
                          </div>

                        </div>
                      </div>

                      <h4>📝 Return Reason</h4>

                      <p>
                        {request.reason.replaceAll("_", " ")}
                      </p>

                      <p>
                        <strong>Customer Details:</strong>
                      </p>

                      <p>{request.details}</p>
                    </div>

                    <div className="admin-order-actions">
                      <div className="admin-status-control">
                        <label>
                          Update Request Status
                        </label>

                        <div className="admin-status-row">
                          <select
                            value={request.status}
                            disabled={
                              updatingId === request._id ||
                              request.status !== "PENDING"
                            }
                            onChange={(e) => {
                              const newStatus = e.target.value;

                              if (
                                newStatus === "APPROVED" ||
                                newStatus === "REJECTED"
                              ) {
                                handleStatusChange(
                                  request._id,
                                  newStatus
                                );
                              }
                            }}
                          >
                            {statuses.map((status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            ))}
                          </select>

                          {updatingId === request._id && (
                            <span className="admin-updating">
                              Updating...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="admin-card-bottom">
                    Made with love for little smiles{" "}
                    <span>♡</span>
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      <footer className="admin-orders-footer">
        <div className="admin-footer-message">
          <span>✨</span>
          Thank you for being a part of TootieToys!
          <span>♡</span>
        </div>

        <div className="admin-footer-teddy">
          <img
            src="/teddy-hero.png"
            alt="Cute TootieToys teddy bear"
          />
        </div>

        <div className="admin-footer-gift">
          🎁
        </div>
      </footer>
    </div>
  );
};

export default AdminReturns;
