
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";
const IMAGE_URL = "http://localhost:5000";

interface Product {
  _id: string;
  name: string;
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

interface SelectedProduct {
  productId: string;
  offerPrice: string;
}

const getImageUrl = (image?: string) => {
  if (!image || !image.trim()) return "/placeholder.png";

  const value = image.trim().replace(/\\/g, "/");

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const cleanPath = value
    .replace(/^public\//, "")
    .replace(/^\/public\//, "");

  return `${IMAGE_URL}/${cleanPath.replace(/^\/+/, "")}`;
};

const SeasonalOffers = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [seasonProducts, setSeasonProducts] = useState<SeasonProduct[]>([]);

  const [seasonName, setSeasonName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([
    { productId: "", offerPrice: "" },
  ]);

  const [editingSeasonId, setEditingSeasonId] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingProducts, setSavingProducts] = useState(false);

  const token = localStorage.getItem("authToken");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [seasonResponse, productResponse] = await Promise.all([
        fetch(`${API_URL}/seasons`, {
          headers: authHeaders,
        }),
        fetch(`${API_URL}/products`),
      ]);

      const seasonResult = await seasonResponse.json();
      const productResult = await productResponse.json();

      if (!seasonResponse.ok) {
        throw new Error(seasonResult.message || "Unable to load seasons.");
      }

      if (!productResponse.ok) {
        throw new Error(productResult.message || "Unable to load products.");
      }

      const seasonData = Array.isArray(seasonResult.data)
        ? seasonResult.data
        : [];

      const productData = Array.isArray(productResult.data)
        ? productResult.data
        : Array.isArray(productResult)
        ? productResult
        : [];

      setSeasons(seasonData);
      setProducts(productData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setSeasonName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setBannerImage(null);
    setBannerPreview("");
    setEditingSeasonId("");
    setSelectedProducts([{ productId: "", offerPrice: "" }]);
    setMessage("");
    setError("");
  };

  const handleBannerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Banner image must be smaller than 5 MB.");
      return;
    }

    setBannerImage(file);
    setBannerPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSeasonSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!seasonName.trim() || !description.trim()) {
      setError("Please enter the season name and description.");
      return;
    }

