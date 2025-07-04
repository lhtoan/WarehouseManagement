import "./CardProduct.css";
import React, { useState, useEffect } from "react";

export default function CardProduct({ product, onSelect, resetSignal  }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  const sizes = [...new Set(product.variants.map(v => v.size))];
  const colors = [...new Set(product.variants.map(v => v.color))];

  useEffect(() => {
    const variant = product.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    setSelectedVariant(variant || null);
  }, [selectedSize, selectedColor, product.variants]);

  useEffect(() => {
    handleReset();
  }, [resetSignal]);

  const handleReset = () => {
    setSelectedSize("");
    setSelectedColor("");
    setSelectedVariant(null);
  };

  return (
    <div className="card-product">
      <img
        src={`http://localhost:3000/images/${selectedVariant?.hinh_anh || product.variants[0].hinh_anh}`}
        onError={(e) => (e.target.src = "../../../public/picture.png")}
        alt="Ảnh sản phẩm"
      />
      <div className="card-body">
        <h2 className="card-title">{product.ten_san_pham}</h2>

        <div>
          <p className="variant-label">Chọn size:</p>
          <div className="variant-options">
            {sizes.map((size) => (
              <button
                key={size}
                className={`variant-button ${size === selectedSize ? "active" : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="variant-label">Chọn màu:</p>
          <div className="variant-options">
            {colors.map((color) => (
              <button
                key={color}
                className={`variant-button ${color === selectedColor ? "active" : ""}`}
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {selectedVariant && (
          <div className="price">
            Giá: {Number(selectedVariant.gia_ban).toLocaleString("vi-VN")} VNĐ
          </div>
        )}

        <button
          className="select-button"
          onClick={() => {
            if (!selectedVariant) return;

            if (selectedVariant.so_luong <= 0) {
              alert("Sản phẩm này đã hết hàng!");
              return;
            }

            onSelect({
              bien_the_id: selectedVariant.bien_the_id,
              productId: product.id,
              tenSanPham: product.ten_san_pham,
              size: selectedSize,
              color: selectedColor,
              gia_ban: selectedVariant.gia_ban,
              hinh_anh: selectedVariant.hinh_anh,
              so_luong: selectedVariant.so_luong,
            });
          }}
          disabled={!selectedVariant}
        >
          {selectedVariant ? "Chọn biến thể" : "Chọn size và màu"}
        </button>



        {(selectedSize || selectedColor) && (
          <button className="reset-button" onClick={handleReset}>
            Bỏ chọn
          </button>
        )}
      </div>
    </div>
  );
}
