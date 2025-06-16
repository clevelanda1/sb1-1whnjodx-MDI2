import { useState, useEffect, useMemo } from 'react';
import { PaginationState } from '../types/curation';

const PRODUCTS_PER_PAGE = 24;

export const usePagination = (totalProducts: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when total products change
  useEffect(() => {
    setCurrentPage(1);
  }, [totalProducts]);

  const paginationState: PaginationState = useMemo(() => {
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    return {
      currentPage,
      totalPages,
      totalProducts,
      productsPerPage: PRODUCTS_PER_PAGE
    };
  }, [currentPage, totalProducts]);

  const getCurrentPageProducts = <T>(products: T[]): T[] => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (paginationState.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= paginationState.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(paginationState.totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < paginationState.totalPages) {
        if (endPage < paginationState.totalPages - 1) pages.push('...');
        pages.push(paginationState.totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of products section
    const productsSection = document.querySelector('[data-products-section]');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const canGoNext = currentPage < paginationState.totalPages;
  const canGoPrevious = currentPage > 1;

  return {
    paginationState,
    getCurrentPageProducts,
    getPageNumbers,
    handlePageChange,
    canGoNext,
    canGoPrevious
  };
};