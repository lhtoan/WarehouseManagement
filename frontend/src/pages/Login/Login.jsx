// import { useState } from 'react';
// import './Login.css';
// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert(`Email: ${email}\nPassword: ${password}`);
//   };

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h2>ĐĂNG NHẬP</h2>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="login-input"
//           required
//         />
//         <input
//           type="password"
//           placeholder="Mật khẩu"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="login-input"
//           required
//         />
//         <button type="submit" className="login-button">Đăng nhập</button>
//       </form>
//     </div>
//   );
// }



import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService.js';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorField, setErrorField] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorField('');

    try {
      const data = await login(email, password);
      sessionStorage.setItem('token', data.token);
      navigate('/home');
    } catch (error) {
      setErrorMsg(error.message);
      setErrorField(error.errorField);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>ĐĂNG NHẬP</h2>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`login-input ${errorField === 'email' ? 'input-error' : ''}`}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`login-input ${errorField === 'password' ? 'input-error' : ''}`}
          required
        />
        <button type="submit" className="login-button">Đăng nhập</button>
      </form>
    </div>
  );
}
