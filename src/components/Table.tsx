import { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";
import { TableColumn, TableSort } from "../types";
import { Badge } from "./Badge";

export interface FilterConfig {
  type: "text" | "radio" | "checkbox";
  label: string;
  field: string;
  options?: string[]; // For radio/checkbox type: array of values
  placeholder?: string; // For text type
}

interface TableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  title?: string;
  pageSize?: number;
  density?: "compact" | "normal" | "spacious";
  showBadgeCount?: boolean;
  emptyDataProps?: Record<string, string>;
  filterConfig?: FilterConfig[];
  // Server-side filtering/sorting/pagination
  useServerSide?: boolean;
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
  onSortChange?: (sort: TableSort[]) => void;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  currentPage?: number; // Current page from server
  totalCount?: number; // Total records from server
  totalPages?: number; // Total pages from server
  hasNextPage?: boolean; // Whether there's a next page
  hasPrevPage?: boolean; // Whether there's a previous page
}

export function Table<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  rowActions,
  title,
  pageSize = 10,
  density = "normal",
  showBadgeCount = false,
  emptyDataProps = {
    message: "No data available",
    padding: "p-12",
  },
  filterConfig = [],
  useServerSide = false,
  onFilterChange,
  onSortChange,
  onPageChange,
  onRefresh,
  currentPage: serverCurrentPage,
  totalCount,
  totalPages: serverTotalPages,
  hasNextPage,
  hasPrevPage,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<TableSort[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<
    Record<string, string | string[]>
  >({});
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  // Initialize tempFilters dynamically based on filterConfig
  const initialFilters = useMemo(() => {
    const filters: Record<string, string | string[]> = {};
    filterConfig.forEach((config) => {
      filters[config.field] = config.type === "checkbox" ? [] : "";
    });
    return filters;
  }, [filterConfig]);

  const [tempFilters, setTempFilters] =
    useState<Record<string, string | string[]>>(initialFilters);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0 });

  // Update popover position on scroll and resize
  useEffect(() => {
    if (!showFilterPopover || !buttonRef.current) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPopoverPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };

    updatePosition();

    // Use capture phase for scroll events to catch all scrolling
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    // Add mutation observer to detect sidebar width changes
    const observer = new MutationObserver(updatePosition);
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ["class", "style"],
        subtree: true,
      });

      // Listen for CSS transition events on sidebar
      sidebar.addEventListener("transitionend", updatePosition);
    }

    // Also listen for global layout changes
    const resizeObserver = new ResizeObserver(updatePosition);
    if (buttonRef.current) {
      resizeObserver.observe(buttonRef.current);
    }
    // Observe the entire document body for layout changes
    resizeObserver.observe(document.body);

    // Continuous position updates during transitions
    let rafId: number;
    const continuousUpdate = () => {
      updatePosition();
      rafId = requestAnimationFrame(continuousUpdate);
    };
    rafId = requestAnimationFrame(continuousUpdate);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
      if (sidebar) {
        sidebar.removeEventListener("transitionend", updatePosition);
      }
    };
  }, [showFilterPopover]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on scrollbar or if target is null
      if (!event.target) return;

      const target = event.target as HTMLElement;

      // Don't close if clicking on sidebar or any interactive elements
      const sidebar = document.querySelector("aside");
      if (sidebar && sidebar.contains(target)) {
        return;
      }

      if (
        showFilterPopover &&
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(target as Node) &&
        !buttonRef.current.contains(target as Node)
      ) {
        // Check if click was on a scrollbar by comparing clientX with element boundaries
        const clickedOnScrollbar =
          event.clientX >
          target.clientWidth + target.getBoundingClientRect().left;

        if (!clickedOnScrollbar) {
          setShowFilterPopover(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterPopover]);

  const paddingClass = {
    compact: "px-3 py-2",
    normal: "px-4 py-3",
    spacious: "px-6 py-4",
  }[density];

  const heightClass = {
    compact: "h-8",
    normal: "h-10",
    spacious: "h-12",
  }[density];

  const filteredData = useMemo(() => {
    // Skip client-side filtering if using server-side
    if (useServerSide) return data;

    return data.filter((row) => {
      // Apply filters based on filterConfig
      for (const config of filterConfig) {
        const filterValue = filterValues[config.field];
        if (!filterValue) continue;

        const rowValue = (row as any)[config.field] || "";

        if (config.type === "text") {
          // Text filter: case-insensitive partial match
          if (
            !String(rowValue)
              .toLowerCase()
              .includes((filterValue as string).toLowerCase())
          ) {
            return false;
          }
        } else if (config.type === "radio") {
          // Radio filter: exact match
          if (rowValue !== filterValue) {
            return false;
          }
        } else if (config.type === "checkbox") {
          // Checkbox filter: row value must be in selected array
          const selectedValues = filterValue as string[];
          if (selectedValues.length > 0 && !selectedValues.includes(rowValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, filterValues, filterConfig, useServerSide]);

  const sortedData = useMemo(() => {
    // Skip client-side sorting if using server-side
    if (useServerSide) return filteredData;

    if (sortConfig.length === 0) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      // Apply sorts in order until we find a difference
      for (const sort of sortConfig) {
        const aValue = (a as any)[sort.column];
        const bValue = (b as any)[sort.column];

        if (aValue === bValue) continue;

        const comparison = aValue < bValue ? -1 : 1;
        return sort.direction === "asc" ? comparison : -comparison;
      }
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig, useServerSide]);

  const paginatedData = useMemo(() => {
    // Skip client-side pagination if using server-side
    if (useServerSide) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, useServerSide]);

  const totalPages = useServerSide
    ? serverTotalPages || 1
    : Math.ceil(sortedData.length / pageSize);

  const activePage = useServerSide ? serverCurrentPage || 1 : currentPage;

  const handleSort = (column: string) => {
    const existingIndex = sortConfig.findIndex((s) => s.column === column);
    let newSortConfig: TableSort[];

    if (existingIndex !== -1) {
      // Column already sorted - cycle through: asc -> desc -> remove
      const currentSort = sortConfig[existingIndex];
      if (currentSort.direction === "asc") {
        // Change to desc
        newSortConfig = [...sortConfig];
        newSortConfig[existingIndex] = { column, direction: "desc" };
      } else {
        // Remove this sort
        newSortConfig = sortConfig.filter((s) => s.column !== column);
      }
    } else {
      // New column - add to existing sorts (always multi-sort)
      newSortConfig = [...sortConfig, { column, direction: "asc" }];
    }

    setSortConfig(newSortConfig);
    setCurrentPage(1);

    // Call server-side sort handler if provided
    if (useServerSide && onSortChange) {
      onSortChange(newSortConfig);
    }
  };

  const renderSortIcon = (columnKey: string) => {
    const sortIndex = sortConfig.findIndex((s) => s.column === columnKey);

    if (sortIndex === -1) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }

    const sort = sortConfig[sortIndex];
    const icon =
      sort.direction === "asc" ? (
        <ChevronUp className="w-4 h-4 text-cyan-600" />
      ) : (
        <ChevronDown className="w-4 h-4 text-cyan-600" />
      );

    // Show sort order number if multiple sorts
    if (sortConfig.length > 1) {
      return (
        <div className="flex items-center gap-1">
          {icon}
          <span className="text-xs text-cyan-600 font-semibold">
            {sortIndex + 1}
          </span>
        </div>
      );
    }

    return icon;
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white shadow-sm">
        {title && (
          <div className="px-6 py-4 border-b font-semibold text-gray-900">
            {title}
          </div>
        )}
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0 && !useServerSide) {
    return (
      <div className="border rounded-lg bg-white shadow-sm">
        {title && (
          <div className="px-6 py-4 border-b font-semibold text-gray-900">
            {title}
          </div>
        )}
        <div className={`${emptyDataProps.padding} text-center text-gray-500`}>
          {emptyDataProps.message}
        </div>
      </div>
    );
  }

  const handleApplyFilters = () => {
    setFilterValues({ ...tempFilters });
    setShowFilterPopover(false);
    setCurrentPage(1);

    // Call server-side filter handler if provided
    if (useServerSide && onFilterChange) {
      onFilterChange({ ...tempFilters });
    }
  };

  const handleCancelFilters = () => {
    setTempFilters({ ...filterValues });
    setShowFilterPopover(false);
  };

  const handleClearFilters = () => {
    // Only clear temporary filters in the popover, don't apply to actual data
    const clearedFilters: Record<string, string> = {};
    filterConfig.forEach((config) => {
      clearedFilters[config.field] = "";
    });
    setTempFilters(clearedFilters);
    // Don't close the popover and don't reset filterValues or currentPage
  };

  const hasActiveFilters = Object.values(filterValues).some((value) =>
    Array.isArray(value) ? value.length > 0 : value !== ""
  );

  const handleRefresh = () => {
    // Reset sorting
    setSortConfig([]);
    if (useServerSide && onSortChange) {
      onSortChange([]);
    }

    // Call refresh callback if provided
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b font-semibold text-gray-900 flex items-center justify-between">
          <div className="flex gap-2">
            <span>{title}</span>
            {showBadgeCount && data.length > 0 && <Badge>{data.length}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              title="Refresh data (resets sorting)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Filter Button */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => {
                  // Copy current filter values to temp filters
                  const tempCopy: Record<string, string | string[]> = {};
                  filterConfig.forEach((config) => {
                    tempCopy[config.field] =
                      filterValues[config.field] ||
                      (config.type === "checkbox" ? [] : "");
                  });
                  setTempFilters(tempCopy);
                  setShowFilterPopover(!showFilterPopover);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  hasActiveFilters
                    ? "bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-cyan-600 text-white text-xs rounded-full">
                    {
                      Object.values(filterValues).filter((value) =>
                        Array.isArray(value) ? value.length > 0 : value !== ""
                      ).length
                    }
                  </span>
                )}
              </button>

              {showFilterPopover && (
                <div
                  ref={popoverRef}
                  className="fixed w-90 bg-white border rounded-lg shadow-lg"
                  style={{
                    top: `${popoverPosition.top}px`,
                    right: `${popoverPosition.right}px`,
                    zIndex: 9,
                    maxHeight: `calc(100vh - ${popoverPosition.top + 8}px)`,
                    overflowY: "auto",
                  }}
                >
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-semibold text-gray-900">Filters</h3>
                      <button
                        onClick={() => setShowFilterPopover(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dynamic Filters */}
                    {filterConfig.map((config) => (
                      <div key={config.field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {config.label}
                        </label>

                        {config.type === "text" ? (
                          <input
                            type="text"
                            value={(tempFilters[config.field] as string) || ""}
                            onChange={(e) =>
                              setTempFilters({
                                ...tempFilters,
                                [config.field]: e.target.value,
                              })
                            }
                            placeholder={
                              config.placeholder ||
                              `Search by ${config.label.toLowerCase()}...`
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        ) : config.type === "radio" && config.options ? (
                          <div
                            className="grid gap-x-4"
                            style={{
                              gridTemplateColumns: `auto ${config.options
                                .map(() => "1fr")
                                .join(" ")}`,
                            }}
                          >
                            {["", ...config.options].map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 cursor-pointer justify-start"
                              >
                                <input
                                  type="radio"
                                  name={config.field}
                                  value={option}
                                  checked={tempFilters[config.field] === option}
                                  onChange={(e) =>
                                    setTempFilters({
                                      ...tempFilters,
                                      [config.field]: e.target.value,
                                    })
                                  }
                                  className="w-4 h-4 text-cyan-600 flex-shrink-0"
                                />
                                <span className="text-sm text-gray-700 whitespace-nowrap">
                                  {option === ""
                                    ? "All"
                                    : option.charAt(0).toUpperCase() +
                                      option.slice(1)}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : config.type === "checkbox" && config.options ? (
                          <div className="grid grid-cols-3 gap-3">
                            {config.options.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={(
                                    tempFilters[config.field] as string[]
                                  ).includes(option)}
                                  onChange={(e) => {
                                    const currentValues =
                                      (tempFilters[config.field] as string[]) ||
                                      [];
                                    const newValues = e.target.checked
                                      ? [...currentValues, option]
                                      : currentValues.filter(
                                          (v) => v !== option
                                        );
                                    setTempFilters({
                                      ...tempFilters,
                                      [config.field]: newValues,
                                    });
                                  }}
                                  className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {option.charAt(0).toUpperCase() +
                                    option.slice(1)}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={handleClearFilters}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleCancelFilters}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyFilters}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`${paddingClass} text-left font-semibold text-gray-700 bg-gray-50`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center gap-2 hover:text-cyan-600 transition-colors w-full"
                      title="Click to sort by this column (supports multiple columns)"
                    >
                      {column.label}
                      {renderSortIcon(String(column.key))}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {rowActions && (
                <th
                  className={`${paddingClass} text-right font-semibold text-gray-700`}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className={`${emptyDataProps.padding} text-center text-gray-500`}
                >
                  {emptyDataProps.message}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-t hover:bg-gray-50 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${index % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
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
                      <div onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(totalPages > 1 || (useServerSide && (totalCount || 0) > 0)) && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Page {activePage} of {totalPages} (
            {useServerSide ? totalCount || 0 : sortedData.length} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newPage = Math.max(1, activePage - 1);
                if (useServerSide && onPageChange) {
                  onPageChange(newPage);
                } else {
                  setCurrentPage(newPage);
                }
              }}
              disabled={
                useServerSide ? hasPrevPage === false : activePage === 1
              }
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const newPage = Math.min(totalPages, activePage + 1);
                if (useServerSide && onPageChange) {
                  onPageChange(newPage);
                } else {
                  setCurrentPage(newPage);
                }
              }}
              disabled={
                useServerSide
                  ? hasNextPage === false
                  : activePage === totalPages
              }
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
