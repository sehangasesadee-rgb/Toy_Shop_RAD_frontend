import React, { useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productSlice";
import type { RootState, AppDispatch } from "../redux/store";

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { toys, loading } = useSelector(
    (state: RootState) => state.products
  );

  const favorites: string[] = JSON.parse(
    localStorage.getItem("tootieFavorites") || "[]"
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const favoriteToys = toys.filter((toy) =>
    favorites.includes(toy._id)
  );

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter(
      (item) => item !== id
    );

    localStorage.setItem(
      "tootieFavorites",
      JSON.stringify(updatedFavorites)
    );

    window.location.reload();
  };

  return (
    <div className="products-page">
      <section className="all-products-section">
        <div className="products-heading">
          <div>
            <span className="products-small-title">
              YOUR LOVELY PICKS
            </span>

            <h2>
              My Favorites <span>♥</span>
            </h2>

            <p>Your most-loved toys are waiting for you.</p>
          </div>

          <div className="products-count">
            {favoriteToys.length} Favorite Toys
          </div>
        </div>

        {loading ? (
          <p>Loading favorites...</p>
        ) : favoriteToys.length > 0 ? (
          <div className="products-display-grid">
            {favoriteToys.map((toy) => (
              <article className="toy-product-card" key={toy._id}>
                <div
                  className="toy-product-image"
                  onClick={() => navigate(`/product/${toy._id}`)}
                >
                  <img src={toy.image} alt={toy.name} />
                </div>

                <div className="toy-product-info">
                  <span className="toy-product-category">
                    {toy.category}
                  </span>

                  <h3>{toy.name}</h3>

                  <div className="toy-product-price">
                    <strong>
                      Rs. {toy.price.toLocaleString()}
                    </strong>
                  </div>

                  <button
                    className="toy-add-cart"
                    onClick={() => navigate(`/product/${toy._id}`)}
                  >
                    View Toy →
                  </button>

                  <button
                    className="remove-favorite"
                    onClick={() => removeFavorite(toy._id)}
                  >
                    ♥ Remove from Favorites
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-toys">
            <span>♡</span>
            <h3>No favorites yet!</h3>
            <p>Save your favorite toys and find them here.</p>

            <button
              className="toy-add-cart"
              onClick={() => navigate("/products")}
            >
              Explore Toys →
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Favorites;