import { useState, useRef, useEffect } from "react";
import { Calendar, X } from "lucide-react";

interface DateRangePickerProps {
  value?: { start: Date | null; end: Date | null };
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className = "",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>(value || { start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external value prop
  useEffect(() => {
    if (value) {
      setSelectedRange(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateDisplay = () => {
    if (!selectedRange.start) return "";

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (
      selectedRange.end &&
      selectedRange.start.getTime() !== selectedRange.end.getTime()
    ) {
      return `${formatDate(selectedRange.start)} - ${formatDate(
        selectedRange.end
      )}`;
    }

    return formatDate(selectedRange.start);
  };

  const handleDateClick = (date: Date) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      // First selection or reset selection
      setSelectedRange({ start: date, end: null });
    } else {
      // Second selection
      let newRange;
      if (date < selectedRange.start) {
        newRange = { start: date, end: selectedRange.start };
      } else {
        newRange = { start: selectedRange.start, end: date };
      }
      setSelectedRange(newRange);
      // Automatically apply the range when second date is selected
      onChange(newRange);
      setIsOpen(false);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRange({ start: null, end: null });
    onChange({ start: null, end: null });
  };

  const handleApply = () => {
    onChange(selectedRange);
    setIsOpen(false);
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange.start) return false;

    const start = selectedRange.start;
    const end = selectedRange.end || hoverDate;

    if (!end) return isSameDay(date, start);

    const actualStart = start < end ? start : end;
    const actualEnd = start < end ? end : start;

    return date >= actualStart && date <= actualEnd;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedRange.start) return false;
    if (isSameDay(date, selectedRange.start)) return true;
    if (selectedRange.end && isSameDay(date, selectedRange.end)) return true;
    return false;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-cyan-500 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-200 transition-all bg-white"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          readOnly
          value={formatDateDisplay()}
          placeholder={placeholder}
          className="flex-1 text-sm outline-none cursor-pointer bg-transparent"
        />
        {selectedRange.start && (
          <button
            onClick={handleReset}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[320px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {monthYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-gray-500 text-center py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isInRange = isDateInRange(day);
              const isSelected = isDateSelected(day);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoverDate(day)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                    ${
                      isSelected
                        ? "bg-cyan-600 text-white font-semibold hover:bg-cyan-700"
                        : isInRange
                        ? "bg-cyan-100 text-cyan-900 hover:bg-cyan-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                    ${isToday && !isSelected ? "ring-2 ring-cyan-300" : ""}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <button
              onClick={() => {
                setSelectedRange({ start: null, end: null });
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              Clear
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedRange.start}
                className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Helper Text */}
          {selectedRange.start && !selectedRange.end && (
            <div className="mt-2 text-xs text-center text-gray-500">
              Click another date to select a range
            </div>
          )}
        </div>
      )}
    </div>
  );
}
