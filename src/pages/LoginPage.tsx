import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
      padding: 'var(--spacing-4)'
    }}>
      <div style={{
        position: 'absolute',
        top: 'var(--spacing-6)',
        right: 'var(--spacing-6)'
      }}>
        <LanguageSelector />
      </div>

      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div className="card-header" style={{ textAlign: 'center', borderBottom: 'none' }}>
          <h1 style={{ 
            color: 'var(--primary-color)', 
            fontSize: 'var(--font-size-3xl)',
            marginBottom: 'var(--spacing-2)'
          }}>
            DocStudio
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            {t('auth.welcome')}
          </p>
          <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
            {t('auth.loginSubtitle')}
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {t('common.loading')}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          <div style={{ 
            marginTop: 'var(--spacing-6)', 
            textAlign: 'center',
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--gray-600)'
          }}>
            <strong>Demo Credentials:</strong><br />
            Email: admin@docstudio.com<br />
            Password: password
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
