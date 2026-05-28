import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: "",
  brand: "",
  category: "",
  images: [{ url: "" }],
  isFeatured: false,
};

const AdminProducts = () => {
  const { token } = useSelector((s) => s.auth);
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get("category");
  const categoryName = params.get("name");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        axios.get(`${API}/products?limit=200`, { headers }),
        axios.get(`${API}/categories`, { headers }),
      ]);
      setProducts(pRes.data.products);
      setCategories(cRes.data.categories);
    } catch {
      toast.error("Failed to load products");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || "",
      stock: p.stock,
      brand: p.brand || "",
      category: p.category?._id || "",
      images: p.images?.length ? p.images : [{ url: "" }],
      isFeatured: p.isFeatured,
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, images: form.images.filter((i) => i.url) };
      if (editing)
        await axios.put(`${API}/products/${editing}`, payload, { headers });
      else await axios.post(`${API}/products`, payload, { headers });
      toast.success(editing ? "Product updated!" : "Product created!");
      setModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/products/${id}`, { headers });
      toast.success("Deleted");
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter
      ? p.category?._id === categoryFilter || p.category === categoryFilter
      : true;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div
        className="admin-page-title"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1>Products</h1>
          <p>
            {categoryName
              ? `Showing: ${categoryName} (${filtered.length} products)`
              : `${products.length} total products`}
          </p>
          {categoryName && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: "6px", fontSize: "12px" }}
              onClick={() => navigate("/admin/products")}
            >
              <FiX size={12} /> Clear Filter — Show All
            </button>
          )}
        </div>
        <button className="btn btn-dark" onClick={openAdd}>
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Category filter badge */}
      {categoryName && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "10px 16px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, color: "#166534" }}>
            Filtering by category: <strong>{categoryName}</strong>
          </span>
          <button
            onClick={() => navigate("/admin/products")}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#166534",
            }}
          >
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="admin-search-bar">
        <FiSearch size={16} />
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="admin-card" style={{ marginTop: "1rem" }}>
        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
            <p style={{ fontSize: 16 }}>
              No products found {categoryName ? `in "${categoryName}"` : ""}.
            </p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="td-product">
                      <img
                        src={
                          p.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60"
                        }
                        alt={p.name}
                      />
                      <div>
                        <span className="td-name">{p.name}</span>
                        <small>{p.brand}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="td-cat">{p.category?.name}</span>
                  </td>
                  <td>
                    <strong>${p.price}</strong>
                    {p.originalPrice && (
                      <del
                        style={{
                          marginLeft: 6,
                          color: "var(--textl)",
                          fontSize: "0.78rem",
                        }}
                      >
                        ${p.originalPrice}
                      </del>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        color:
                          p.stock < 10
                            ? "var(--red)"
                            : p.stock < 30
                              ? "#f59e0b"
                              : "var(--green)",
                        fontWeight: 700,
                      }}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${p.isFeatured ? "featured" : "normal"}`}
                    >
                      {p.isFeatured ? "Featured" : "Standard"}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="td-btn edit"
                        onClick={() => openEdit(p)}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="td-btn del"
                        onClick={() => handleDelete(p._id, p.name)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editing ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-input"
                    value={form.brand}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brand: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, originalPrice: e.target.value }))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={form.images[0]?.url}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      images: [{ url: e.target.value }],
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                    }
                  />
                  Mark as Featured Product
                </label>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-dark"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editing
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
