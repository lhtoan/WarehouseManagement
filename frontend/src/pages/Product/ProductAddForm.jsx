import React, { useState, useEffect } from 'react';
import './ProductAddForm.css';
import {
  fetchColors,
  fetchSizes,
  createProduct,
  addVariant,
  fetchProductsWithVariants
} from '../../services/productService';
import { fetchBatches, addBatch } from '../../services/batchesService';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

export default function ProductForm() {
  const navigate = useNavigate();

  const [productInfo, setProductInfo] = useState({
    ma_san_pham: '',
    ten_san_pham: '',
  });

  const [variants, setVariants] = useState([
    { mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: null, preview: '', ma_lo: '', ngay_nhap: '' },
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
  const [allProducts, setAllProducts] = useState([]);
  const [isExistingProduct, setIsExistingProduct] = useState(false);

  const productOptions = allProducts.map((p) => ({
    value: p.ma_san_pham,
    label: `${p.ma_san_pham} - ${p.ten_san_pham}`
  }));

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [colorsData, sizesData, batchesData, productsData] = await Promise.all([
          fetchColors(),
          fetchSizes(),
          fetchBatches(),
          fetchProductsWithVariants(),
        ]);
        setColors(colorsData);
        setSizes(sizesData);
        setBatches(batchesData);
        setAllProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateVariants = async () => {
    try {
      const formData = new FormData();
  
      // Tạo danh sách biến thể gửi về (không chứa ảnh)
      const variantsToSend = variants.map((v) => ({
        id: v.id,
        lo_hang_id: v.batchId,
        ma_lo: v.ma_lo,
        ngay_nhap: v.ngay_nhap,
        gia_ban: v.giaBan,
        so_luong: v.soLuong
      }));
      
      console.log('variants gửi lên:', variantsToSend); // 👈 thêm dòng này

      formData.append('variants', JSON.stringify(variantsToSend));
  
      // Append ảnh nếu có
      variants.forEach((v) => {
        if (v.hinhAnh) {
          formData.append(v.id, v.hinhAnh); // fieldname là variantId
        }
      });
  
      const res = await fetch('http://localhost:3000/variants/update-multiple', {
        method: 'PUT',
        body: formData,
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi khi cập nhật biến thể');
  
      setPopupMessage('Cập nhật biến thể thành công!');
      setPopupType('success');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/products');
      }, 800);
    } catch (err) {
      setPopupMessage(err.message);
      setPopupType('error');
      setShowPopup(true);
    }
  };
  
  const handleProductCodeChange = (value) => {
    setProductInfo((prev) => ({ ...prev, ma_san_pham: value }));
    const found = allProducts.find((p) => p.ma_san_pham === value);
    if (found) {
      setProductInfo({ ma_san_pham: found.ma_san_pham, ten_san_pham: found.ten_san_pham });
      setShowVariantForm(true);
      setIsExistingProduct(true);

      const formattedVariants = found.variants.map((v) => ({
        id: v.bien_the_id,
        mauSac: v.color,
        size: v.size,
        giaBan: v.gia_ban,
        soLuong: v.so_luong,
        batchId: v.lo_hang_id,
        hinhAnh: null,
        preview: `http://localhost:3000/images/${v.hinh_anh}`,
        ma_lo: v.ma_lo,
        ngay_nhap: v.ngay_nhap.split('T')[0]
      }));
      setVariants(formattedVariants);
    } else {
      setProductInfo((prev) => ({ ...prev, ma_san_pham: value }));
      setIsExistingProduct(false);
    }
  };

  const handleAddBatch = async (index) => {
    const variant = variants[index];
    if (!variant.ma_lo || !variant.ngay_nhap) {
      alert('Vui lòng nhập đầy đủ mã lô và ngày nhập cho biến thể');
      return;
    }
    try {
      const result = await addBatch({ ma_lo: variant.ma_lo, ngay_nhap: variant.ngay_nhap });
      setBatches([...batches, result]);
      const updatedVariants = [...variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        batchId: result.id,
        ma_lo: result.ma_lo,
        ngay_nhap: result.ngay_nhap
      };
      setVariants((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          batchId: result.id,
        };
        return updated;
      });
      
      setPopupMessage(`Thêm lô hàng cho biến thể ${index + 1} thành công!`);
      setPopupType('success');
      setShowPopup(true);
    } catch (err) {
      setPopupMessage(err.message || `Lỗi khi thêm lô hàng cho biến thể ${index + 1}`);
      setPopupType('error');
      setShowPopup(true);
    }
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
        if (variant.hinhAnh) formData.append('hinh_anh', variant.hinhAnh);
        await addVariant(sanPhamId, formData);
      }
      setProductInfo({ ma_san_pham: '', ten_san_pham: '' });
      setVariants([{ mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: null, preview: '', ma_lo: '', ngay_nhap: '' }]);
      setShowVariantForm(false);
      setPopupMessage('Thêm sản phẩm thành công!');
      setPopupType('success');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/products');
      }, 500);
    } catch (err) {
      setPopupMessage(err.message || 'Lỗi khi tạo sản phẩm hoặc biến thể');
      setPopupType('error');
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
          <CreatableSelect
            styles={{
              menu: (provided) => ({
                ...provided,
                zIndex: 9999,
                fontFamily: 'Roboto',
                fontSize: '14px',
              }),
            }}
            options={productOptions}
            onChange={(selectedOption) => {
              if (selectedOption) {
                handleProductCodeChange(selectedOption.value);
              } else {
                setProductInfo({ ma_san_pham: '', ten_san_pham: '' });
                setShowVariantForm(false);
                setVariants([{
                  mauSac: '', size: '', giaBan: '', soLuong: '',
                  batchId: '', hinhAnh: null, preview: '',
                  ma_lo: '', ngay_nhap: ''
                }]);
              }
            }}
            onCreateOption={(inputValue) => {
              // Set mã sản phẩm mới và xử lý như khi chọn
              setProductInfo({ ma_san_pham: inputValue, ten_san_pham: '' });
              setIsExistingProduct(false);
              setShowVariantForm(true);
              setVariants([{
                mauSac: '', size: '', giaBan: '', soLuong: '',
                batchId: '', hinhAnh: null, preview: '',
                ma_lo: '', ngay_nhap: ''
              }]);
            }}            
            value={productOptions.find(option => option.value === productInfo.ma_san_pham) || {
              value: productInfo.ma_san_pham,
              label: productInfo.ma_san_pham
            }}
            placeholder="Mã sản phẩm"
            isClearable
          />
        </label>


        <label>
          Tên sản phẩm:
          <input
            type="text"
            value={productInfo.ten_san_pham}
            onChange={(e) => setProductInfo({ ...productInfo, ten_san_pham: e.target.value })}
            required
          />
        </label>

        {!showVariantForm && (
          <button type="button" onClick={() => setShowVariantForm(true)} className="btn btn-primary">
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

              <label>Màu sắc:
                <select value={v.mauSac} onChange={(e) => handleVariantChange(index, 'mauSac', e.target.value)} required>
                  <option value="">-- Chọn màu sắc --</option>
                  {colors.map((color) => (
                    <option key={color.gia_tri_id} value={color.gia_tri}>{color.gia_tri}</option>
                  ))}
                </select>
              </label>

              <label>Size:
                <select value={v.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} required>
                  <option value="">-- Chọn size --</option>
                  {sizes.map((size) => (
                    <option key={size.gia_tri_id} value={size.gia_tri}>{size.gia_tri}</option>
                  ))}
                </select>
              </label>

              <label>Giá bán:
                <input type="number" value={v.giaBan} onChange={(e) => handleVariantChange(index, 'giaBan', e.target.value)} required />
              </label>

              <label>Số lượng:
                <input type="number" value={v.soLuong} onChange={(e) => handleVariantChange(index, 'soLuong', e.target.value)} required />
              </label>

              <label>Mã lô:
                <input type="text" value={v.ma_lo} onChange={(e) => handleVariantChange(index, 'ma_lo', e.target.value)} />
              </label>

              <label>Ngày nhập:
                <input type="date" value={v.ngay_nhap} onChange={(e) => handleVariantChange(index, 'ngay_nhap', e.target.value)} />
              </label>

              <div className="button">
                <button type="button" className="btn btn-info" onClick={() => handleAddBatch(index)}>
                  + Thêm lô hàng
                </button>
              </div>

              <label>Hình ảnh:
                <input type="file" accept="image/*" onChange={(e) => handleVariantChange(index, 'hinhAnh', '', e.target.files[0])} />
              </label>

              {v.preview && <img src={v.preview} alt={`Preview ${index}`} style={{ width: '100px', marginTop: '10px' }} />}
            </div>
          ))}

          <div className="btn-action">
            <button type="button" onClick={() => setVariants([...variants, { mauSac: '', size: '', giaBan: '', soLuong: '', batchId: '', hinhAnh: null, preview: '', ma_lo: '', ngay_nhap: '' }])} className="btn btn-secondary">
              + Thêm biến thể
            </button>
            <button
              type="button"
              onClick={isExistingProduct ? handleUpdateVariants : handleSubmitAll}
              className="btn btn-success"
            >
              {isExistingProduct ? 'Cập nhật biến thể' : 'Thêm sản phẩm và biến thể'}
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
