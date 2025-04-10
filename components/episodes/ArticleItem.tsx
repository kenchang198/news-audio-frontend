import React, { useState } from 'react';
import { Article, Language } from '@/types';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useAudio } from '@/contexts/AudioContext';

interface ArticleItemProps {
  article: Article;
  defaultLanguage?: Language;
}

const ArticleItem: React.FC<ArticleItemProps> = ({
  article,
  defaultLanguage = 'ja',
}) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const { play } = useAudio();

  // 現在の言語の要約テキストと音声URLを取得
  const summary = language === 'ja' ? article.japanese_summary : article.english_summary;
  const audioUrls = {
    ja: article.japanese_audio_url,
    en: article.english_audio_url
  };

  // 再生ボタンのクリックハンドラ
  const handlePlay = () => {
    play(
      article.id,
      article.title,
      audioUrls,
      language
    );
  };

  // 言語切り替えハンドラ
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900">
          {article.title}
        </h3>
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {article.source} - {article.author}
        </a>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-md font-medium">
          {language === 'ja' ? '要約' : 'Summary'}
        </h4>
        <LanguageToggle language={language} onChange={handleLanguageChange} />
      </div>
      
      {summary ? (
        <div className="text-gray-700 mb-4 text-sm">
          <p>{summary}</p>
        </div>
      ) : (
        <div className="text-gray-500 mb-4 text-sm">
          {language === 'ja'
            ? '要約は利用できません'
            : 'Summary not available'}
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="text-md font-medium mb-2">
          {language === 'ja' ? '音声' : 'Audio'}
        </h4>
        
        {/* 音声再生ボタン */}
        {(audioUrls.ja || audioUrls.en) ? (
          <button 
            onClick={handlePlay}
            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7-11-7z" />
            </svg>
            {language === 'ja' ? 'フッターで再生' : 'Play in footer'}
          </button>
        ) : (
          <div className="text-gray-500 text-sm">
            {language === 'ja'
              ? '音声は利用できません'
              : 'Audio not available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleItem;
