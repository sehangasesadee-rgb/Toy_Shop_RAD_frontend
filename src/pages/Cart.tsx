
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

interface CartItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("tootieCart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("tootieCart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (id: string) => {
    const updatedCart = cart.map((item) =>
      item._id === id && item.quantity < item.stock
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    updateCart(updatedCart);
  };

  const decreaseQuantity = (id: string) => {
    const updatedCart = cart.map((item) =>
      item._id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );

    updateCart(updatedCart);
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    updateCart(updatedCart);
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <div className="cart-container">

        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Continue Shopping
        </button>

        <h1>My Shopping Cart ♡</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty!</h2>
            <p>Let's find some lovely toys for you.</p>

            <button onClick={() => navigate("/product")}>
              Explore Toys
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>

                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>

                    <p>{item.category}</p>

                    <h4>
                      Rs. {item.price.toLocaleString()}
                    </h4>

                    <div className="cart-quantity">
                      <button
                        onClick={() => decreaseQuantity(item._id)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => increaseQuantity(item._id)}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-cart-item"
                      onClick={() => removeItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item-total">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>

                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-total">
                <span>Total Price</span>

                <strong>
                  Rs. {totalPrice.toLocaleString()}
                </strong>
              </div>

              <button
                className="checkout-button"
                onClick={() => navigate("/checkout")}
                > Proceed to Checkout →
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Cart;
