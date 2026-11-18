import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

interface Toy {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
  stock: number;
  ageRange: string;
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

function DealsSection() {
  const [toys, setToys] = useState<Toy[]>([]);
  const [sort, setSort] = useState("Biggest Discount");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tootieFavorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const result = await response.json();

        const products: Toy[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        const discountedProducts = products.filter(
          (toy) =>
            toy.discount > 0 &&
            toy.oldPrice > toy.price &&
            toy.stock > 0
        );

        setToys(discountedProducts);
      } catch (err) {
        console.error("Deals Error:", err);
        setError("Unable to load deals. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      localStorage.setItem(
        "tootieFavorites",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const addToCart = (toy: Toy) => {
    if (toy.stock <= 0) {
      alert("Sorry! This toy is out of stock.");
      return;
    }

    try {
      const savedCart = localStorage.getItem("tootieCart");

      const cart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const existingItem = cart.find(
        (item) => item._id === toy._id
      );

      if (existingItem) {
        if (existingItem.quantity >= toy.stock) {
          alert("Sorry! Maximum available stock reached.");
          return;
        }

        existingItem.quantity += 1;
        existingItem.price = toy.price;
      } else {
        const newItem: CartItem = {
          _id: toy._id,
          name: toy.name,
          description: toy.description,
          category: toy.category,
          price: toy.price,
          image: toy.image,
          stock: toy.stock,
          quantity: 1,
        };

        cart.push(newItem);
      }

      localStorage.setItem(
        "tootieCart",
        JSON.stringify(cart)
      );

      alert(`${toy.name} added to your cart! 🛒`);

      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Unable to add this toy to your cart.");
    }
  };

  const visibleToys = [...toys].sort((a, b) => {
    if (sort === "Biggest Discount") {
      return b.discount - a.discount;
    }

    if (sort === "Lowest Price") {
      return a.price - b.price;
    }

    return 0;
  });

  const productCard = (toy: Toy) => {
    const isFavorite = favorites.includes(toy._id);

    return (
      <article className="deal-product-card" key={toy._id}>
        <div className="deal-product-image">
          <img
            src={toy.image}
            alt={toy.name}
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />

          <span className="deal-discount">
            -{toy.discount}%
          </span>

          <button
          type="button"
          className={`deal-heart ${isFavorite ? "selected" : ""}`}
          onClick={() => toggleFavorite(toy._id)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="deal-product-info">
          <span className="deal-category">
            {toy.category}
          </span>

          <h3>{toy.name}</h3>

          <div className="deal-prices">
            <strong>
              Rs. {toy.price.toLocaleString()}
            </strong>

            <del>
              Rs. {toy.oldPrice.toLocaleString()}
            </del>
          </div>

          <div className="deal-rating">
            ⭐⭐⭐⭐⭐ <span>(Special Deal)</span>
          </div>

          <button
            type="button"
            className="deal-cart-button"
            onClick={() => addToCart(toy)}
            disabled={toy.stock <= 0}
          >
            Add to Cart 🛒
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="deals-section" id="deals">

      <div className="deals-banner">
        <img
          src="public/banner.png"
          alt="TootieToys Special Deals"
        />
      </div>

      <div className="deals-heading">
        <select
          className="deals-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort deals"
        >
          <option value="Biggest Discount">
            Biggest Discount
          </option>

          <option value="Lowest Price">
            Lowest Price
          </option>
        </select>
      </div>

      {loading && (
        <p>Loading special deals... 🧸</p>
      )}

      {!loading && error && (
        <p>{error}</p>
      )}

      {!loading && !error && visibleToys.length === 0 && (
        <p>No special deals available right now. 🎁</p>
      )}

      {!loading && !error && visibleToys.length > 0 && (
        <div className="deal-product-grid">
          {visibleToys.map(productCard)}
        </div>
      )}

    </section>
  );
}

export default DealsSection;
