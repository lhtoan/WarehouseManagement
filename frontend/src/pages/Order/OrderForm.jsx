import React from "react";
import "./OrderForm.css";

export default function OrderForm({
  form,
  setForm,
  donViVCList,
  selectedVariants,
  totalAmount,
  onSubmit,
  onClose,
}) {
  // Hàm xử lý xác nhận đơn hàng với kiểm tra đầu vào
  const handleSubmitOrder = () => {
    if (
      !form.ten_khach_hang.trim() ||
      !form.so_dien_thoai.trim() ||
      !form.dia_chi.trim() ||
      !form.don_vi_vc_id ||
      isNaN(form.don_vi_vc_id)
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    onSubmit();
  };

  return (
    <div className="order-form-overlay">
      <div className="order-form">
        <h2>Thông tin đơn hàng</h2>

        <div className="order-form-grid">
          {/* Nửa trái - Sản phẩm đã chọn */}
          <div className="form-left">
            <h4>Sản phẩm đã chọn:</h4>
            {selectedVariants.length === 0 ? (
              <p>Không có sản phẩm.</p>
            ) : (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Size</th>
                    <th>Màu</th>
                    <th>SL</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVariants.map((item, index) => (
                    <tr key={index}>
                      <td>{item.tenSanPham}</td>
                      <td>{item.size}</td>
                      <td>{item.color}</td>
                      <td>{item.quantity}</td>
                      <td>{Number(item.gia_ban).toLocaleString("vi-VN")} VNĐ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p className="order-form-total">
              <strong>Tổng tiền:</strong>{" "}
              {Number(totalAmount).toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          {/* Nửa phải - Thông tin giao hàng */}
          <div className="form-right">
            <label>Họ tên khách hàng: <span className="required">*</span></label>
            <input
              type="text"
              required
              value={form.ten_khach_hang}
              onChange={(e) =>
                setForm({ ...form, ten_khach_hang: e.target.value })
              }
            />

            <label>Số điện thoại: <span className="required">*</span></label>
            <input
              type="text"
              required
              value={form.so_dien_thoai}
              onChange={(e) =>
                setForm({ ...form, so_dien_thoai: e.target.value })
              }
            />

            <label>Đơn vị vận chuyển: <span className="required">*</span></label>
            <select
              required
              value={form.don_vi_vc_id || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  don_vi_vc_id: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            >
              <option value="">-- Chọn đơn vị --</option>
              {donViVCList.map((vc) => (
                <option key={vc.id} value={vc.id}>
                  {vc.ten_don_vi}
                </option>
              ))}
            </select>

            <label>Địa chỉ: <span className="required">*</span></label>
            <textarea
              required
              value={form.dia_chi}
              onChange={(e) =>
                setForm({ ...form, dia_chi: e.target.value })
              }
            />

            <label>Ghi chú:</label>
            <textarea
              placeholder="Không bắt buộc"
              value={form.gi_chu}
              onChange={(e) =>
                setForm({ ...form, ghi_chu: e.target.value })
              }
            />

            <div className="form-actions">
              <button onClick={onClose}>Hủy</button>
              <button onClick={handleSubmitOrder}>Xác nhận đơn hàng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