    if (!editingSeasonId && !bannerImage) {
      setError("Please select a banner image.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select the start and end dates.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after start date.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", seasonName.trim());
      formData.append("description", description.trim());
      formData.append("startDate", new Date(startDate).toISOString());
      formData.append("endDate", new Date(endDate).toISOString());

      if (bannerImage) {
        formData.append("bannerImage", bannerImage);
      }

      const url = editingSeasonId
        ? `${API_URL}/seasons/${editingSeasonId}`
        : `${API_URL}/seasons`;

      const response = await fetch(url, {
        method: editingSeasonId ? "PUT" : "POST",
        headers: authHeaders,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to save season.");
      }

      setMessage(
        editingSeasonId
          ? "Season updated successfully! 🎉"
          : "New season created successfully! 🎉"
      );

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save season."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSeason = (season: Season) => {
    setEditingSeasonId(season._id);
    setSeasonName(season.name);
    setDescription(season.description);
    setStartDate(season.startDate.slice(0, 16));
    setEndDate(season.endDate.slice(0, 16));
    setBannerImage(null);
    setBannerPreview(getImageUrl(season.bannerImage));
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSeason = async (season: Season) => {
    setSelectedSeason(season);
    setSeasonProducts([]);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/seasons/${season._id}/products`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load season products.");
      }

      setSeasonProducts(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products."
      );
    }
  };

  const updateSelectedProduct = (
    index: number,
    field: keyof SelectedProduct,
    value: string
  ) => {
    setSelectedProducts((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addProductRow = () => {
    setSelectedProducts((current) => [
      ...current,
      { productId: "", offerPrice: "" },
    ]);
  };

  const removeProductRow = (index: number) => {
    setSelectedProducts((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const handleAddProducts = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedSeason) return;

    setMessage("");
    setError("");

    const validProducts = selectedProducts.filter(
      (item) => item.productId && item.offerPrice
    );

    if (validProducts.length === 0) {
      setError("Please select at least one product and offer price.");
      return;
    }

    const duplicateIds = validProducts.map((item) => item.productId);

    if (new Set(duplicateIds).size !== duplicateIds.length) {
      setError("You cannot select the same product more than once.");
      return;
    }

    for (const item of validProducts) {
      const product = products.find((p) => p._id === item.productId);

      if (!product) {
        setError("Selected product was not found.");
        return;
      }

      const price = Number(item.offerPrice);

      if (
        !Number.isFinite(price) ||
        price <= 0 ||
        price >= product.price
      ) {
        setError(
          `Offer price for ${product.name} must be greater than 0 and lower than Rs. ${product.price}.`
        );
        return;
      }
    }

    try {
      setSavingProducts(true);

      const response = await fetch(
        `${API_URL}/seasons/${selectedSeason._id}/products`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            products: validProducts.map((item) => ({
              productId: item.productId,
              offerPrice: Number(item.offerPrice),
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to add products.");
      }

      setMessage("Products added to the season successfully! 🎁");
      setSelectedProducts([{ productId: "", offerPrice: "" }]);

      await handleSelectSeason(selectedSeason);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add products."
      );
    } finally {
      setSavingProducts(false);
    }
  };

  const handleUpdateOfferPrice = async (
    offer: SeasonProduct,
    newPrice: string
  ) => {
    if (!selectedSeason) return;

    const price = Number(newPrice);

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      price >= offer.productId.price
    ) {
      setError(
        `Offer price must be greater than 0 and lower than Rs. ${offer.productId.price}.`
      );
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/seasons/${selectedSeason._id}/products/${offer._id}`,
        {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ offerPrice: price }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to update offer price.");
      }

      setMessage("Offer price updated successfully! ✨");
      await handleSelectSeason(selectedSeason);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update offer price."
      );
    }
  };

  const handleRemoveProduct = async (offerId: string) => {
    if (!selectedSeason) return;

    if (!window.confirm("Remove this product from the season?")) return;

    try {
      const response = await fetch(
        `${API_URL}/seasons/${selectedSeason._id}/products/${offerId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to remove product.");
      }

      setMessage("Product removed from the season.");
      await handleSelectSeason(selectedSeason);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove product."
      );
    }
  };

  const handleStatusChange = async (season: Season) => {
    try {
      const response = await fetch(
        `${API_URL}/seasons/${season._id}/status`,
        {
          method: "PATCH",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !season.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to change season status.");
      }

      setMessage("Season status updated successfully.");
      await loadData();

      if (selectedSeason?._id === season._id) {
        setSelectedSeason({
          ...season,
          isActive: !season.isActive,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to change status."
      );
    }
  };

  const handleDeleteSeason = async (season: Season) => {
    if (
      !window.confirm(
        `Delete "${season.name}" and all its seasonal offers?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/seasons/${season._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to delete season.");
      }

      if (selectedSeason?._id === season._id) {
        setSelectedSeason(null);
        setSeasonProducts([]);
      }

      if (editingSeasonId === season._id) {
        resetForm();
      }

      setMessage("Season deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete season."
      );
    }
  };

  return (
    <div className="admin-orders-page season-admin-page">
      <div className="admin-orders-container">
        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              TOOTIETOYS • CAMPAIGN MANAGEMENT
            </span>

            <h1>
              Season <span>Management</span> 🎉
            </h1>

            <p className="admin-orders-subtitle">
              Create lovely seasonal campaigns and special toy offers.
            </p>
          </div>

          <div className="admin-heading-decoration">🎀</div>
        </div>

        {message && (
          <div className="season-message success-message">
            <span>✓</span> {message}
          </div>
        )}

        {error && (
          <div className="season-message error-message">
            <span>!</span> {error}
          </div>
        )}

        <section className="admin-product-form-section">
          <div className="admin-orders-section-title">
            <div>
              <h2>
                {editingSeasonId ? "Edit" : "Create"} <span>Season</span>
              </h2>
            </div>
          </div>

          <form
            className="admin-product-form"
            onSubmit={handleSeasonSubmit}
          >
            <div className="admin-product-form-grid">
              <label>
                Season Name
                <input
                  type="text"
                  value={seasonName}
                  onChange={(e) => setSeasonName(e.target.value)}
                  placeholder="Christmas Special"
                  required
                />
              </label>

              <label>
                Start Date & Time
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </label>

              <label>
                End Date & Time
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </label>

              <label className="admin-product-full-width">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a short description about this season..."
                  rows={4}
                  required
                />
              </label>

              <label className="admin-product-full-width">
                Banner Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBannerChange}
                  required={!editingSeasonId}
                />

                <small>JPG, PNG or WEBP • Maximum 5 MB</small>
              </label>

              {bannerPreview && (
                <div className="season-banner-preview admin-product-full-width">
                  <img
                    src={bannerPreview}
                    alt="Season banner preview"
                  />
                  <span>
                    {bannerImage ? "New banner preview" : "Current banner"}
                  </span>
                </div>
              )}
            </div>

            <div className="admin-product-form-actions">
              <button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingSeasonId
                  ? "Update Season ✨"
                  : "Create Season 🎀"}
              </button>

              {editingSeasonId && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="season-list-section">
          <div className="admin-orders-section-title">
            <div>
              <h2>
                Your <span>Seasons</span>
              </h2>
              <p>Manage all your seasonal campaigns here.</p>
            </div>

            <span className="admin-order-count">
              {seasons.length} Seasons
            </span>
          </div>

          {loading && seasons.length === 0 ? (
            <div className="admin-orders-message">
              <div className="admin-loading-icon">🧸</div>
              <p>Loading seasons...</p>
            </div>
          ) : seasons.length === 0 ? (
            <div className="admin-empty-orders">
              <div>🎁</div>
              <h2>No seasons created yet!</h2>
              <p>Create your first seasonal campaign above.</p>
            </div>
          ) : (
            <div className="season-cards-grid">
              {seasons.map((season) => (
                <article className="season-card" key={season._id}>
                  <div className="season-card-banner">
                    <img
                      src={getImageUrl(season.bannerImage)}
                      alt={season.name}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />

                    <span
                      className={
                        season.isActive
                          ? "season-status active"
                          : "season-status inactive"
                      }
                    >
                      {season.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="season-card-content">
                    <h3>{season.name}</h3>
                    <p>{season.description}</p>

                    <div className="season-date-info">
                      <span>📅 Start</span>
                      <strong>
                        {new Date(season.startDate).toLocaleString()}
                      </strong>
                    </div>

                    <div className="season-date-info">
                      <span>⏰ End</span>
                      <strong>
                        {new Date(season.endDate).toLocaleString()}
                      </strong>
                    </div>

                    <div className="season-card-actions">
                      <button
                        type="button"
                        onClick={() => handleSelectSeason(season)}
                      >
                        Manage Products
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditSeason(season)}
                      >
                        Edit
                      </button>
                    </div>

                    <div className="season-card-actions secondary-actions">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(season)}
                      >
                        {season.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSeason(season)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedSeason && (
          <section className="admin-product-form-section season-products-section">
            <div className="admin-orders-section-title">
              <div>
                <h2>
                  Manage <span>Products</span> 🧸
                </h2>

                <p>
                  Season: <strong>{selectedSeason.name}</strong>
                </p>
              </div>

              <button
                type="button"
                className="season-close-button"
                onClick={() => {
                  setSelectedSeason(null);
                  setSeasonProducts([]);
                  setMessage("");
                  setError("");
                }}
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddProducts}>
              <h3 className="season-subheading">
                Add Products to This Season 🎁
              </h3>

              {selectedProducts.map((item, index) => {
                const selectedProduct = products.find(
                  (product) => product._id === item.productId
                );

                return (
                  <div className="season-product-row" key={index}>
                    <label>
                      Select Product
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateSelectedProduct(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">Choose a product</option>

                        {products
                          .filter(
                            (product) =>
                              !seasonProducts.some(
                                (offer) =>
                                  offer.productId?._id === product._id
                              ) ||
                              product._id === item.productId
                          )
                          .map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name} - Rs. {product.price}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label>
                      Original Price (Rs.)
                      <input
                        type="text"
                        value={selectedProduct ? selectedProduct.price : ""}
                        placeholder="Select a product"
                        readOnly
                      />
                    </label>

                    <label>
                      Offer Price (Rs.)
                      <input
                        type="number"
                        min="1"
                        max={
                          selectedProduct
                            ? selectedProduct.price - 0.01
                            : undefined
                        }
                        value={item.offerPrice}
                        onChange={(e) =>
                          updateSelectedProduct(
                            index,
                            "offerPrice",
                            e.target.value
                          )
                        }
                        placeholder="Enter offer price"
                        required
                      />
                    </label>

                    {selectedProducts.length > 1 && (
                      <button
                        type="button"
                        className="season-remove-row"
                        onClick={() => removeProductRow(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}

              <div className="season-add-actions">
                <button
                  type="button"
                  className="season-add-row-button"
                  onClick={addProductRow}
                >
                  + Add Another Product
                </button>

                <button type="submit" disabled={savingProducts}>
                  {savingProducts ? "Adding..." : "Save Products 🎀"}
                </button>
              </div>
            </form>

            <div className="season-current-products">
              <h3 className="season-subheading">
                Products in This Season ({seasonProducts.length})
              </h3>

              {seasonProducts.length === 0 ? (
                <div className="season-no-products">
                  <span>🧸</span>
                  <p>No products added to this season yet.</p>
                </div>
              ) : (
                <div className="season-products-grid">
                  {seasonProducts.map((offer) => (
                    <SeasonProductCard
                      key={offer._id}
                      offer={offer}
                      onUpdate={handleUpdateOfferPrice}
                      onRemove={handleRemoveProduct}
                      getImageUrl={getImageUrl}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="admin-orders-footer">
          <div className="admin-footer-message">
            Made with <span>♥</span> for little smiles!
          </div>

          <div className="admin-footer-gift">🎁</div>

          <div className="admin-footer-teddy">
            <img src="/teddy-hero.png" alt="Cute teddy bear" />
          </div>
        </footer>
      </div>
    </div>
  );
};

interface SeasonProductCardProps {
  offer: SeasonProduct;
  onUpdate: (offer: SeasonProduct, price: string) => void;
  onRemove: (offerId: string) => void;
  getImageUrl: (image?: string) => string;
}

const SeasonProductCard = ({
  offer,
  onUpdate,
  onRemove,
  getImageUrl,
}: SeasonProductCardProps) => {
  const [price, setPrice] = useState(String(offer.offerPrice));

  useEffect(() => {
    setPrice(String(offer.offerPrice));
  }, [offer.offerPrice]);

  const product = offer.productId;

  return (
    <article className="season-product-card">
      <img src={offer.productId?.image || "/placeholder.png"}
      alt={offer.productId?.name || "Product"}
      onError={(e) => {
        e.currentTarget.src = "/placeholder.png";
      }}
    />

      <div className="season-product-card-info">
        <h4>{product?.name || "Unknown product"}</h4>

        <p>Original: Rs. {product?.price}</p>

        <label>
          Offer Price (Rs.)
          <input
            type="number"
            min="1"
            max={product?.price ? product.price - 0.01 : undefined}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <strong className="season-discount-label">
          {offer.discountPercent}% OFF
        </strong>

        <div className="season-product-buttons">
          {/* <button
            type="button"
            onClick={() => onUpdate(offer, price)}
          >
            Update Price
          </button> */}

          <button
            type="button"
            onClick={() => onRemove(offer._id)}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
};

export default SeasonalOffers;
