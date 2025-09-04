import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CsvRow } from '../types';
import { parseCsvFile, validateCsvData } from '../utils/csvParser';

interface CsvUploadSectionProps {
  onDataUpdate: (data: CsvRow[]) => void;
  csvData: CsvRow[];
}

const CsvUploadSection: React.FC<CsvUploadSectionProps> = ({ onDataUpdate, csvData }) => {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError(t('errors.invalidFile'));
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await parseCsvFile(file);
      
      if (!result.success) {
        setError(result.error || t('errors.parseError'));
        return;
      }

      const validation = validateCsvData(result.data);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return;
      }

      onDataUpdate(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.parseError'));
    } finally {
      setUploading(false);
    }
  };

  const clearData = () => {
    onDataUpdate([]);
    setError('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{t('dashboard.csvUpload')}</h3>
      </div>
      
      <div className="card-body">
        {csvData.length === 0 ? (
          <div
            className={`file-upload ${dragActive ? 'dragover' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              disabled={uploading}
            />
            
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                <div className="spinner"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                <div style={{ fontSize: 'var(--font-size-4xl)', color: 'var(--gray-400)' }}>
                  📁
                </div>
                <h4 style={{ margin: 0, color: 'var(--gray-700)' }}>
                  {t('dashboard.uploadCsvFile')}
                </h4>
                <p style={{ margin: 0, color: 'var(--gray-500)' }}>
                  {t('dashboard.dragAndDrop')}
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                    fileInput?.click();
                  }}
                >
                  {t('dashboard.selectFile')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'var(--spacing-4)'
            }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--gray-700)' }}>
                  {t('dashboard.fileSelected', { fileName: `CSV (${csvData.length} rows)` })}
                </h4>
                <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>
                  {t('dashboard.previewData')}
                </p>
              </div>
              <button
                onClick={clearData}
                className="btn btn-secondary"
              >
                {t('common.delete')}
              </button>
            </div>

            {/* Data Preview */}
            <div style={{ 
              maxHeight: '300px', 
              overflow: 'auto', 
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)'
            }}>
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(csvData[0]?.data || {}).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row) => (
                    <tr key={row.id}>
                      {Object.values(row.data).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                  {csvData.length > 5 && (
                    <tr>
                      <td colSpan={Object.keys(csvData[0]?.data || {}).length} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                        ... and {csvData.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginTop: 'var(--spacing-4)' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvUploadSection;
