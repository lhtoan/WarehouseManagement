import './Product.css';
import { useState, useEffect } from 'react';
import { fetchProducts, deleteVariantById } from '../../services/productService';
import { useNavigate } from 'react-router-dom';
import FormUpdate from './FormUpdate';

export default function Product() {
  const [productData, setProductData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedLoHang, setSelectedLoHang] = useState('');

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
      setFilteredData(mapped);
    } catch (error) {
      console.error('Lỗi:', error);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let filtered = productData;
  
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter((item) =>
        item.tenSanPham.toLowerCase().includes(lowerSearch) ||
        item.maSanPham.toLowerCase().includes(lowerSearch) ||
        item.mauSac.toLowerCase().includes(lowerSearch) ||
        item.size.toLowerCase().includes(lowerSearch) ||
        item.loHang.toLowerCase().includes(lowerSearch) ||
        item.giaBan.toString().includes(lowerSearch) ||
        item.soLuong.toString().includes(lowerSearch)
      );
    }
  
    if (selectedSize) {
      filtered = filtered.filter((item) => item.size.trim() === selectedSize);
    }
    
  
    if (selectedColor) {
      filtered = filtered.filter((item) => item.mauSac === selectedColor);
    }
  
    if (selectedLoHang) {
      filtered = filtered.filter((item) => item.loHang === selectedLoHang);
    }
  
    setFilteredData(filtered);
    setCurrentPage(1); // reset page on filter
  }, [searchText, selectedSize, selectedColor, selectedLoHang, productData]);
  

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleUpdate = () => {
    loadProducts();
    setShowUpdatePopup(false);
    setSelectedProduct(null);
  };

  const handleDelete = async (variantId) => {
    if (!window.confirm('Bạn có chắc muốn xóa biến thể này?')) return;
  
    try {
      await deleteVariantById(variantId); 
      // alert(data.message);
      loadProducts();
    } catch (err) {
      console.error('Lỗi khi xóa biến thể:', err);
      alert(err.message);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get unique sizes and colors for filter buttons
  const uniqueSizes = [...new Set(productData.map((item) => item.size.trim()))];

  const uniqueColors = [...new Set(productData.map((item) => item.mauSac))];
  const uniqueLoHangs = [...new Set(productData.map((item) => item.loHang))];

  return (
    <div className="product-page">
      <h1>QUẢN LÝ SẢN PHẨM</h1>

      {/* Search and Filter */}
      <div className="search-filter-product">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="filter-comboboxes">
          <div className="filter-group">
            <label>Size: </label>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
              <option value="">Tất cả</option>
              {uniqueSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Màu: </label>
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              <option value="">Tất cả</option>
              {uniqueColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Lô hàng: </label>
            <select value={selectedLoHang} onChange={(e) => setSelectedLoHang(e.target.value)}>
              <option value="">Tất cả</option>
              {uniqueLoHangs.map((lo) => (
                <option key={lo} value={lo}>
                  {lo}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label></label>
            <button
              className="btn btn-cancel"
              onClick={() => {
                setSelectedSize('');
                setSelectedColor('');
                setSelectedLoHang('');
              }}
            >
              <i className="uil uil-filter-slash"></i>
            </button>
          </div>

        </div>

      </div>

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
              <td>{sp.giaBan.toLocaleString()} VNĐ</td>
              <td style={{ color: sp.soLuong === 0 ? 'red' : 'inherit', fontWeight: sp.soLuong === 0 ? 'bold' : 'normal' }}>
                {sp.soLuong === 0 ? 'HẾT HÀNG' : sp.soLuong}
              </td>


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
                <button className="btn btn-delete" onClick={() => handleDelete(sp.variantId)}>
                  Xóa
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
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

      {/* Popup cập nhật */}
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
