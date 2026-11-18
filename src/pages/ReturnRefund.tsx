import React from "react";
import { Link } from "react-router-dom";
import "../App.css"

function ReturnRefund() {
  return (
    <div className="info-page">
      <Link to="/" className="info-back">← Back to Home</Link>

      <section className="info-hero returns-hero">
        <span className="info-hero-icon">🎁</span>
        <h1>Return & Refund</h1>
        <p>Your happiness matters to us!</p>
        <small>
          We want every TootieToys shopping experience to be a happy one.
        </small>
      </section>

      <section className="info-card-grid">
        <article className="info-card">
          <span>📦</span>
          <h2>Return Policy</h2>
          <p>
            If you are unhappy with an item, please contact our
            support team to discuss your return options.
          </p>
        </article>

        <article className="info-card">
          <span>💰</span>
          <h2>Refund Information</h2>
          <p>
            Refund requests are reviewed individually.
            Our team will explain the available options
            once your request has been checked.
          </p>
        </article>

        <article className="info-card">
          <span>🧸</span>
          <h2>Damaged Items</h2>
          <p>
            If your toy arrives damaged or incorrect,
            contact us with your order details and photos
            so we can assist you.
          </p>
        </article>

        <article className="info-card">
          <span>💌</span>
          <h2>Need Assistance?</h2>
          <p>
            Our support team is here to help with
            questions about returns and refunds.
          </p>
          <Link to="/support" className="info-action">
            Contact Support →
          </Link>
        </article>
      </section>

      <div className="info-bottom-note">
        💗 Thank you for choosing TootieToys!
      </div>
    </div>
  );
}

export default ReturnRefund;
