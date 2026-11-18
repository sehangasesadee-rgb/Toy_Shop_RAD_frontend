
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:5000/api";
const IMAGE_URL = "http://localhost:5000";

interface Product {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock: number;
  image?: string;
}

interface Season {
  _id: string;
  name: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface SeasonProduct {
  _id: string;
  productId: Product;
  offerPrice: number;
  discountPercent: number;
  isActive: boolean;
}

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

const getImageUrl = (image?: string) => {
  if (!image) return "/placeholder.png";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${IMAGE_URL}/${image.replace(/^\/+/, "")}`;
};

const SeasonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [season, setSeason] = useState<Season | null>(null);
  const [products, setProducts] = useState<SeasonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Season not found.");
        }

        const [seasonResponse, productsResponse] = await Promise.all([
          fetch(`${API_URL}/seasons/active`),
          fetch(`${API_URL}/seasons/${id}/products`),
        ]);

        const seasonResult = await seasonResponse.json();
        const productsResult = await productsResponse.json();

        if (!seasonResponse.ok || !seasonResult.success) {
          throw new Error("Unable to load season details.");
        }

        if (!productsResponse.ok || !productsResult.success) {
          throw new Error("Unable to load season products.");
        }

        const activeSeasons: Season[] = seasonResult.data || [];

        const selectedSeason = activeSeasons.find(
          (item) => item._id === id
        );

        if (!selectedSeason) {
          throw new Error("This season is not currently available.");
        }

        setSeason(selectedSeason);
        setProducts(productsResult.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonDetails();
  }, [id]);

  useEffect(() => {
    if (!season) return;

    const updateCountdown = () => {
      const difference =
        new Date(season.endDate).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft("Offer has ended");
        return;
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
      );

      const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
      );

      const seconds = Math.floor(
        (difference / 1000) % 60
      );

      setTimeLeft(
        `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [season]);

  const addToCart = (offer: SeasonProduct) => {
    const product = offer.productId;

    if (!product || product.stock <= 0) {
      alert("Sorry! This product is out of stock.");
      return;
    }

    const cart: CartItem[] = JSON.parse(
      localStorage.getItem("tootieCart") || "[]"
    );

    const existingItem = cart.find(
      (item) => item._id === product._id
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert("Maximum available stock reached.");
        return;
      }

      existingItem.quantity += 1;
      existingItem.price = offer.offerPrice;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        price: offer.offerPrice,
        image: product.image || "/placeholder.png",
        stock: product.stock,
        quantity: 1,
      });
    }

    localStorage.setItem("tootieCart", JSON.stringify(cart));

    alert("Seasonal offer added to your cart! ❤️");
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="season-details-loading">
        <div className="season-loading-icon">🧸</div>
        <h2>Preparing Something Special...</h2>
        <p>Please wait a little! 🎀</p>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="season-details-error">
        <span>🎁</span>
        <h2>Oops! Something went wrong.</h2>
        <p>{error || "Season not found."}</p>
        <button onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    );
  }

  const availableProducts = products.filter(
    (offer) =>
      offer.isActive &&
      offer.productId &&
      offer.productId.stock > 0
  );

  return (
    <main className="season-details-page">
      <div className="season-details-container">

        <button
          className="season-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <section className="season-details-hero">
          <img
            src={getImageUrl(season.bannerImage)}
            alt={season.name}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />

          <div className="season-details-overlay">
            <span>✨ TOOTIETOYS SPECIAL EVENT ✨</span>
            <h1>{season.name}</h1>
            <p>{season.description}</p>
          </div>
        </section>

        <section className="season-countdown-section">
          <span>⏳ LIMITED TIME OFFER</span>
          <h2>Hurry! Offers End In</h2>
          <strong>{timeLeft}</strong>
        </section>

        <section className="season-products-section-customer">

          <div className="season-customer-heading">
            <span>🎁 SPECIAL COLLECTION</span>
            <h2>Explore Our Seasonal Offers</h2>
            
            <div className="season-heading-decoration">
              ✦ ───────── 🧸 ───────── ✦
            </div>
          </div>

          {availableProducts.length === 0 ? (
            <div className="season-customer-empty">
              <span>🧸</span>
              <h3>No products available right now.</h3>
              <p>Please check back again soon!</p>
            </div>
          ) : (
            <div className="season-customer-grid">
              {availableProducts.map((offer) => {
                const product = offer.productId;

                return (
                  <article
                    className="season-customer-card"
                    key={offer._id}
                  >
                    <div className="season-customer-image">

                      <img src={product.image || "/placeholder.png"} alt={product.name}onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                      />

                      <span className="season-customer-discount">
                        {offer.discountPercent}% OFF
                      </span>

                      <span className="season-special-tag">
                        Special Deal
                      </span>
                    </div>

                    <div className="season-customer-info">

                      <small>
                        {product.category || "TOYS"}
                      </small>

                      <h3>{product.name}</h3>

                      <div className="season-customer-prices">
                        <strong>
                          Rs. {Number(offer.offerPrice).toFixed(2)}
                        </strong>

                        <del>
                          Rs. {Number(product.price).toFixed(2)}
                        </del>
                      </div>

                      <p className="season-customer-stock">
                        {product.stock > 0
                          ? `✓ In Stock: ${product.stock}`
                          : "Out of Stock"}
                      </p>

                      <button
                        className="season-add-cart"
                        onClick={() => addToCart(offer)}
                        disabled={product.stock <= 0}
                      >
                        🛒 Add to Cart
                      </button>

                      <button
                        className="season-view-product"
                        onClick={() =>
                          navigate(`/product/${product._id}`)
                        }
                      >
                        View Product →
                      </button>

                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default SeasonDetails;
