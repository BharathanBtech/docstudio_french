import Papa from 'papaparse';
import { CsvRow } from '../types';

export interface ParseResult {
  success: boolean;
  data: CsvRow[];
  headers: string[];
  error?: string;
}

const normalizeCsvText = (text: string): string => {
  return text.replace(/\ufeff/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

export const parseCsvFile = (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const rawText = (reader.result as string) || '';
        const text = normalizeCsvText(rawText);

        Papa.parse(text, {
          header: true,
          delimiter: ',',
          quoteChar: '"',
          escapeChar: '"',
          skipEmptyLines: 'greedy',
          dynamicTyping: false,
          worker: false,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              const message = results.errors
                .map(e => `${e.message}${e.row !== undefined ? ` (row ${e.row + 1})` : ''}`)
                .join(', ');
              resolve({ success: false, data: [], headers: [], error: `CSV parsing errors: ${message}` });
              return;
            }

            const headers = results.meta.fields || [];
            const data: CsvRow[] = (results.data as any[]).map((row: any, index: number) => ({
              id: `row-${index}`,
              data: row,
              emailStatus: 'pending' as const,
              smsStatus: undefined,
              emailSentAt: undefined,
              smsSentAt: undefined,
              error: undefined
            }));

            resolve({ success: true, data, headers });
          },
          error: (error: any) => {
            resolve({ success: false, data: [], headers: [], error: error.message });
          }
        });
      } catch (e: any) {
        resolve({ success: false, data: [], headers: [], error: e?.message || 'Unknown error' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, data: [], headers: [], error: reader.error?.message || 'File read error' });
    };

    reader.readAsText(file);
  });
};

export const validateCsvData = (data: CsvRow[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }

  // No hard required columns; allow arbitrary schemas
  return { valid: true, errors };
};

const emailRegex = /^(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})$/i;

export const detectColumnMappings = (
  data: CsvRow[]
): { emailKey?: string; phoneKey?: string } => {
  if (!data || data.length === 0) return {};
  const keys = Object.keys(data[0].data || {});

  // Prefer header names
  const emailKeyFromHeader = keys.find(k => /^(email|e-mail|mail)$/i.test(k));
  const phoneKeyFromHeader = keys.find(k => /^(phone|mobile|msisdn|contact|tel|telephone)$/i.test(k));

  let emailKey = emailKeyFromHeader;
  let phoneKey = phoneKeyFromHeader;

  // Fallback: infer from values in first 20 rows
  const sample = data.slice(0, 20);
  if (!emailKey) {
    for (const key of keys) {
      if (sample.some(r => typeof r.data[key] === 'string' && emailRegex.test(String(r.data[key]).trim()))) {
        emailKey = key; break;
      }
    }
  }
  if (!phoneKey) {
    for (const key of keys) {
      if (sample.some(r => {
        const v = String(r.data[key] ?? '').replace(/[^0-9+]/g, '');
        return v.length >= 7; // heuristic
      })) { phoneKey = key; break; }
    }
  }

  return { emailKey, phoneKey };
};
