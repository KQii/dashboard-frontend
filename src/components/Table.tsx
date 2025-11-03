import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { TableColumn, TableSort } from '../types';

interface TableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  title?: string;
  pageSize?: number;
  density?: 'compact' | 'normal' | 'spacious';
}

export function Table<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  rowActions,
  title,
  pageSize = 10,
  density = 'normal'
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<TableSort | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const paddingClass = {
    compact: 'px-3 py-2',
    normal: 'px-4 py-3',
    spacious: 'px-6 py-4'
  }[density];

  const heightClass = {
    compact: 'h-8',
    normal: 'h-10',
    spacious: 'h-12'
  }[density];

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return Object.entries(filterValues).every(([key, value]) => {
        if (!value) return true;
        const rowValue = (row as any)[key];
        return String(rowValue).toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [data, filterValues]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortConfig.column];
      const bValue = (b as any)[sortConfig.column];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: string) => {
    setSortConfig(current => {
      if (current?.column === column) {
        return current.direction === 'asc'
          ? { column, direction: 'desc' }
          : null;
      }
      return { column, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig?.column !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 text-cyan-600" />
      : <ChevronDown className="w-4 h-4 text-cyan-600" />;
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white shadow-sm">
        {title && <div className="px-6 py-4 border-b font-semibold text-gray-900">{title}</div>}
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg bg-white shadow-sm">
        {title && <div className="px-6 py-4 border-b font-semibold text-gray-900">{title}</div>}
        <div className="p-12 text-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      {title && <div className="px-6 py-4 border-b font-semibold text-gray-900">{title}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className={`${paddingClass} text-left font-semibold text-gray-700 bg-gray-50`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center gap-2 hover:text-cyan-600 transition-colors w-full"
                    >
                      {column.label}
                      {renderSortIcon(String(column.key))}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {rowActions && <th className={`${paddingClass} text-right font-semibold text-gray-700`}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row.id}
                className={`border-t hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className={`${paddingClass} text-gray-700`}
                    style={{ width: column.width }}
                  >
                    {column.render
                      ? column.render((row as any)[column.key], row)
                      : String((row as any)[column.key])}
                  </td>
                ))}
                {rowActions && (
                  <td className={`${paddingClass} text-right`}>
                    <div onClick={e => e.stopPropagation()}>
                      {rowActions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({sortedData.length} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
