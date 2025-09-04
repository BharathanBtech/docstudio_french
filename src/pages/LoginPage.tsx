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
        navigate('/campaigns');
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
      backgroundColor: 'var(--white)',
      padding: 'var(--spacing-4)'
    }}>
      <div style={{
        position: 'absolute',
        top: 'var(--spacing-6)',
        right: 'var(--spacing-6)'
      }}>
        <LanguageSelector />
      </div>

      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Logo and App Name */}
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <img 
            src="/images/docstudio-logo.png" 
            alt="DocStudio Logo" 
            style={{
              height: '80px',
              width: 'auto',
              marginBottom: 'var(--spacing-4)'
            }}
          />
          <h1 style={{ 
            color: 'var(--gray-900)', 
            fontSize: 'var(--font-size-3xl)',
            fontWeight: '700',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Perfect Doc Studio
          </h1>
        </div>

        {/* Welcome Message */}
        <p style={{ 
          color: 'var(--gray-600)', 
          fontSize: 'var(--font-size-lg)',
          margin: '0 0 var(--spacing-8) 0',
          fontWeight: '500'
        }}>
          {t('auth.welcomeBack')}
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Username Field */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              color: 'var(--gray-700)',
              marginBottom: 'var(--spacing-2)'
            }}>
              {t('auth.username')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your username"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'var(--spacing-4)',
                fontSize: 'var(--font-size-base)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--gray-50)',
                color: 'var(--gray-900)',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.backgroundColor = 'var(--white)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--gray-300)';
                e.target.style.backgroundColor = 'var(--gray-50)';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              color: 'var(--gray-700)',
              marginBottom: 'var(--spacing-2)'
            }}>
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'var(--spacing-4)',
                fontSize: 'var(--font-size-base)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--gray-50)',
                color: 'var(--gray-900)',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.backgroundColor = 'var(--white)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--gray-300)';
                e.target.style.backgroundColor = 'var(--gray-50)';
              }}
            />
          </div>

          {/* Forgot Password Link */}
          <div style={{ 
            textAlign: 'right', 
            marginBottom: 'var(--spacing-8)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <a href="#" style={{
              color: 'var(--gray-600)',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}>
              {t('auth.forgotPassword')}
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-golden btn-lg"
            style={{
              width: '100%',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: 'var(--font-size-lg)'
            }}
          >
            {loading ? t('auth.loggingIn') : t('auth.logMeIn')}
            {!loading && (
              <span style={{ fontSize: 'var(--font-size-lg)' }}>→</span>
            )}
          </button>

          {error && (
            <div style={{
              marginTop: 'var(--spacing-4)',
              padding: 'var(--spacing-3)',
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Demo Credentials */}
          <div style={{ 
            marginTop: 'var(--spacing-6)', 
            textAlign: 'center',
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--gray-600)'
          }}>
            <strong>{t('auth.demoCredentials')}</strong><br />
            {t('auth.demoEmail')}<br />
            {t('auth.demoPassword')}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
