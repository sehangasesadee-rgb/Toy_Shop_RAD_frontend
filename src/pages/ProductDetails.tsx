
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";

interface Toy {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string | null;
  stock: number;
}

interface CartItem extends Toy {
  quantity: number;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [toy, setToy] = useState<Toy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/api/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Product not found");
        }

        return response.json();
      })
      .then((result) => {
        setToy(result.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="detail-message">Loading toy...</p>;
  }

  if (error) {
    return <p className="detail-message">{error}</p>;
  }

  if (!toy) {
    return <p className="detail-message">Toy not found!</p>;
  }

  const addToCart = () => {
    if (toy.stock < quantity) {
      alert("Not enough stock available!");
      return;
    }

    const savedCart = localStorage.getItem("tootieCart");

    const cart: CartItem[] = savedCart
      ? JSON.parse(savedCart)
      : [];

    const existingToy = cart.find(
      (item) => item._id === toy._id
    );

    if (existingToy) {
      if (existingToy.quantity + quantity > toy.stock) {
        alert(`Only ${toy.stock} items are available!`);
        return;
      }

      existingToy.quantity += quantity;
    } else {
      cart.push({
        ...toy,
        quantity,
      });
    }

    localStorage.setItem("tootieCart", JSON.stringify(cart));

    alert(`${quantity} x ${toy.name} added to cart!`);
    navigate("/cart");
  };

  const buyNow = () => {
    if (toy.stock < quantity) {
      alert("Not enough stock available!");
      return;
    }

    localStorage.setItem(
      "tootieBuyNow",
      JSON.stringify({
        ...toy,
        image: toy.image || "/toy_img1.png",
        quantity,
      })
    );

    navigate("/checkout?buyNow=true");
  };

  return (
    <div className="detail-page">
      <div className="detail-container">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to Toys
        </button>

        <div className="detail-card">
          <div className="detail-image-area">
            <span className="detail-tag">
              Made with Love ♡
            </span>

            <img
              src={toy.image || "/toy_img1.png"}
              alt={toy.name}
              className="detail-image"
            />
          </div>

          <div className="detail-info">
            <p className="detail-category">
              {toy.category}
            </p>

            <h1>{toy.name}</h1>

            <div className="detail-rating">
              <span>★★★★★</span>
              <small>Lovely toy for little ones</small>
            </div>

            <h2 className="detail-price">
              Rs. {toy.price.toLocaleString()}
            </h2>

            <div className="detail-divider"></div>

            <h3>Product Description</h3>

            <p className="detail-description">
              {toy.description}
            </p>

            <div className="stock-info">
              <span>Availability</span>

              <strong
                className={
                  toy.stock > 0 ? "in-stock" : "out-stock"
                }
              >
                {toy.stock > 0
                  ? `✓ In Stock (${toy.stock} available)`
                  : "Out of Stock"}
              </strong>
            </div>

            <div className="quantity-area">
              <span>Quantity</span>

              <div className="quantity-control">
                <button
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                  disabled={quantity <= 1}
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(toy.stock, q + 1)
                    )
                  }
                  disabled={quantity >= toy.stock}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="detail-cart-button"
              onClick={addToCart}
              disabled={toy.stock === 0}
            >
              ♡ Add to Cart
            </button>

            <button
              className="detail-cart-button"
              onClick={buyNow}
              disabled={toy.stock === 0}
            >
              Buy Now →
            </button>

            <p className="detail-footer-text">
              ♡ Little Toys, Big Happiness!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
