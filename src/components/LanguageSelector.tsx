import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage);
  };

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--spacing-2)',
      backgroundColor: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-2)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <button
        onClick={() => handleLanguageChange('en')}
        style={{
          padding: 'var(--spacing-2) var(--spacing-3)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: language === 'en' ? 'var(--primary-color)' : 'transparent',
          color: language === 'en' ? 'var(--white)' : 'var(--gray-600)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontWeight: language === 'en' ? '600' : '400',
          transition: 'all var(--transition-fast)'
        }}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('fr')}
        style={{
          padding: 'var(--spacing-2) var(--spacing-3)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: language === 'fr' ? 'var(--primary-color)' : 'transparent',
          color: language === 'fr' ? 'var(--white)' : 'var(--gray-600)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontWeight: language === 'fr' ? '600' : '400',
          transition: 'all var(--transition-fast)'
        }}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSelector;
