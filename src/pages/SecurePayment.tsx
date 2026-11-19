
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function SecurePayment() {
  return (
    <div className="info-page payment-page">
      <Link to="/" className="info-back">
        ← Back to Home
      </Link>

      <section className="payment-header">
        <div className="payment-icon">💳</div>

        <span className="payment-eyebrow">
          TOOTIETOYS • PAYMENT INFORMATION
        </span>

        <h1>Payment Information</h1>

        <p>
          Simple and convenient payment options for
          your little one's favourite toys.
        </p>
      </section>

      <section className="payment-content">
        <div className="payment-main">
          <span className="payment-section-label">
            AVAILABLE PAYMENT METHODS
          </span>

          <h2>Choose how you want to pay</h2>

          <p className="payment-description">
            At TootieToys, we offer two convenient ways
            to complete your purchase.
          </p>

          <div className="payment-steps">
            <div className="payment-step">
              <span className="payment-step-number">01</span>
              <div>
                <h3>💵 Cash on Delivery</h3>
                <p>
                  Place your order and pay the total amount
                  in cash when your order is delivered.
                  Our payment status will be updated after
                  the payment is received.
                </p>
              </div>
            </div>

            <div className="payment-step">
              <span className="payment-step-number">02</span>
              <div>
                <h3>🏦 Bank Transfer</h3>
                <p>
                  Transfer the order amount to our bank
                  account and upload your payment slip
                  during checkout. Our team will review
                  the slip and verify your payment.
                </p>
              </div>
            </div>

            <div className="payment-step">
              <span className="payment-step-number">03</span>
              <div>
                <h3>📦 Order Confirmation</h3>
                <p>
                  After placing your order, visit My Orders
                  to check your order details and current status.
                </p>
              </div>
            </div>

            <div className="payment-step">
              <span className="payment-step-number">04</span>
              <div>
                <h3>💗 Payment Confirmation</h3>
                <p>
                  Bank transfers are marked as paid after
                  verification. Cash on Delivery payments
                  are marked as paid after cash is collected.
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="payment-side">
          <div className="payment-side-icon">🔒</div>

          <h3>Shop with confidence</h3>

          <p>
            Always check your order total and payment
            method before confirming your purchase.
          </p>

          <div className="payment-side-divider"></div>

          <h4>Need help with a payment?</h4>

          <p>
            If you have any questions about your payment
            or order, our support team is here to help.
          </p>

          <Link to="/support" className="payment-support-link">
            Contact Support →
          </Link>
        </aside>
      </section>

      <div className="payment-bottom">
        <span>🧸</span>
        <p>Thank you for choosing TootieToys!</p>
        <small>Little Toys, Big Happiness.</small>
      </div>
    </div>
  );
}

export default SecurePayment;
