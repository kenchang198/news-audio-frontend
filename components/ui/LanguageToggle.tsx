import React from 'react';
import { Language } from '@/types';

interface LanguageToggleProps {
  language: Language;
  onChange: (language: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-md border border-gray-300 overflow-hidden">
      <button
        type="button"
        className={`px-3 py-1 text-sm ${
          language === 'ja'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onChange('ja')}
      >
        日本語
      </button>
      <button
        type="button"
        className={`px-3 py-1 text-sm ${
          language === 'en'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onChange('en')}
      >
        English
      </button>
    </div>
  );
};

export default LanguageToggle;
