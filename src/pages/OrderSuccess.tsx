
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="order-success-page">

      <div className="success-decoration decoration-one">♡</div>
      <div className="success-decoration decoration-two">✦</div>
      <div className="success-decoration decoration-three">♡</div>
      <div className="success-decoration decoration-four">✧</div>

      <div className="order-success-card">

        <div className="success-badge">
          <span>✓</span>
        </div>

        <div className="success-icon">
          💗
        </div>

        <span className="success-small-title">
          YAY! IT'S OFFICIAL
        </span>

        <h1>
          Order Placed <span>Successfully!</span>
        </h1>

        <div className="success-divider">
          <span>♡</span>
        </div>

        <p className="success-main-text">
          Thank you for choosing TootieToys!
        </p>

        <p className="success-description">
          Your order has been received with love.
          Get ready to bring big smiles and little moments
          of happiness to your little one! 🧸
        </p>

        <div className="success-message-box">
          <span className="success-gift">🎁</span>
          <div>
            <h3>A Little Happiness Is Coming!</h3>
            <p>
              Thank you for being part of our TootieToys family.
            </p>
          </div>
        </div>

        <div className="success-buttons">

          <button
          className="success-shop-button"
          onClick={() => navigate("/product", { replace: true })}
          >
          Continue Shopping <span>→</span>
          </button>

          <button
            className="success-home-button"
            onClick={() =>
              navigate("/", {
               replace: true,
               state: { scrollToTrending: true },
              })
            }
            >
              ♡ Back to Home
          </button>

        </div>

        <div className="success-footer">
          Made with <span>♥</span> for little smiles
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
