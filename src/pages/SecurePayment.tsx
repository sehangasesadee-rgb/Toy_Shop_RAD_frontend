import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function SecurePayment() {
  return (
    <div className="info-page">
      <Link to="/" className="info-back">
        ← Back to Home
      </Link>

      <section className="info-hero payment-hero">
        <span className="info-hero-icon">🔒</span>
        <h1>Secure Payment</h1>
        <p>Safe and easy shopping at TootieToys!</p>
        <small>
          We want you to enjoy a simple and convenient
          checkout experience.
        </small>
      </section>

      <section className="info-card-grid">
        <article className="info-card">
          <span>💳</span>
          <h2>Payment Methods</h2>
          <p>
            Choose from the payment options available
            at checkout. You can view the available
            methods before placing your order.
          </p>
        </article>

        <article className="info-card">
          <span>🔐</span>
          <h2>Payment Safety</h2>
          <p>
            Always use trusted payment methods and
            make sure you are using the official
            TootieToys website when shopping.
          </p>
        </article>

        <article className="info-card">
          <span>📩</span>
          <h2>Order Confirmation</h2>
          <p>
            After placing your order, check your
            order details to confirm that your
            purchase was submitted successfully.
          </p>
        </article>

        <article className="info-card">
          <span>❓</span>
          <h2>Payment Problems?</h2>
          <p>
            Having trouble with a payment? Contact
            our support team for assistance.
          </p>

          <Link to="/support" className="info-action">
            Contact Support →
          </Link>
        </article>
      </section>

      <div className="info-bottom-note">
        💗 Thank you for shopping with TootieToys!
      </div>
    </div>
  );
}

export default SecurePayment;
