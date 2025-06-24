import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // ページが1ページしかない場合は表示しない
  if (totalPages <= 1) {
    return null;
  }

  // 表示するページ番号の配列を生成
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // 表示するページ番号の最大数
    
    // 前後に表示するページ数
    const sidePages = Math.floor((maxPagesToShow - 1) / 2);
    
    let startPage = Math.max(1, currentPage - sidePages);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // 最大ページ数を超えないように調整
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <nav className="flex justify-center mt-8">
      <ul className="inline-flex items-center -space-x-px">
        {/* 前のページボタン */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`block px-3 py-2 ml-0 leading-tight rounded-l-lg border ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <span className="sr-only">前のページ</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
          </button>
        </li>
        
        {/* ページ番号 */}
        {getPageNumbers().map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 leading-tight border ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {page}
            </button>
          </li>
        ))}
        
        {/* 次のページボタン */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`block px-3 py-2 leading-tight rounded-r-lg border ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <span className="sr-only">次のページ</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
