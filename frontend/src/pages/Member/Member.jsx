import { useEffect, useState } from 'react';
import { fetchUsers, register } from '../../services/authService';
import './Member.css';

export default function Member() {
  const [users, setUsers] = useState([]);
  const [ten, setTen] = useState('');
  const [email, setEmail] = useState('');
  const [setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwords, setPasswords] = useState({});
  const [showPasswords, setShowPasswords] = useState({});

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      setUsers(res.data);
    } catch {
      setError('Lỗi khi tải danh sách người dùng');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await register(ten, email);
      setMessage(`✅ Đã tạo tài khoản cho ${res.ten}, mật khẩu: ${res.mat_khau_goc}`);
      setPasswords((prev) => ({
        ...prev,
        [res.email]: res.mat_khau_goc
      }));
      setShowPasswords((prev) => ({
        ...prev,
        [res.email]: false
      }));
      setTen('');
      setEmail('');
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePasswordVisibility = (email) => {
    setShowPasswords((prev) => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="member-container">
      <h2>Danh sách tài khoản</h2>

      <table className="member-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Mật khẩu</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const password = passwords[user.email];
            const isVisible = showPasswords[user.email];

            return (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.ten}</td>
                <td>{user.email}</td>
                <td>{user.vai_tro}</td>
                <td>
                <div className="password-input">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={password || '●●●●●'}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(user.email)}
                    disabled={!password}
                    title={!password ? 'Chưa có mật khẩu gốc' : ''}
                  >
                    {isVisible ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>

                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Thêm tài khoản mới</h3>
      <form className="member-form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Tên người dùng"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Tạo tài khoản</button>
      </form>

      {error && <p className="message-error">{error}</p>}
    </div>
  );
}
