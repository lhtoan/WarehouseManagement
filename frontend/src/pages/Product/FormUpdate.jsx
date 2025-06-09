// import { useState } from 'react';
// import './FormUpdate.css';


// export default function FormUpdate({ onClose, onUpdate, product }) {
//   const [giaBan, setGiaBan] = useState(product.giaBan);
//   const [soLuong, setSoLuong] = useState(product.soLuong);
//   const [hinhAnhFile, setHinhAnhFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append('gia_ban', giaBan);
//       formData.append('so_luong', soLuong);
//       if (hinhAnhFile) {
//         formData.append('hinh_anh', hinhAnhFile);
//       }
//       // Gọi API update biến thể (giả sử product có id biến thể là product.variantId)
//       const updatedData = await updateVariant(product.variantId, formData);

//       // Gọi callback onUpdate truyền dữ liệu mới về parent để cập nhật UI
//       onUpdate({
//         ...product,
//         giaBan,
//         soLuong,
//         hinhAnh: hinhAnhFile ? hinhAnhFile.name : product.hinhAnh,
//         ...updatedData, // nếu backend trả về dữ liệu mới cập nhật
//       });
//       onClose();
//     } catch (err) {
//       setError(err.message || 'Lỗi khi cập nhật sản phẩm');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setHinhAnhFile(file);
//     }
//   };

//   const imagePreviewUrl = hinhAnhFile
//     ? URL.createObjectURL(hinhAnhFile)
//     : `http://localhost:3000/images/${product.hinhAnh}`;

//   return (
//     <div className="formupdate-overlay">
//       <div className="formupdate-popup">
//         <h2 className="formupdate-title">Cập nhật sản phẩm</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="formupdate-columns">
//             <div className="formupdate-column">
//               <div className="formupdate-group">
//                 <label>Mã sản phẩm</label>
//                 <input type="text" value={product.maSanPham} readOnly />
//               </div>
//               <div className="formupdate-group">
//                 <label>Lô hàng</label>
//                 <input type="text" value={product.loHang} readOnly />
//               </div>
//               <div className="formupdate-group">
//                 <label>Tên sản phẩm</label>
//                 <input type="text" value={product.tenSanPham} readOnly />
//               </div>
//               <div className="formupdate-group">
//                 <label>Size</label>
//                 <input type="text" value={product.size} readOnly />
//               </div>
//               <div className="formupdate-group">
//                 <label>Màu sắc</label>
//                 <input type="text" value={product.mauSac} readOnly />
//               </div>
//             </div>

//             <div className="formupdate-column">
//               <div className="formupdate-group">
//                 <label>Giá bán</label>
//                 <input
//                   type="number"
//                   value={giaBan}
//                   min="0"
//                   onChange={(e) => setGiaBan(Number(e.target.value))}
//                   required
//                 />
//               </div>
//               <div className="formupdate-group">
//                 <label>Số lượng</label>
//                 <input
//                   type="number"
//                   value={soLuong}
//                   min="0"
//                   onChange={(e) => setSoLuong(Number(e.target.value))}
//                   required
//                 />
//               </div>
//               <div className="formupdate-group">
//                 <label>Hình ảnh</label>
//                 <input type="file" accept="image/*" onChange={handleImageChange} />
//                 {imagePreviewUrl && (
//                   <div className="formupdate-image-preview">
//                     <img src={imagePreviewUrl} alt="Preview" height="120" />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {error && <p className="formupdate-error">{error}</p>}

//           <div className="formupdate-actions">
//             <button
//               type="button"
//               className="formupdate-btn formupdate-btn-cancel"
//               onClick={onClose}
//               disabled={loading}
//             >
//               Hủy
//             </button>
//             <button
//               type="submit"
//               className="formupdate-btn formupdate-btn-save"
//               disabled={loading}
//             >
//               {loading ? 'Đang cập nhật...' : 'Cập nhật'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
