
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import "../App.css";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isBuyNow = searchParams.get("buyNow") === "true";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (isBuyNow) {
      const buyNowItem = localStorage.getItem("tootieBuyNow");

      if (buyNowItem) {
        setCart([JSON.parse(buyNowItem)]);
      } else {
        setCart([]);
      }
    } else {
      const savedCart = localStorage.getItem("tootieCart");

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    }
  }, [isBuyNow]);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!phone || !isValidPhoneNumber(phone)) {
      alert(
        "Please enter a valid phone number for the selected country."
      );
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please login before placing an order.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Order placement failed"
        );
      }

      alert("Your order has been placed successfully! 💗");

      if (isBuyNow) {
        localStorage.removeItem("tootieBuyNow");
      } else {
        localStorage.removeItem("tootieCart");
      }

      navigate("/order-success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      alert(message);
    }
  };

  if (cart.length === 0) {
    return (
      <div>
        <h2>Your cart is empty!</h2>

        <button onClick={() => navigate("/product")}>
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
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
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
              Rs.{" "}
              {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}

        <h3>
          Total: Rs. {totalPrice.toLocaleString()}
        </h3>

        <button type="submit">
          Place Order →
        </button>
      </form>
    </div>
  );
};

export default Checkout;
