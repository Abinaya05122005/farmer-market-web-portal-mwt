import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 12,
  onItemsPerPageChange,
  pageSizeOptions = [6, 9, 12, 24],
}) {
  const { t, language } = useLanguage();

  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper to generate smart pagination numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
      {/* 1. Showing range info */}
      <div className="text-xs text-stone-600 dark:text-stone-400 font-medium text-center sm:text-left">
        <span>{t('pagination.showing')}: </span>
        <strong className="text-stone-900 dark:text-white font-bold">
          {startItem}–{endItem}
        </strong>{' '}
        <span>{t('pagination.of')} </span>
        <strong className="text-stone-900 dark:text-white font-bold">{totalItems}</strong>{' '}
        <span className="text-stone-400 dark:text-stone-500">
          ({t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages})
        </span>
      </div>

      {/* 2. Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* First Page Button */}
        {totalPages > 4 && (
          <button
            type="button"
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl border border-stone-200 dark:border-stone-700 transition ${
              currentPage === 1
                ? 'opacity-35 cursor-not-allowed bg-stone-50 dark:bg-stone-800/50 text-stone-400'
                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95 cursor-pointer'
            }`}
            title="First Page"
            aria-label="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 transition ${
            currentPage === 1
              ? 'opacity-35 cursor-not-allowed bg-stone-50 dark:bg-stone-800/50 text-stone-400'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95 cursor-pointer'
          }`}
          title={t('pagination.previous')}
          aria-label={t('pagination.previous')}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('pagination.previous')}</span>
        </button>

        {/* Page Number Buttons */}
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs font-bold text-stone-400 select-none"
              >
                •••
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => handlePageClick(page)}
              className={`min-w-8.5 h-8.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'bg-farm-700 text-white shadow-xs scale-105'
                  : 'border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 transition ${
            currentPage === totalPages
              ? 'opacity-35 cursor-not-allowed bg-stone-50 dark:bg-stone-800/50 text-stone-400'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95 cursor-pointer'
          }`}
          title={t('pagination.next')}
          aria-label={t('pagination.next')}
        >
          <span className="hidden sm:inline">{t('pagination.next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        {totalPages > 4 && (
          <button
            type="button"
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl border border-stone-200 dark:border-stone-700 transition ${
              currentPage === totalPages
                ? 'opacity-35 cursor-not-allowed bg-stone-50 dark:bg-stone-800/50 text-stone-400'
                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95 cursor-pointer'
            }`}
            title="Last Page"
            aria-label="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Items Per Page Selector (if callback provided) */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400">
          <label htmlFor="items-per-page-select" className="shrink-0">
            {language === 'ta' ? 'பக்கத்திற்கு:' : 'Per page:'}
          </label>
          <select
            id="items-per-page-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-600 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
