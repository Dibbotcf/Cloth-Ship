'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'clothshipadmin') {
      localStorage.setItem('clothship_admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h2>Cloth Ship CMS</h2>
          <p>Admin Login</p>
        </div>
        <form onSubmit={handleLogin} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label>Provider ID</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Username" 
              required 
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
            />
          </div>
          <button type="submit" className={styles.loginBtn}>Login</button>
        </form>
      </div>
    </div>
  );
}
