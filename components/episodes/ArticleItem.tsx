import React, { useState } from 'react';
import { Article, Language } from '@/types';
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

  // 現在の言語の要約テキストと音声URLを取得
  const summary = language === 'ja' ? article.japanese_summary : article.english_summary;
  const audioUrl = language === 'ja' ? article.japanese_audio_url : article.english_audio_url;

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
        <LanguageToggle language={language} onChange={setLanguage} />
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
        {audioUrl ? (
          <audio
            controls
            className="w-full"
            src={audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
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
