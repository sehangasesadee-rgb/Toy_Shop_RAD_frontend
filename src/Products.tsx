import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate , useSearchParams} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts} from "./redux/productSlice";
import type { RootState, AppDispatch } from "./redux/store";
// import { addToCart } from "./redux/cartSlice";




const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { toys, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const [selectedCategory, setSelectedCategory] = useState("All Toys");  
  const [favorites, setFavorites] = useState<string[]>(() => {
  const savedFavorites = localStorage.getItem("tootieFavorites");
  return savedFavorites ? JSON.parse(savedFavorites) : [];
});
  const [sort, setSort] = useState("default");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageRange = searchParams.get("ageRange");
    const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );


  const categories = [
    "All Toys",
    ...new Set(toys.map((toy) => toy.category)),
  ];


useEffect(() => {
  dispatch(fetchProducts(ageRange || undefined));
}, [dispatch, ageRange]);
    
useEffect(() => {
  localStorage.setItem("tootieFavorites", JSON.stringify(favorites));
}, [favorites]);


  let filteredToys = toys.filter((toy) => {
    const matchesCategory =
      selectedCategory === "All Toys" ||
      toy.category === selectedCategory;

    const matchesSearch =
    toy.name.toLowerCase().includes(search.toLowerCase()) ||
    toy.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });


  if (sort === "low") {
    filteredToys = [...filteredToys].sort(
      (a, b) => a.price - b.price
    );
  } else if (sort === "high") {
    filteredToys = [...filteredToys].sort(
      (a, b) => b.price - a.price
    );
  }


  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
  <div className="products-page" id="products">

    <button
      className="back-button"
      onClick={() =>
        navigate("/", {
         replace: true,
         state: { scrollToTrending: true },
        })
      }
    >
      ← Back to Home
    </button>

    <section className="all-products-section">

      
        <div className="products-heading">
          <div>
            <span className="products-small-title">
              OUR COLLECTION
            </span>

            <h2>
              All Toys <span>♡</span>
            </h2>

            <p>
              Find the perfect toy for every happy moment.
            </p>
          </div>

          <div className="products-count">
            {filteredToys.length} Lovely Toys
          </div>
        </div>

        <div className="products-toolbar">

          <div className="product-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search your favorite toys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="product-sort"
          >
            <option value="default">Sort By: Default</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>

        </div>

        <div className="product-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={
                selectedCategory === category ? "active" : ""
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>


        {loading && <p>Loading toys...</p>}


        {!loading && error && <p>{error}</p>}

        {!loading && !error && (
          <div className="products-display-grid">

            {filteredToys.length > 0 ? (
              filteredToys.map((toy) => (
                <article
                  className="toy-product-card"
                  key={toy._id}
                >
                  <div className="toy-product-image">

                    {toy.badge && (
                      <span className="toy-product-badge">
                        {toy.badge}
                      </span>
                    )}

                    <button
                      className={`toy-favorite ${
                        favorites.includes(toy._id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleFavorite(toy._id)}
                      aria-label="Add to favorites"
                    >
                      {favorites.includes(toy._id)
                        ? "♥"
                        : "♡"}
                    </button>

                    <img
                      src={toy.image}
                      alt={toy.name}
                    />

                  </div>

                  <div className="toy-product-info">

                    <span className="toy-product-category">
                      {toy.category}
                    </span>

                    <h3>{toy.name}</h3>

                    {toy.rating && (
                      <div className="toy-product-rating">
                        <span>★★★★★</span>
                        <small>{toy.rating}</small>
                      </div>
                    )}

                    <div className="toy-product-price">
  <strong>
    Rs. {toy.price.toLocaleString()}
  </strong>

  {toy.discount !== undefined &&
    toy.discount > 0 &&
    toy.oldPrice !== undefined &&
    toy.oldPrice > toy.price && (
      <>
        <del>
          Rs. {toy.oldPrice.toLocaleString()}
        </del>

        <span className="product-discount">
          {toy.discount}% OFF
        </span>
      </>
    )}
</div>

                    <button className="toy-add-cart" onClick={() => navigate(`/product/${toy._id}`)}> View Toy →</button>

                  </div>
                </article>
              ))
            ) : (
              <div className="no-toys">
                <span>🧸</span>
                <h3>No toys found!</h3>
                <p>Try searching for another toy.</p>
              </div>
            )}

          </div>
        )}

      </section>
    </div>
  );
};

export default Products;
