import React, { useState, useEffect } from 'react';
import './ProductAddForm.css';
import {
  fetchColors,
  fetchSizes,
  createProduct,
  addVariant
} from '../../services/productService';
import { fetchBatches } from '../../services/batchesService';
import { useNavigate } from 'react-router-dom';

export default function ProductForm() {
  const navigate = useNavigate();

  const [productInfo, setProductInfo] = useState({
    ma_san_pham: '',
    ten_san_pham: '',
  });

  const [variants, setVariants] = useState([
    { mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: null, preview: '' },
  ]);

  const [showVariantForm, setShowVariantForm] = useState(false);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupType, setPopupType] = useState('success');

  function generateRandomProductCode(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  useEffect(() => {
    setProductInfo((prev) => ({
      ...prev,
      ma_san_pham: generateRandomProductCode()
    }));
  }, []);
  
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [colorsData, sizesData, batchesData] = await Promise.all([
          fetchColors(),
          fetchSizes(),
          fetchBatches(),
        ]);
        setColors(colorsData);
        setSizes(sizesData);
        setBatches(batchesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (productInfo.ma_san_pham && productInfo.ten_san_pham) {
      setShowVariantForm(true);
    } else {
      alert('Vui lòng nhập đầy đủ Mã SP và Tên SP.');
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: null, preview: '' },
    ]);
  };

  const handleVariantChange = (index, field, value, file = null) => {
    const updated = [...variants];
    if (field === 'hinhAnh' && file) {
      updated[index].hinhAnh = file;
      updated[index].preview = URL.createObjectURL(file);
    } else {
      updated[index][field] = value;
    }
    setVariants(updated);
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const productData = {
        ma_san_pham: productInfo.ma_san_pham,
        ten_san_pham: productInfo.ten_san_pham,
      };

      const result = await createProduct(productData);
      const sanPhamId = result.san_pham_id;

      for (const variant of variants) {
        const formData = new FormData();
        formData.append('mau_sac', variant.mauSac);
        formData.append('size', variant.size);
        formData.append('gia_ban', variant.giaBan);
        formData.append('so_luong', variant.soLuong);
        formData.append('lo_hang_id', variant.batchId);
        if (variant.hinhAnh) {
          formData.append('hinh_anh', variant.hinhAnh);
        }
        await addVariant(sanPhamId, formData);
      }

      setProductInfo({ ma_san_pham: '', ten_san_pham: '' });
      setVariants([{ mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: null, preview: '' }]);
      setShowVariantForm(false);
      setPopupType('success');
      setPopupMessage('Thêm sản phẩm thành công!');
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        navigate('/products');
      }, 500);

    } catch (err) {
      if (err.response?.data?.message?.includes("trùng")) {
        setPopupMessage('Mã sản phẩm đã tồn tại!');
        setPopupType('error');
      } else {
        setPopupMessage(err.message || 'Lỗi khi tạo sản phẩm hoặc biến thể');
        setPopupType('error');
      }
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <form className="product-form" onSubmit={handleSubmitAll}>
      <div className="product-basic">
        <h2>Thông tin sản phẩm</h2>
        <label>
          Mã sản phẩm:
          <input
            type="text"
            value={productInfo.ma_san_pham}
            onChange={(e) =>
              setProductInfo({ ...productInfo, ma_san_pham: e.target.value })
            }
            required
          />
        </label>

        <label>
          Tên sản phẩm:
          <input
            type="text"
            value={productInfo.ten_san_pham}
            onChange={(e) =>
              setProductInfo({ ...productInfo, ten_san_pham: e.target.value })
            }
            required
          />
        </label>
        {!showVariantForm && (
          <button onClick={handleCreateProduct} className="btn btn-primary">
            Tạo sản phẩm
          </button>
        )}
      </div>

      {showVariantForm && (
        <div className="variant-section">
          <h2>Biến thể sản phẩm</h2>
          {variants.map((v, index) => (
            <div key={index} className="variant-group">
              <h4>Biến thể {index + 1}</h4>

              <label>
                Màu sắc:
                <select
                  value={v.mauSac}
                  onChange={(e) => handleVariantChange(index, 'mauSac', e.target.value)}
                  required
                >
                  <option value="">-- Chọn màu sắc --</option>
                  {colors.map((color) => (
                    <option key={color.gia_tri_id} value={color.gia_tri}>
                      {color.gia_tri}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Size:
                <select
                  value={v.size}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  required
                >
                  <option value="">-- Chọn size --</option>
                  {sizes.map((size) => (
                    <option key={size.gia_tri_id} value={size.gia_tri}>
                      {size.gia_tri}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Giá bán:
                <input
                  type="number"
                  value={v.giaBan}
                  onChange={(e) => handleVariantChange(index, 'giaBan', e.target.value)}
                  required
                />
              </label>

              <label>
                Số lượng:
                <input
                  type="number"
                  value={v.soLuong}
                  onChange={(e) => handleVariantChange(index, 'soLuong', e.target.value)}
                  required
                />
              </label>

              <label>
                Lô hàng:
                <select
                  value={v.batchId}
                  onChange={(e) => handleVariantChange(index, 'batchId', e.target.value)}
                  required
                >
                  <option value="">-- Chọn lô hàng --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.ma_lo} - {formatDate(batch.ngay_nhap)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Hình ảnh:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleVariantChange(index, 'hinhAnh', '', e.target.files[0])
                  }
                />
              </label>

              {v.preview && (
                <img
                  src={v.preview}
                  alt={`Preview ${index}`}
                  style={{ width: '100px', marginTop: '10px' }}
                />
              )}
            </div>
          ))}

          <div className="btn-action">
            <button type="button" onClick={handleAddVariant} className="btn btn-secondary">
              + Thêm biến thể
            </button>

            <button type="submit" className="btn btn-success">
              Lưu sản phẩm và biến thể
            </button>
          </div>
        </div>
      )}

      {showPopup && (
        <div className={`popup-notification ${popupType === 'error' ? 'popup-error' : 'popup-success'}`}>
          {popupMessage}
        </div>
      )}
    </form>
  );
}
