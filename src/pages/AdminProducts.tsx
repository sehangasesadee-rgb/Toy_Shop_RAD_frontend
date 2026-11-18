
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  discount: number;
  category: string;
  ageRange: string;
  image: string;
  stock: number;
  
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  oldPrice: "",
  discount: "",
  category: "",
  ageRange: "3-5",
  image: "",
  stock: "0",
  
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token) {
      navigate("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      navigate("/");
      return;
    }

    fetchProducts();
  }, [navigate, token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/products");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load products");
      }

      setProducts(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  setForm((prev) => {
    const updatedForm = {
      ...prev,
      [name]: value,
    };

    if (name === "oldPrice" || name === "discount") {
      const oldPrice = Number(
        name === "oldPrice" ? value : prev.oldPrice
      );

      const discount = Number(
        name === "discount" ? value : prev.discount
      );

      if (
        oldPrice > 0 &&
        discount >= 0 &&
        discount <= 100
      ) {
        updatedForm.price = String(
          Math.round(oldPrice * (1 - discount / 100))
        );
      } else {
        updatedForm.price = "";
      }
    }

    return updatedForm;
  });
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        ageRange: form.ageRange,
        image: form.image.trim(),
        price: Number(form.price),
        oldPrice: Number(form.oldPrice),
        discount: Number(form.discount),
        stock: Number(form.stock),
      };

      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Product save failed");
      }

      alert(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      setForm(emptyForm);
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      oldPrice: String(product.oldPrice ?? product.price),
      discount: String(product.discount ?? 0),
      category: product.category,
      ageRange: product.ageRange || "3-5",
      image: product.image,
      stock: String(product.stock),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this toy?"
    );

    if (!confirmed || !token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      alert("Product deleted successfully!");
      await fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  if (loading) {
    return (
      <div className="admin-orders-message">
        <span className="admin-loading-icon">🧸</span>
        <p>Loading your lovely toys...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">

        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              TOOTIETOYS • ADMIN PANEL
            </span>
            <h1>
              Product Management <span>♡</span>
            </h1>
            <p className="admin-orders-subtitle">
              Manage all your lovely toys in one happy place!
            </p>
          </div>

          <div className="admin-heading-decoration">🎀</div>
        </div>

        <div className="admin-orders-summary">
          <div className="admin-summary-card total-card">
            <div className="summary-icon">🧸</div>
            <div>
              <h3>Total Products</h3>
              <p>{products.length}</p>
            </div>
          </div>

          <div className="admin-summary-card confirmed-card">
            <div className="summary-icon">📦</div>
            <div>
              <h3>Total Stock</h3>
              <p>
                {products.reduce(
                  (total, product) => total + product.stock,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <section className="admin-product-form-section">
          <div className="admin-orders-section-title">
            <div>
              <h2>
                {editingId ? "Edit Toy" : "Add a New Toy"} <span>♡</span>
              </h2>
              <p>Fill in the details of your lovely toy</p>
            </div>
          </div>

          <form className="admin-product-form" onSubmit={handleSubmit}>
            <div className="admin-product-form-grid">
              <label>
                Toy Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter toy name"
                  required
                />
              </label>

              <label>
                Category
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Soft Toys"
                  required
                />
              </label>
              <label>
                Age Range
                <select
                  name="ageRange"
                  value={form.ageRange}
                    onChange={(e) =>
                    setForm({ ...form, ageRange: e.target.value })
                  }
                  required
                  >
                    <option value="0-2">0–2 Years</option>
                    <option value="3-5">3–5 Years</option>
                    <option value="6-8">6–8 Years</option>
                    <option value="9-12">9–12 Years</option>
                    <option value="13+">13+ Years</option>
                </select>
              </label>

              <label>
                Price (Rs.)
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  readOnly
                  placeholder="Automatically calculated"
                  required
               />
              </label>
              <label>
                 Old Price (Rs.)
                 <input
                 name="oldPrice"
                 type="number"
                 min="0"
                 value={form.oldPrice}
                 onChange={handleChange}
                 placeholder="Enter original price"
                 required
               />
              </label>

              <label>
                Discount (%)
                <input
                 name="discount"
                 type="number"
                 min="0"
                 max="100"
                 value={form.discount}
                 onChange={handleChange}
                 placeholder="Enter discount percentage"
                 required
                />
              </label>

              <label>
                Stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="admin-product-full-width">
                Image Path
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="/toy_img1.png"
                  required
                />
              </label>

              <label className="admin-product-full-width">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write a short toy description..."
                  rows={4}
                  required
                />
              </label>
            </div>

            {error && <p className="admin-product-error">{error}</p>}

            <div className="admin-product-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Toy ♡"
                  : "Add Toy ♡"}
              </button>

              {editingId && (
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <div className="admin-orders-section-title">
          <div>
            <h2>All Products <span>♡</span></h2>
            <p>View and manage your toy collection</p>
          </div>
          <span className="admin-order-count">
            {products.length} Products
          </span>
        </div>

        {products.length === 0 ? (
          <div className="admin-empty-orders">
            <div>🧸</div>
            <h2>No products yet!</h2>
            <p>Add your first lovely toy above.</p>
          </div>
        ) : (
          <div className="admin-products-grid">
            {products.map((product) => (
              <article className="admin-product-card" key={product._id}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="admin-product-card-image"
                />

                <div className="admin-product-card-info">
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <div className="admin-product-card-prices">
                    <strong>
                      Rs. {product.price.toLocaleString()}
                    </strong>
                    <del>
                      Rs. {product.oldPrice?.toLocaleString() ?? product.price.toLocaleString()}
                    </del>

                    <span>{product.discount ?? 0}% OFF</span>
                  </div>

                  <small>Stock: {product.stock}</small>

                  <div className="admin-product-card-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      <footer className="admin-orders-footer">
        <div className="admin-footer-message">
          <span>✨</span>
          Thank you for being a part of TootieToys!
          <span>♡</span>
        </div>

        <div className="admin-footer-teddy">
          <img src="/teddy-hero.png" alt="Cute TootieToys teddy bear" />
        </div>

        <div className="admin-footer-gift">🎁</div>
      </footer>
    </div>
  );
};

export default AdminProducts;
