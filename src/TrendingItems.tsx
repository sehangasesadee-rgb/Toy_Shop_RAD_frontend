
import React, { useEffect, useState } from "react";
import "./App.css";
import { Link, useNavigate } from "react-router-dom";

interface TrendingToy {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string | null;
  totalSold: number;
  description: string;
  stock: number;
}

const TrendingItems: React.FC = () => {
  const navigate = useNavigate();

  const [trendingToys, setTrendingToys] = useState<TrendingToy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingToys = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/best-selling"
        );

        const result = await response.json();

        if (response.ok) {
          setTrendingToys(result.data || []);
        }
      } catch (error) {
        console.error("Trending toys error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingToys();
  }, []);

  const addToCart = (toy: TrendingToy) => {
    if (toy.stock < 1) {
      alert("This toy is out of stock!");
      return;
    }

    const savedCart = localStorage.getItem("tootieCart");
    const cart = savedCart ? JSON.parse(savedCart) : [];

    const existingToy = cart.find(
      (item: any) => item._id === toy._id
    );

    if (existingToy) {
      if (existingToy.quantity + 1 > toy.stock) {
        alert(`Only ${toy.stock} items are available!`);
        return;
      }

      existingToy.quantity += 1;
    } else {
      cart.push({
        ...toy,
        image: toy.image || "/toy_img1.png",
        quantity: 1,
      });
    }

    localStorage.setItem("tootieCart", JSON.stringify(cart));

    alert(`${toy.name} added to cart!`);
    navigate("/cart");
  };

  const buyNow = (toy: TrendingToy) => {
    if (toy.stock < 1) {
      alert("This toy is out of stock!");
      return;
    }

    localStorage.setItem(
      "tootieBuyNow",
      JSON.stringify({
        ...toy,
        image: toy.image || "/toy_img1.png",
        quantity: 1,
      })
    );

    navigate("/checkout?buyNow=true");
  };

  return (
    <section className="trending-section" id="trending">
      <div className="trending-layout">
        <div className="trending-illustration">
          <img
            src="/cutebg.png"
            alt="Child playing with toys"
            className="trending-kid-image"
          />
        </div>

        <div className="trending-products">
          <div className="trending-grid">
            {loading ? (
              <p>Loading trending toys... ♡</p>
            ) : trendingToys.length === 0 ? (
              <p>No trending toys available yet.</p>
            ) : (
              trendingToys.map((toy) => (
                <article className="trending-card" key={toy._id}>
                  <div className="trending-card-image">
                    <img
                      src={toy.image || "/toy_img1.png"}
                      alt={toy.name}
                      onClick={() =>
                        navigate(`/product/${toy._id}`)
                      }
                      style={{ cursor: "pointer" }}
                    />

                    <button
                      type="button"
                      className="trending-heart-button"
                      aria-label={`Add ${toy.name} to favorites`}
                    >
                      ♡
                    </button>
                  </div>

                  <div className="trending-card-info">
                    <span className="trending-category">
                      {toy.category}
                    </span>

                    <h3
                      onClick={() =>
                        navigate(`/product/${toy._id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {toy.name}
                    </h3>

                    <div className="trending-card-bottom">
                      <strong>
                        Rs. {toy.price.toLocaleString()}
                      </strong>

                      <span className="trending-rating">
                        {toy.totalSold} Sold
                      </span>
                    </div>

                    <div className="trending-action-buttons">
                      <button
                        type="button"
                        onClick={() => addToCart(toy)}
                        disabled={toy.stock < 1}
                      >
                        {toy.stock < 1
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        onClick={() => buyNow(toy)}
                        disabled={toy.stock < 1}
                      >
                        Buy Now →
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="trending-see-more">
            <Link to="/products">See more →</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingItems;
