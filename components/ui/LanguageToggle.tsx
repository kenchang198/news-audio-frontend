import React from 'react';
import { Language } from '@/types';

interface LanguageToggleProps {
  language: Language;
  onChange: (language: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onChange }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <button
        type="button"
        className={`px-3 py-1 text-sm font-medium rounded-l-md ${
          language === 'ja'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => onChange('ja')}
      >
        日本語
      </button>
      <button
        type="button"
        className={`px-3 py-1 text-sm font-medium rounded-r-md ${
          language === 'en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => onChange('en')}
      >
        English
      </button>
    </div>
  );
};

export default LanguageToggle;
