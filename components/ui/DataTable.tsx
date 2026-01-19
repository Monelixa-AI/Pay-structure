'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  searchable = true,
  searchPlaceholder = 'Ara...',
  pageSize = 10,
  emptyMessage = 'Veri bulunamadi.',
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) =>
            val &&
            typeof val === 'string' &&
            val.toLowerCase().includes(searchLower)
        )
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [data, search, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-dark-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-dark-800 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn('px-6 py-4 font-medium', col.className)}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {col.label}
                      {getSortIcon(String(col.key))}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {actions && <th className="px-6 py-4 font-medium">Islemler</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <motion.tr
                  key={String(item[keyField])}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'bg-dark-900 hover:bg-dark-800 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn('px-6 py-4', col.className)}
                    >
                      {col.render
                        ? col.render(item)
                        : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4">
                      <div onClick={(e) => e.stopPropagation()}>
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            Toplam {filteredData.length} kayittan {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredData.length)} arasi gosteriliyor
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-400 hover:text-white hover:border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-400 hover:text-white hover:border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
