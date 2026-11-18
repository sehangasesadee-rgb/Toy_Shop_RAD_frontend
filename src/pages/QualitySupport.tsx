import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function QualitySupport() {
  return (
    <div className="info-page">
      <Link to="/" className="info-back">
        ← Back to Home
      </Link>

      <section className="info-hero support-hero">
        <span className="info-hero-icon">💗</span>
        <h1>Quality Support</h1>
        <p>We're always happy to help!</p>
        <small>
          At TootieToys, making parents and little
          customers happy is our priority.
        </small>
      </section>

      <section className="info-card-grid">
        <article className="info-card">
          <span>📦</span>
          <h2>Order Assistance</h2>
          <p>
            Need help with your order? Our support
            team can guide you with order-related
            questions and information.
          </p>
        </article>

        <article className="info-card">
          <span>🧸</span>
          <h2>Product Information</h2>
          <p>
            Have questions about toy categories,
            product details or age recommendations?
            We're happy to help.
          </p>
        </article>

        <article className="info-card">
          <span>🎁</span>
          <h2>Returns & Refunds</h2>
          <p>
            Need information about returning a toy
            or requesting a refund? Visit our
            Return & Refund page.
          </p>

          <Link to="/returns" className="info-action">
            View Return Policy →
          </Link>
        </article>

        <article className="info-card">
          <span>💌</span>
          <h2>We're Here for You</h2>
          <p>
            Have more questions? Send us an email
            and we'll be happy to assist you.
          </p>

          <a
            href="mailto:dihinisehanga29@gmail.com"
            className="info-action"
          >
            Email Us →
          </a>
        </article>
      </section>

      <div className="info-bottom-note">
        💗 Your happiness makes us happy!
      </div>
    </div>
  );
}

export default QualitySupport;
