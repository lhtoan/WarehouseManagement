// pages/Order.jsx
import React, { useEffect, useState } from "react";
import CardProduct from "../../components/CardProduct";
import { fetchProductsWithVariants } from "../../services/productService";
import "./Order.css";

export default function Order() {
  const [products, setProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    fetchProductsWithVariants()
      .then(setProducts)
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (variantInfo) => {
    const exists = selectedVariants.some(
      (item) =>
        item.productId === variantInfo.productId &&
        item.size === variantInfo.size &&
        item.color === variantInfo.color
    );
    if (!exists) {
      setSelectedVariants((prev) => [...prev, variantInfo]);
    }
  };

  const handleRemove = (index) => {
    setSelectedVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Tạo danh sách unique size và màu
  const sizes = [...new Set(products.flatMap((p) => p.variants.map((v) => v.size)))];
  const colors = [...new Set(products.flatMap((p) => p.variants.map((v) => v.color)))];

  // Lọc sản phẩm theo tên, size, màu
  const filteredProducts = products.filter((product) => {
    const matchName = product.ten_san_pham.toLowerCase().includes(searchTerm.toLowerCase());

    const matchVariant = product.variants.some((variant) => {
      const matchSize = selectedSize ? variant.size === selectedSize : true;
      const matchColor = selectedColor ? variant.color === selectedColor : true;
      return matchSize && matchColor;
    });

    return matchName && matchVariant;
  });

  return (
    <div className="order-container">
      <div className="order-product-section">
        <h1>Tạo đơn hàng</h1>

        {/* Thanh tìm kiếm và lọc */}
        <div className="order-filter">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="filter-group">
            <span>Size: </span>
            {sizes.map((size) => (
              <button
                key={size}
                className={selectedSize === size ? "active" : ""}
                onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <span>Màu: </span>
            {colors.map((color) => (
              <button
                key={color}
                className={selectedColor === color ? "active" : ""}
                onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <div className="order-product-grid">
            {filteredProducts.map((product) => (
              <CardProduct
                key={product.id}
                product={product}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar sản phẩm đã chọn */}
      <div className="order-sidebar">
        <h2>Đã chọn ({selectedVariants.length})</h2>
        {selectedVariants.length === 0 ? (
          <p>Chưa có sản phẩm nào</p>
        ) : (
          <ul>
            {selectedVariants.map((item, index) => (
              <li key={index} className="order-selected-item">
                <img
                  src={`http://localhost:3000/images/${item.hinh_anh}`}
                  alt={item.tenSanPham}
                  className="order-sidebar-img"
                />
                <div className="order-sidebar-info">
                  <p>{item.tenSanPham}</p>
                  <p>Size: {item.size} - Màu: {item.color}</p>
                  <p>Giá: {item.gia_ban.toLocaleString()} VND</p>
                  <button onClick={() => handleRemove(index)}>Xoá</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
