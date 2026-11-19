import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

interface OrderInfo {
  _id: string;
  customerName?: string;
  phone?: string;
  totalPrice?: number;
}

interface Payment {
  _id: string;
  orderId: OrderInfo | string;
  userId: string | { _id: string; userName?: string };
  amount: number;
  paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  bankSlip?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState("");
  const [slipImage, setSlipImage] = useState("");
  const [slipLoading, setSlipLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!token) {
        navigate("/login");
        return;
      }

      if (user?.role !== "ADMIN") {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/payments/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load payments");
        }

        setPayments(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [navigate]);

  const handleVerifyPayment = async (paymentId: string) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to verify this payment?"
    );

    if (!confirmed) return;

    try {
      setVerifyingId(paymentId);

      const response = await fetch(
        `http://localhost:5000/api/payments/${paymentId}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Payment verification failed");
      }

      setPayments((previous) =>
        previous.map((payment) =>
          payment._id === paymentId
            ? {
                ...payment,
                paymentStatus: "PAID",
                verifiedAt: new Date().toISOString(),
              }
            : payment
        )
      );

      alert("Payment verified successfully! 💗");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setVerifyingId("");
    }
  };

  const handleCollectCash = async (paymentId: string) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    navigate("/login");
    return;
  }

  const confirmed = window.confirm(
    "Have you received the cash from this customer?"
  );

  if (!confirmed) return;

  try {
    setVerifyingId(paymentId);

    const response = await fetch(
      `http://localhost:5000/api/payments/${paymentId}/collect-cash`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update payment");
    }

    setPayments((previous) =>
      previous.map((payment) =>
        payment._id === paymentId
          ? {
              ...payment,
              paymentStatus: "PAID",
              verifiedAt: new Date().toISOString(),
            }
          : payment
      )
    );

    alert("Cash payment marked as paid! 💗");
  } catch (err) {
    alert(
      err instanceof Error ? err.message : "Something went wrong"
    );
  } finally {
    setVerifyingId("");
  }
};

  const handleViewSlip = async (paymentId: string) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSlipLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/payments/${paymentId}/slip`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load bank slip");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setSlipImage(imageUrl);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSlipLoading(false);
    }
  };

  const closeSlip = () => {
    if (slipImage) {
      URL.revokeObjectURL(slipImage);
    }

    setSlipImage("");
  };

  const pendingCount = payments.filter(
    (payment) => payment.paymentStatus === "PENDING"
  ).length;

  const paidCount = payments.filter(
    (payment) => payment.paymentStatus === "PAID"
  ).length;

  const bankTransferCount = payments.filter(
    (payment) => payment.paymentMethod === "BANK_TRANSFER"
  ).length;

  const totalRevenue = payments
    .filter((payment) => payment.paymentStatus === "PAID")
    .reduce((total, payment) => total + payment.amount, 0);

  const getOrderId = (payment: Payment) => {
    return typeof payment.orderId === "object"
      ? payment.orderId._id
      : payment.orderId;
  };

  const getCustomerName = (payment: Payment) => {
    return typeof payment.orderId === "object"
      ? payment.orderId.customerName || "Customer"
      : "Customer";
  };

  const getCustomerPhone = (payment: Payment) => {
    return typeof payment.orderId === "object"
      ? payment.orderId.phone || "N/A"
      : "N/A";
  };

  if (loading) {
    return (
      <div className="admin-payments-message">
        🧸 Loading payments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-payments-message">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-payments-page">
      <div className="admin-payments-container">


        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              TOOTIETOYS • ADMIN PANEL
            </span>

            <h1>
              Payment Management <span>♡</span>
            </h1>

            <p className="admin-orders-subtitle">
              Manage and verify customer payments.
            </p>
          </div>

          <div className="admin-heading-decoration">
            💳
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

          <button
            type="button"
            onClick={() => navigate("/admin/seasons")}
          >
            🎉 Season Management →
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/returns")}
          >
            ↩️ Manage Returns →
          </button>
        </div>


        <div className="admin-payments-summary">

          <div className="admin-payment-summary-card">
            <span>💳</span>
            <div>
              <h3>Total Payments</h3>
              <p>{payments.length}</p>
            </div>
          </div>

          <div className="admin-payment-summary-card">
            <span>⏳</span>
            <div>
              <h3>Pending</h3>
              <p>{pendingCount}</p>
            </div>
          </div>

          <div className="admin-payment-summary-card">
            <span>✅</span>
            <div>
              <h3>Paid</h3>
              <p>{paidCount}</p>
            </div>
          </div>

          <div className="admin-payment-summary-card">
            <span>🏦</span>
            <div>
              <h3>Bank Transfers</h3>
              <p>{bankTransferCount}</p>
            </div>
          </div>

          <div className="admin-payment-summary-card revenue-card">
            <span>💰</span>
            <div>
              <h3>Verified Revenue</h3>
              <p>Rs. {totalRevenue.toLocaleString()}</p>
            </div>
          </div>

        </div>


        <div className="admin-orders-section-title">
          <div>
            <h2>Customer Payments <span>♡</span></h2>
            <p>Review and verify payment records</p>
          </div>

          <span className="admin-order-count">
            {payments.length} Payments
          </span>
        </div>

        {payments.length === 0 ? (

          <div className="admin-empty-orders">
            <div>💳</div>
            <h2>No payments yet!</h2>
            <p>Customer payments will appear here.</p>
          </div>

        ) : (

          <div className="admin-payments-list">

            {payments.map((payment) => (

              <div className="admin-payment-card" key={payment._id}>


                <div className="admin-payment-header">

                  <div className="admin-payment-heading-left">
                    <div className="admin-payment-icon">
                      💳
                    </div>

                    <div>
                      <h3>
                        Payment #{payment._id.slice(-6)}
                      </h3>

                      <p>
                        📅{" "}
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`payment-status ${payment.paymentStatus.toLowerCase()}`}
                  >
                    {payment.paymentStatus}
                  </span>

                </div>


                <div className="admin-payment-content">

                  <div className="admin-payment-customer">
                    <h4>👤 Customer Details</h4>

                    <p>
                      <strong>{getCustomerName(payment)}</strong>
                    </p>

                    <p>📞 {getCustomerPhone(payment)}</p>
                  </div>

                  <div className="admin-payment-details">
                    <h4>💰 Payment Details</h4>

                    <p>
                      <span>Order ID</span>
                      <strong>#{getOrderId(payment).slice(-6)}</strong>
                    </p>

                    <p>
                      <span>Amount</span>
                      <strong>
                        Rs. {payment.amount.toLocaleString()}
                      </strong>
                    </p>

                    <p>
                      <span>Method</span>
                      <strong>
                        {payment.paymentMethod === "CASH_ON_DELIVERY"
                          ? "Cash on Delivery"
                          : "Bank Transfer"}
                      </strong>
                    </p>

                    <p>
                      <span>Status</span>
                      <strong>{payment.paymentStatus}</strong>
                    </p>
                  </div>

                </div>


                <div className="admin-payment-actions">
                    {payment.paymentMethod === "BANK_TRANSFER" && (
                        <button type="button"className="view-slip-button"onClick={() => handleViewSlip(payment._id)}disabled={slipLoading} >
                            {slipLoading ? "Loading Slip..." : "🖼️ View Bank Slip"}
                        </button>
                    )}

                    {payment.paymentMethod === "BANK_TRANSFER" &&
                        payment.paymentStatus === "PENDING" && (
                            <button
                                type="button"
                                className="verify-payment-button"
                                onClick={() => handleVerifyPayment(payment._id)}
                                disabled={verifyingId === payment._id}
                            >
                                {verifyingId === payment._id
                                    ? "Verifying..."
                                    : "✓ Verify Payment"}
                            </button>
                    )}

                    {payment.paymentMethod === "CASH_ON_DELIVERY" &&
                        payment.paymentStatus === "PENDING" && (
                            <button
                                type="button"
                                className="verify-payment-button"
                                onClick={() => handleCollectCash(payment._id)}
                                disabled={verifyingId === payment._id}
                            >
                                {verifyingId === payment._id
                                    ? "Updating..."
                                    : "💵 Mark as Paid"}
                            </button>
                    )}
                </div>

                <div className="admin-payment-card-bottom">
                  Made with love for little smiles <span>♡</span>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {slipImage && (
        <div
          className="payment-slip-overlay"
          onClick={closeSlip}
        >
          <div
            className="payment-slip-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="payment-slip-close"
              onClick={closeSlip}
            >
              ×
            </button>

            <h3>Bank Payment Slip</h3>

            <img
              src={slipImage}
              alt="Customer bank payment slip"
            />

            <button
              type="button"
              onClick={closeSlip}
              className="payment-slip-close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}


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

export default AdminPayments;