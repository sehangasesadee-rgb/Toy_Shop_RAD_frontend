import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../App.css";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

type PaymentMethod = "CASH_ON_DELIVERY" | "BANK_TRANSFER";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isBuyNow = searchParams.get("buyNow") === "true";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");

  const [bankSlip, setBankSlip] = useState<File | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (isBuyNow) {
      const buyNowItem = localStorage.getItem("tootieBuyNow");
      setCart(buyNowItem ? [JSON.parse(buyNowItem)] : []);
    } else {
      const savedCart = localStorage.getItem("tootieCart");
      setCart(savedCart ? JSON.parse(savedCart) : []);
    }
  }, [isBuyNow]);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !isValidPhoneNumber(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (paymentMethod === "BANK_TRANSFER" && !bankSlip) {
      alert("Please upload your bank payment slip.");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please login before placing an order.");
      navigate("/login");
      return;
    }

    try {
      setPlacingOrder(true);

      const orderResponse = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerName,
            phone,
            address,
            items: cart.map((item) => ({
              productId: item._id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderResult.message || "Order placement failed"
        );
      }

      const orderId = orderResult.data?._id;

      if (!orderId) {
        throw new Error("Order created, but Order ID was not returned.");
      }

      const paymentResponse = await fetch(
        "http://localhost:5000/api/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId,
            paymentMethod,
          }),
        }
      );

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentResult.message || "Payment creation failed"
        );
      }

      if (paymentMethod === "BANK_TRANSFER" && bankSlip) {
        const formData = new FormData();
        formData.append("bankSlip", bankSlip);

        const slipResponse = await fetch(
          `http://localhost:5000/api/payments/${paymentResult.data._id}/upload-slip`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const slipResult = await slipResponse.json();

        if (!slipResponse.ok) {
          throw new Error(
            slipResult.message || "Bank slip upload failed"
          );
        }
      }

      if (isBuyNow) {
        localStorage.removeItem("tootieBuyNow");
      } else {
        localStorage.removeItem("tootieCart");
      }

      alert(
        paymentMethod === "BANK_TRANSFER"
          ? "Order placed! Your bank slip has been submitted for verification. 💗"
          : "Your order has been placed successfully! 💗"
      );

      navigate("/order-success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      alert(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div>
        <h2>Your cart is empty!</h2>
        <button type="button" onClick={() => navigate("/products")}>
          Explore Toys
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1>Checkout ♡</h1>

      <form onSubmit={handlePlaceOrder}>
        <h2>Delivery Details</h2>

        <label>Customer Name</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          placeholder="Enter your name"
        />

        <label>Phone Number</label>
        <PhoneInput
          international
          defaultCountry="LK"
          value={phone}
          onChange={(value) => setPhone(value || "")}
          placeholder="Enter your phone number"
          required
        />

        <label>Delivery Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          placeholder="Enter your delivery address"
        />

        <h2>Order Summary</h2>

        {cart.map((item) => (
          <div key={item._id}>
            <p>
              {item.name} × {item.quantity}
            </p>

            <p>
              Rs. {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}

        <h3>Total: Rs. {totalPrice.toLocaleString()}</h3>

        <h2>Payment Method</h2>

        <div className="checkout-payment-options">
          <label className="checkout-payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="CASH_ON_DELIVERY"
              checked={paymentMethod === "CASH_ON_DELIVERY"}
              onChange={() => {
                setPaymentMethod("CASH_ON_DELIVERY");
                setBankSlip(null);
              }}
            />
            <span>💵 Cash on Delivery</span>
          </label>

          <label className="checkout-payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="BANK_TRANSFER"
              checked={paymentMethod === "BANK_TRANSFER"}
              onChange={() => setPaymentMethod("BANK_TRANSFER")}
            />
            <span>🏦 Bank Transfer</span>
          </label>
        </div>

        {paymentMethod === "BANK_TRANSFER" && (
          <div className="checkout-bank-section">
            <h3>🏦 Bank Transfer</h3>

            <p>
              Please transfer the order amount to the bank account
              provided by TootieToys.
            </p>

            <p>
              After completing the transfer, upload your payment
              receipt below.
            </p>

            <label>Upload Bank Payment Slip</label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setBankSlip(e.target.files?.[0] || null)
              }
              required
            />

            {bankSlip && (
              <small>Selected file: {bankSlip.name}</small>
            )}
          </div>
        )}

        <button type="submit" disabled={placingOrder}>
          {placingOrder ? "Processing..." : "Place Order →"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
