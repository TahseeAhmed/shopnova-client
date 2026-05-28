import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AdminCategories = () => {
  const { token } = useSelector((s) => s.auth);
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [saving, setSaving] = useState(false);

  const load = () =>
    axios
      .get(`${API}/categories`, { headers })
      .then((r) => setCats(r.data.categories || []))
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", description: "", image: "" });
    setModal(true);
  };
  const openEdit = (c, e) => {
    e.stopPropagation();
    setEditing(c._id);
    setForm({ name: c.name, description: c.description, image: c.image });
    setModal(true);
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/categories/${id}`, { headers });
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing)
        await axios.put(`${API}/categories/${editing}`, form, { headers });
      else await axios.post(`${API}/categories`, form, { headers });
      toast.success(editing ? "Category updated!" : "Category created!");
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
    setSaving(false);
  };

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
          <h1>Categories</h1>
          <p>{cats.length} categories</p>
        </div>
        <button className="btn btn-dark" onClick={openAdd}>
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      <div className="cat-grid">
        {cats.map((c) => (
          <div
            key={c._id}
            className="cat-admin-card"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/admin/products?category=${c._id}&name=${c.name}`)
            }
          >
            <div className="cat-admin-img">
              <img
                src={
                  c.image ||
                  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300"
                }
                alt={c.name}
              />
            </div>
            <div className="cat-admin-body">
              <strong>{c.name}</strong>
              <p>{c.description || "No description"}</p>
            </div>
            <div className="cat-admin-actions">
              <button className="td-btn edit" onClick={(e) => openEdit(c, e)}>
                <FiEdit2 size={13} />
              </button>
              <button
                className="td-btn del"
                onClick={(e) => handleDelete(c._id, c.name, e)}
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editing ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setModal(false)}>
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label className="form-label">Name *</label>
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
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value }))
                  }
                />
                {form.image && (
                  <img
                    src={form.image}
                    alt="preview"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      marginTop: 8,
                      maxHeight: 120,
                      objectFit: "cover",
                    }}
                  />
                )}
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
                  {saving ? "Saving…" : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
