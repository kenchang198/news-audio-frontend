import React, { useState } from 'react';
import { Article, Language } from '@/types';
import AudioPlayer from '@/components/ui/AudioPlayer';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface ArticleItemProps {
  article: Article;
  defaultLanguage?: Language;
}

const ArticleItem: React.FC<ArticleItemProps> = ({
  article,
  defaultLanguage = 'ja',
}) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  // 現在の言語の要約テキストを取得
  const currentSummary = article.summary?.[language];

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900">
          {article.title}
        </h3>
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {article.source}
        </a>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-md font-medium">
          {language === 'ja' ? '要約' : 'Summary'}
        </h4>
        <LanguageToggle language={language} onChange={setLanguage} />
      </div>
      
      {currentSummary ? (
        <div className="text-gray-700 mb-4 text-sm">
          <p>{currentSummary}</p>
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
        <AudioPlayer
          articleId={article.id}
          audioUrls={article.audio || {}}
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>
    </div>
  );
};

export default ArticleItem;
