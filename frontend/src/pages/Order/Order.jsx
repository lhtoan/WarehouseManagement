import React, { useEffect, useState } from "react";
import CardProduct from "../../components/CardProduct";
import { fetchProductsWithVariants } from "../../services/productService";
import { getAllShippingUnits, createOrder } from "../../services/orderService";
import OrderForm from "./OrderForm";
import "./Order.css";

export default function Order() {
  const [products, setProducts] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const [form, setForm] = useState({
    ten_khach_hang: "",
    so_dien_thoai: "",
    dia_chi: "",
    ghi_chu: "",
    don_vi_vc_id: "",
  });

  const [donViVCList, setDonViVCList] = useState([]);

  useEffect(() => {
    fetchProductsWithVariants()
      .then(setProducts)
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err))
      .finally(() => setLoading(false));

    getAllShippingUnits()
      .then(setDonViVCList)
      .catch((err) => console.error("Lỗi lấy đơn vị vận chuyển:", err));
  }, []);

  const handleSelect = (variantInfo) => {
    if (!variantInfo.bien_the_id) {
      console.warn("Thiếu bien_the_id trong variantInfo:", variantInfo);
      return;
    }
  
    if (variantInfo.so_luong === 0) {
      alert("Sản phẩm này đã hết hàng!");
      return;
    }
  
    const existingIndex = selectedVariants.findIndex(
      (item) =>
        item.productId === variantInfo.productId &&
        item.size === variantInfo.size &&
        item.color === variantInfo.color
    );
  
    if (existingIndex !== -1) {
      const existingItem = selectedVariants[existingIndex];
  
      // ✅ Kiểm tra trước khi set state
      if (existingItem.quantity >= variantInfo.so_luong) {
        alert("Số lượng đã đạt giới hạn tồn kho!");
        return;
      }
  
      const updated = [...selectedVariants];
      updated[existingIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      };
      setSelectedVariants(updated);
    } else {
      // Chưa có, thêm mới luôn được
      setSelectedVariants([
        ...selectedVariants,
        {
          bien_the_id: variantInfo.bien_the_id,
          productId: variantInfo.productId,
          tenSanPham: variantInfo.tenSanPham,
          hinh_anh: variantInfo.hinh_anh,
          size: variantInfo.size,
          color: variantInfo.color,
          gia_ban: variantInfo.gia_ban,
          quantity: 1,
          so_luong: variantInfo.so_luong,
        },
      ]);
    }
  };
  
  
  

  const handleRemove = (index) => {
    setSelectedVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemove(index);
    } else {
      setSelectedVariants((prev) => {
        const updated = [...prev];
        updated[index].quantity = newQuantity;
        return updated;
      });
    }
  };

  const handleSubmitOrder = async () => {
    if (
      !form.ten_khach_hang.trim() ||
      !form.so_dien_thoai.trim() ||
      !form.dia_chi.trim() ||
      !form.don_vi_vc_id ||
      isNaN(parseInt(form.don_vi_vc_id)) ||
      selectedVariants.length === 0
    ) {
      alert("Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 sản phẩm.");
      return;
    }

    const orderData = {
      ...form,
      don_vi_vc_id: parseInt(form.don_vi_vc_id),
      items: selectedVariants.map((item) => ({
        bien_the_id: item.bien_the_id,
        quantity: item.quantity,
        gia_ban: item.gia_ban,
      })),
      tong_tien: totalAmount,
    };

    try {
      const result = await createOrder(orderData);
      console.log("Đơn hàng đã được tạo:", result);

      alert("Tạo đơn hàng thành công!");
      setShowForm(false);
      setForm({
        ten_khach_hang: "",
        so_dien_thoai: "",
        dia_chi: "",
        ghi_chu: "",
        don_vi_vc_id: "",
      });
      setSelectedVariants([]);
      setResetSignal(prev => prev + 1);
      // console.log("👉 Dữ liệu gửi đi:", orderData);
    } catch (error) {
      console.error("Lỗi khi gửi đơn hàng:", error);
      // console.log("👉 Dữ liệu gửi đi:", orderData);
      alert("Đã xảy ra lỗi khi tạo đơn hàng.");
    }
  };

  const sizes = [...new Set(products.flatMap((p) => p.variants.map((v) => v.size)))];
  const colors = [...new Set(products.flatMap((p) => p.variants.map((v) => v.color)))];

  const filteredProducts = products.filter((product) => {
    const matchName = product.ten_san_pham.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVariant = product.variants.some((variant) => {
      const matchSize = selectedSize ? variant.size === selectedSize : true;
      const matchColor = selectedColor ? variant.color === selectedColor : true;
      return matchSize && matchColor;
    });
    return matchName && matchVariant;
  });

  const totalAmount = selectedVariants.reduce(
    (sum, item) => sum + item.gia_ban * item.quantity,
    0
  );

  return (
    <>
      <div className="order-container">
        <div className="order-product-section">
          <h1>Tạo đơn hàng</h1>

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

          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : (
            <div className="order-product-grid">
              {filteredProducts.map((product) => (
                <CardProduct key={product.id} product={product} onSelect={handleSelect} resetSignal={resetSignal}/>
              ))}
            </div>
          )}
        </div>

        <div className="order-sidebar">
          <h2>Đã chọn ({selectedVariants.length})</h2>
          {selectedVariants.length === 0 ? (
            <p>Chưa có sản phẩm nào</p>
          ) : (
            <>
              <ul className="order-selected-list">
                {selectedVariants.map((item, index) => (
                  <li key={index} className="order-selected-item">
                    <img
                      src={`http://localhost:3000/images/${item.hinh_anh}`}
                      alt={item.tenSanPham}
                      onError={(e) => (e.target.src = "../../../public/picture.png")}
                      className="order-sidebar-img"
                    />
                    <div className="order-sidebar-info">
                      <p>{item.tenSanPham}</p>
                      <p>Size: {item.size} - Màu: {item.color}</p>
                      <p>
                        Giá: {Number(item.gia_ban).toLocaleString("vi-VN")} VNĐ
                      </p>

                      <div className="quantity-control">
                        <button className="quantity-control-btn" onClick={() => updateQuantity(index, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button className="quantity-control-btn"
                          onClick={() => {
                            if (item.quantity < item.so_luong) {
                              updateQuantity(index, item.quantity + 1);
                            } else {
                              alert("Số lượng đã đạt giới hạn tồn kho!");
                            }
                          }}
                        >
                          +
                        </button>

                      </div>

                      <button onClick={() => handleRemove(index)}>Xoá</button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="order-total highlight">
                Tổng tiền:{" "}
                <strong>{Number(totalAmount).toLocaleString("vi-VN")} VNĐ</strong>
              </div>

              <button className="confirm-btn-1" onClick={() => setShowForm(true)}>
                Xác nhận đơn hàng
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <OrderForm
          form={form}
          setForm={setForm}
          donViVCList={donViVCList}
          selectedVariants={selectedVariants}
          totalAmount={totalAmount}
          onSubmit={handleSubmitOrder}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
