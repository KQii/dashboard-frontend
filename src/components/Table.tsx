import { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  X,
} from "lucide-react";
import { TableColumn, TableSort } from "../types";

interface TableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  title?: string;
  pageSize?: number;
  density?: "compact" | "normal" | "spacious";
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
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<TableSort | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    name: "",
    severity: "",
    status: "",
  });
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
    return data.filter((row) => {
      // Name filter
      if (filterValues.name) {
        const nameValue = (row as any).name || "";
        if (
          !String(nameValue)
            .toLowerCase()
            .includes(filterValues.name.toLowerCase())
        ) {
          return false;
        }
      }

      // Severity filter
      if (filterValues.severity) {
        const severityValue = (row as any).severity || "";
        if (severityValue !== filterValues.severity) {
          return false;
        }
      }

      // Status filter
      if (filterValues.status) {
        const statusValue = (row as any).state || (row as any).status || "";
        if (statusValue !== filterValues.status) {
          return false;
        }
      }

      return true;
    });
  }, [data, filterValues]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortConfig.column];
      const bValue = (b as any)[sortConfig.column];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: string) => {
    setSortConfig((current) => {
      if (current?.column === column) {
        return current.direction === "asc"
          ? { column, direction: "desc" }
          : null;
      }
      return { column, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig?.column !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-cyan-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-cyan-600" />
    );
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

  if (data.length === 0) {
    return (
      <div className="border rounded-lg bg-white shadow-sm">
        {title && (
          <div className="px-6 py-4 border-b font-semibold text-gray-900">
            {title}
          </div>
        )}
        <div className="p-12 text-center text-gray-500">No data available</div>
      </div>
    );
  }

  const handleApplyFilters = () => {
    setFilterValues({
      name: tempFilters.name,
      severity: tempFilters.severity,
      status: tempFilters.status,
    });
    setShowFilterPopover(false);
    setCurrentPage(1);
  };

  const handleCancelFilters = () => {
    setTempFilters({
      name: filterValues.name || "",
      severity: filterValues.severity || "",
      status: filterValues.status || "",
    });
    setShowFilterPopover(false);
  };

  const handleClearFilters = () => {
    // Only clear temporary filters in the popover, don't apply to actual data
    setTempFilters({ name: "", severity: "", status: "" });
    // Don't close the popover and don't reset filterValues or currentPage
  };

  const hasActiveFilters =
    filterValues.name || filterValues.severity || filterValues.status;

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b font-semibold text-gray-900 flex items-center justify-between">
          <span>{title}</span>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => {
                setTempFilters({
                  name: filterValues.name || "",
                  severity: filterValues.severity || "",
                  status: filterValues.status || "",
                });
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
                    [
                      filterValues.name,
                      filterValues.severity,
                      filterValues.status,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>

            {showFilterPopover && (
              <div
                ref={popoverRef}
                className="fixed w-80 bg-white border rounded-lg shadow-lg"
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

                  {/* Name Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={tempFilters.name}
                      onChange={(e) =>
                        setTempFilters({ ...tempFilters, name: e.target.value })
                      }
                      placeholder="Search by name..."
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Severity Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity
                    </label>
                    <div className="space-y-2">
                      {["", "critical", "warning", "info"].map((severity) => (
                        <label
                          key={severity}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="severity"
                            value={severity}
                            checked={tempFilters.severity === severity}
                            onChange={(e) =>
                              setTempFilters({
                                ...tempFilters,
                                severity: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-cyan-600"
                          />
                          <span className="text-sm text-gray-700">
                            {severity === ""
                              ? "All"
                              : severity.charAt(0).toUpperCase() +
                                severity.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="space-y-2">
                      {["", "firing", "pending", "inactive"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={tempFilters.status === status}
                            onChange={(e) =>
                              setTempFilters({
                                ...tempFilters,
                                status: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-cyan-600"
                          />
                          <span className="text-sm text-gray-700">
                            {status === ""
                              ? "All"
                              : status.charAt(0).toUpperCase() +
                                status.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

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
            {paginatedData.map((row, index) => (
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
