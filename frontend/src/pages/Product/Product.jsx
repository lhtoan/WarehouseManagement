import './Product.css';
import { useState, useEffect } from 'react';
import { fetchProducts } from '../../services/productService';
import { useNavigate } from 'react-router-dom';
import FormUpdate from './FormUpdate';

export default function Product() {
  const [productData, setProductData] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Load products ---
  async function loadProducts() {
    try {
      const data = await fetchProducts();
      const mapped = data.flatMap((item) => {
        return item.bien_the.flatMap((variant) => {
          return variant.lo_hang.map((lo) => ({
            maSanPham: item.ma_san_pham,
            tenSanPham: item.ten_san_pham,
            hinhAnh: variant.hinh_anh || '',
            mauSac: variant.mau,
            size: variant.size,
            giaBan: Number(lo.gia_ban),
            soLuong: lo.so_luong,
            loHang: new Date(lo.ngay_nhap).toLocaleDateString('vi-VN'),
            variantId: variant.bien_the_id,
            loHangId: lo.lo_hang_id,
          }));
        });
      });
      setProductData(mapped);
    } catch (error) {
      console.error('Lỗi:', error);
    }
  }
  
  useEffect(() => {
    loadProducts();
  }, []);
  

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = productData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productData.length / itemsPerPage);

  const handleUpdate = (updatedProduct) => {
    console.log("Sản phẩm đã cập nhật:", updatedProduct);
    loadProducts();
    setShowUpdatePopup(false);
    setSelectedProduct(null);
  };
  

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Form state for adding product and variants ---
  const [newProduct, setNewProduct] = useState({
    maSanPham: '',
    tenSanPham: '',
    bienThe: [
      {
        mauSac: '',
        size: '',
        hinhAnh: '',
        loHang: '',
        giaBan: '',
        soLuong: '',
      },
    ],
  });

  // Handle product info change
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle variant change by index
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => {
      const updatedVariants = [...prev.bienThe];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [name]: value,
      };
      return {
        ...prev,
        bienThe: updatedVariants,
      };
    });
  };

  // Add a new variant
  const addVariant = () => {
    setNewProduct((prev) => ({
      ...prev,
      bienThe: [
        ...prev.bienThe,
        { mauSac: '', size: '', hinhAnh: '', loHang: '', giaBan: '', soLuong: '' },
      ],
    }));
  };

  // Remove variant by index
  const removeVariant = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      bienThe: prev.bienThe.filter((_, i) => i !== index),
    }));
  };

  // Handle form submit (add product)
  const handleAddSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newProduct.maSanPham || !newProduct.tenSanPham) {
      alert('Vui lòng nhập mã và tên sản phẩm');
      return;
    }

    for (const variant of newProduct.bienThe) {
      if (
        !variant.mauSac ||
        !variant.size ||
        !variant.loHang ||
        !variant.giaBan ||
        !variant.soLuong
      ) {
        alert('Vui lòng nhập đầy đủ thông tin biến thể');
        return;
      }
    }

    // Chuẩn bị dữ liệu gửi lên API
    const productToSave = {
      ma_san_pham: newProduct.maSanPham,
      ten_san_pham: newProduct.tenSanPham,
      bien_the: newProduct.bienThe.map((v) => ({
        mau: v.mauSac,
        size: v.size,
        hinh_anh: v.hinhAnh,
        lo_hang: [
          {
            ngay_nhap: v.loHang,
            gia_ban: Number(v.giaBan),
            so_luong: Number(v.soLuong),
          },
        ],
      })),
    };

    console.log('Dữ liệu sản phẩm mới:', productToSave);

    // TODO: gọi API thêm sản phẩm ở đây

    // Sau khi thêm thành công, reset form và đóng popup
    setNewProduct({
      maSanPham: '',
      tenSanPham: '',
      bienThe: [
        {
          mauSac: '',
          size: '',
          hinhAnh: '',
          loHang: '',
          giaBan: '',
          soLuong: '',
        },
      ],
    });
    setShowAddPopup(false);

    // Reload lại danh sách sản phẩm nếu cần
  };

  return (
    <div className="product-page">
      <h1>QUẢN LÝ SẢN PHẨM</h1>

      <div className="actions">
        <button className='btn btn-add' onClick={() => navigate('/products/add')}>
          <i className="uil uil-plus-circle"></i> NHẬP HÀNG
        </button>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã SP</th>
            <th>Lô hàng</th>
            <th>Tên SP</th>
            <th>Màu sắc</th>
            <th>Size</th>
            <th>Giá bán</th>
            <th>Số lượng</th>
            <th>Hình ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((sp, i) => (
            <tr key={`${sp.maSanPham}-${i}`}>
              <td>{indexOfFirstItem + i + 1}</td>
              <td>{sp.maSanPham}</td>
              <td>{sp.loHang}</td>
              <td>{sp.tenSanPham}</td>
              <td>{sp.mauSac}</td>
              <td>{sp.size}</td>
              <td>{sp.giaBan.toLocaleString()} đ</td>
              <td>{sp.soLuong}</td>
              <td>
                <img
                  src={`http://localhost:3000/images/${sp.hinhAnh}`}
                  alt={sp.tenSanPham}
                  width="80"
                />
              </td>
              <td>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setSelectedProduct(sp);
                    setShowUpdatePopup(true);
                  }}
                >
                  Sửa
                </button>
                <button className="btn btn-delete">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="pagination">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          Trang trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => goToPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Trang sau
        </button>
      </div>

      {showUpdatePopup && selectedProduct && (
        <FormUpdate
          product={selectedProduct}
          onClose={() => {
            setShowUpdatePopup(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleUpdate}
        />
      )}

      {/* Popup thêm sản phẩm */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Thêm sản phẩm mới</h2>
            <form className="product-form" onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Mã sản phẩm *</label>
                <input
                  type="text"
                  name="maSanPham"
                  value={newProduct.maSanPham}
                  onChange={handleProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  name="tenSanPham"
                  value={newProduct.tenSanPham}
                  onChange={handleProductChange}
                  required
                />
              </div>

              <h3>Biến thể sản phẩm</h3>
              {newProduct.bienThe.map((variant, index) => (
                <div key={index} className="variant-group">
                  <div className="form-group">
                    <label>Màu sắc *</label>
                    <input
                      type="text"
                      name="mauSac"
                      value={variant.mauSac}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Size *</label>
                    <input
                      type="text"
                      name="size"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Hình ảnh (tên file)</label>
                    <input
                      type="text"
                      name="hinhAnh"
                      value={variant.hinhAnh}
                      onChange={(e) => handleVariantChange(index, e)}
                      placeholder="vd: image.jpg"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày nhập *</label>
                    <input
                      type="date"
                      name="loHang"
                      value={variant.loHang}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá bán *</label>
                    <input
                      type="number"
                      name="giaBan"
                      value={variant.giaBan}
                      onChange={(e) => handleVariantChange(index, e)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số lượng *</label>
                    <input
                      type="number"
                      name="soLuong"
                      value={variant.soLuong}
                      onChange={(e) => handleVariantChange(index, e)}
                      min="0"
                      required
                    />
                  </div>

                  {newProduct.bienThe.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-delete-variant"
                      onClick={() => removeVariant(index)}
                    >
                      Xóa biến thể
                    </button>
                  )}
                  <hr />
                </div>
              ))}

              <button
                type="button"
                className="btn btn-add-variant"
                onClick={addVariant}
              >
                Thêm biến thể mới
              </button>

              <div className="form-actions">
                <button type="submit" className="btn btn-save">
                  Lưu sản phẩm
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowAddPopup(false)}
                >
                  Hủy
                </button>
              </div>
            </form>

            <button
              className="btn btn-close"
              onClick={() => setShowAddPopup(false)}
              title="Đóng"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
