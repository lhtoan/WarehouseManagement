import './Product.css';
import { useState, useEffect } from 'react';
import { fetchProducts } from '../../services/productService';
import { useNavigate } from 'react-router-dom';
import FormUpdate from './FormUpdate';

export default function Product() {
  const [productData, setProductData] = useState([]);
  // const [showAddPopup, setShowAddPopup] = useState(false);
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

  const handleUpdate = () => {
    loadProducts();
    setShowUpdatePopup(false);
    setSelectedProduct(null);
  };
  

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
    </div>
  );
}
