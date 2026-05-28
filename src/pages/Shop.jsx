import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories } from "../store/slices/productSlice";
import ProductCard from "../components/product/ProductCard";
import { FiFilter, FiX, FiChevronDown } from "react-icons/fi";
import "./Shop.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

// ── Quick price range presets ────────────────────────────────
const PRICE_RANGES = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under $25", min: "", max: "25" },
  { label: "Low ($25–$75)", min: "25", max: "75" },
  { label: "Medium ($75–$150)", min: "75", max: "150" },
  { label: "High ($150+)", min: "150", max: "" },
];

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const {
    list: products,
    categories,
    total,
    pages,
    loading,
  } = useSelector((s) => s.products);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
    rating: "",
    page: 1,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const slugParam = searchParams.get("category");
    if (slugParam && categories.length > 0) {
      const matched = categories.find((c) => c.slug === slugParam);
      if (matched) setSelectedCategoryId(matched._id);
    }
  }, [categories, searchParams]);

  const applyFilters = useCallback(() => {
    const params = { ...filters };
    if (selectedCategoryId) params.category = selectedCategoryId;
    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });
    dispatch(fetchProducts(params));
  }, [dispatch, filters, selectedCategoryId]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const updateFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  // ── Apply price range preset ─────────────────────────────
  const applyPriceRange = (index) => {
    const range = PRICE_RANGES[index];
    setSelectedPriceRange(index);
    setFilters((f) => ({
      ...f,
      minPrice: range.min,
      maxPrice: range.max,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSelectedCategoryId("");
    setSelectedPriceRange(0);
    setFilters({
      keyword: "",
      sort: "newest",
      minPrice: "",
      maxPrice: "",
      rating: "",
      page: 1,
    });
  };

  const hasActiveFilters =
    selectedCategoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.keyword ||
    filters.rating;

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="container">
          <h1>Shop All Products</h1>
          <p>
            {total} products found
            {filters.keyword && ` for "${filters.keyword}"`}
            {selectedCategoryId &&
              ` in ${categories.find((c) => c._id === selectedCategoryId)?.name}`}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="shop-layout">
          {/* ── Sidebar ── */}
          <aside className={`shop-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-head">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button className="clear-btn" onClick={clearFilters}>
                  <FiX size={14} /> Clear all
                </button>
              )}
              <button
                className="sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                <FiX />
              </button>
            </div>

            {/* Category filter */}
            <div className="filter-section">
              <h4>Category</h4>
              <button
                className={`cat-filter-btn ${!selectedCategoryId ? "active" : ""}`}
                onClick={() => setSelectedCategoryId("")}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  className={`cat-filter-btn ${selectedCategoryId === c._id ? "active" : ""}`}
                  onClick={() => setSelectedCategoryId(c._id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* ── Price range presets ── */}
            <div className="filter-section">
              <h4>Price Range</h4>
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={i}
                  className={`cat-filter-btn ${selectedPriceRange === i ? "active" : ""}`}
                  onClick={() => applyPriceRange(i)}
                >
                  {range.label}
                </button>
              ))}
              {/* Custom price inputs */}
              <div className="price-inputs" style={{ marginTop: "10px" }}>
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice}
                  onChange={(e) => {
                    setSelectedPriceRange(-1);
                    updateFilter("minPrice", e.target.value);
                  }}
                  className="form-input"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice}
                  onChange={(e) => {
                    setSelectedPriceRange(-1);
                    updateFilter("maxPrice", e.target.value);
                  }}
                  className="form-input"
                />
              </div>
            </div>

            {/* Rating filter */}
            <div className="filter-section">
              <h4>Min Rating</h4>
              <button
                className={`cat-filter-btn ${!filters.rating ? "active" : ""}`}
                onClick={() => updateFilter("rating", "")}
              >
                All Ratings
              </button>
              {[4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  className={`cat-filter-btn ${filters.rating === r ? "active" : ""}`}
                  onClick={() => updateFilter("rating", r)}
                >
                  {"★".repeat(r)}
                  {"☆".repeat(5 - r)} & up
                </button>
              ))}
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="shop-main">
            <div className="shop-toolbar">
              <button
                className="filter-toggle-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <FiFilter size={16} /> Filters
              </button>
              <span style={{ fontSize: "14px", color: "#666" }}>
                {total} products
              </span>
              <div className="sort-wrap">
                <span>Sort by:</span>
                <div className="select-wrap">
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {hasActiveFilters && (
              <div className="active-filters">
                {filters.keyword && (
                  <span className="filter-tag">
                    "{filters.keyword}"
                    <button onClick={() => updateFilter("keyword", "")}>
                      <FiX size={11} />
                    </button>
                  </span>
                )}
                {selectedCategoryId && (
                  <span className="filter-tag">
                    {categories.find((c) => c._id === selectedCategoryId)?.name}
                    <button onClick={() => setSelectedCategoryId("")}>
                      <FiX size={11} />
                    </button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="filter-tag">
                    ${filters.minPrice || 0} – ${filters.maxPrice || "∞"}
                    <button
                      onClick={() => {
                        setSelectedPriceRange(0);
                        updateFilter("minPrice", "");
                        updateFilter("maxPrice", "");
                      }}
                    >
                      <FiX size={11} />
                    </button>
                  </span>
                )}
                {filters.rating && (
                  <span className="filter-tag">
                    {"★".repeat(filters.rating)} & up
                    <button onClick={() => updateFilter("rating", "")}>
                      <FiX size={11} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products grid */}
            {loading ? (
              <div className="spinner-wrap">
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-dark" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${filters.page === p ? "active" : ""}`}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Shop;
