import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();

  const toggleLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('schoolfest_lang', lng);
  };

  return (
    <div className={`inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <Globe className="w-4 h-4 text-slate-500 ml-1 mr-1" />
      <button
        type="button"
        onClick={() => toggleLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          i18n.language === 'en'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage('ml')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          i18n.language === 'ml'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        മലയാളം
      </button>
    </div>
  );
}
