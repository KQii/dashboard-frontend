import { useState, useRef, useEffect } from "react";
import { Calendar, X, ChevronUp, ChevronDown } from "lucide-react";

interface DateTimePickerProps {
  value?: {
    start: { date: Date | null; time: { hour: number; minute: number } };
    end: { date: Date | null; time: { hour: number; minute: number } };
  };
  onChange: (range: {
    start: { date: Date | null; time: { hour: number; minute: number } };
    end: { date: Date | null; time: { hour: number; minute: number } };
  }) => void;
  placeholder?: string;
  className?: string;
}

// Helper function to get default times (current time and current time + 5 minutes)
const getDefaultTimes = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Calculate end time (current time + 5 minutes)
  const endTime = new Date(now.getTime() + 5 * 60 * 1000);
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  return {
    start: { hour: currentHour, minute: currentMinute },
    end: { hour: endHour, minute: endMinute },
  };
};

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time range",
  className = "",
}: DateTimePickerProps) {
  // Get current time for default values
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: { date: Date | null; time: { hour: number; minute: number } };
    end: { date: Date | null; time: { hour: number; minute: number } };
  }>(() => {
    if (value) return value;
    const defaultTimes = getDefaultTimes();
    return {
      start: { date: null, time: defaultTimes.start },
      end: { date: null, time: defaultTimes.end },
    };
  });
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

  const formatDateTimeDisplay = () => {
    if (!selectedRange.start.date) return "";

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    };

    const formatTime = (time: { hour: number; minute: number }) => {
      return `${String(time.hour).padStart(2, "0")}:${String(
        time.minute
      ).padStart(2, "0")}`;
    };

    const startStr = `${formatDate(selectedRange.start.date)} ${formatTime(
      selectedRange.start.time
    )}`;

    if (
      selectedRange.end.date &&
      selectedRange.start.date.getTime() !== selectedRange.end.date.getTime()
    ) {
      const endStr = `${formatDate(selectedRange.end.date)} ${formatTime(
        selectedRange.end.time
      )}`;
      return `${startStr} - ${endStr}`;
    }

    return `${startStr} - ${formatTime(selectedRange.end.time)}`;
  };

  const handleDateClick = (date: Date) => {
    if (
      !selectedRange.start.date ||
      (selectedRange.start.date && selectedRange.end.date)
    ) {
      // First selection or reset selection
      setSelectedRange({
        start: { date, time: selectedRange.start.time },
        end: { date: null, time: selectedRange.end.time },
      });
    } else {
      // Second selection
      let newRange;
      if (date < selectedRange.start.date) {
        newRange = {
          start: { date, time: selectedRange.start.time },
          end: { date: selectedRange.start.date, time: selectedRange.end.time },
        };
      } else {
        newRange = {
          start: selectedRange.start,
          end: { date, time: selectedRange.end.time },
        };
      }
      setSelectedRange(newRange);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultTimes = getDefaultTimes();
    const resetRange = {
      start: { date: null, time: defaultTimes.start },
      end: { date: null, time: defaultTimes.end },
    };
    setSelectedRange(resetRange);
    onChange(resetRange);
  };

  const handleApply = () => {
    onChange(selectedRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset to the current value prop or empty state
    if (value) {
      setSelectedRange(value);
    }
    setIsOpen(false);
  };

  const incrementTime = (
    type: "start" | "end",
    unit: "hour" | "minute",
    amount: number
  ) => {
    setSelectedRange((prev) => {
      const target = type === "start" ? prev.start : prev.end;
      let newHour = target.time.hour;
      let newMinute = target.time.minute;

      if (unit === "hour") {
        newHour = (target.time.hour + amount + 24) % 24;
      } else {
        newMinute = (target.time.minute + amount + 60) % 60;
      }

      return {
        ...prev,
        [type]: {
          ...target,
          time: { hour: newHour, minute: newMinute },
        },
      };
    });
  };

  const handleTimeInputChange = (
    type: "start" | "end",
    unit: "hour" | "minute",
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    setSelectedRange((prev) => {
      const target = type === "start" ? prev.start : prev.end;
      let newValue = numValue;

      if (unit === "hour") {
        newValue = Math.max(0, Math.min(23, numValue));
      } else {
        newValue = Math.max(0, Math.min(59, numValue));
      }

      return {
        ...prev,
        [type]: {
          ...target,
          time: {
            ...target.time,
            [unit]: newValue,
          },
        },
      };
    });
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange.start.date) return false;

    const start = selectedRange.start.date;
    const end = selectedRange.end.date || hoverDate;

    if (!end) return isSameDay(date, start);

    const actualStart = start < end ? start : end;
    const actualEnd = start < end ? end : start;

    return date >= actualStart && date <= actualEnd;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedRange.start.date) return false;
    if (isSameDay(date, selectedRange.start.date)) return true;
    if (selectedRange.end.date && isSameDay(date, selectedRange.end.date))
      return true;
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

  const TimeSpinner = ({
    type,
    unit,
    value,
  }: {
    type: "start" | "end";
    unit: "hour" | "minute";
    value: number;
  }) => (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => incrementTime(type, unit, 1)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        <ChevronUp className="w-3 h-3 text-gray-600" />
      </button>
      <input
        type="text"
        value={String(value).padStart(2, "0")}
        onChange={(e) => handleTimeInputChange(type, unit, e.target.value)}
        className="w-10 text-center text-sm font-medium border rounded py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        maxLength={2}
      />
      <button
        type="button"
        onClick={() => incrementTime(type, unit, -1)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        <ChevronDown className="w-3 h-3 text-gray-600" />
      </button>
    </div>
  );

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
          value={formatDateTimeDisplay()}
          placeholder={placeholder}
          className="flex-1 text-sm outline-none cursor-pointer bg-transparent"
        />
        {selectedRange.start.date && (
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
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-[380px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
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
              type="button"
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
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isInRange = isDateInRange(day);
              const isSelected = isDateSelected(day);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  type="button"
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

          {/* Time Selection */}
          <div className="border-t pt-4 space-y-3">
            {/* Start Time */}
            <div className="flex items-center justify-around gap-3">
              <span className="text-sm font-medium text-gray-700 w-8">
                Start
              </span>
              <div className="flex items-center gap-2">
                <TimeSpinner
                  type="start"
                  unit="hour"
                  value={selectedRange.start.time.hour}
                />
                <span className="text-lg font-semibold text-gray-600">:</span>
                <TimeSpinner
                  type="start"
                  unit="minute"
                  value={selectedRange.start.time.minute}
                />
              </div>
              {selectedRange.start.date && (
                <span className="text-xs text-gray-500">
                  {selectedRange.start.date.toLocaleDateString()}{" "}
                  {String(selectedRange.start.time.hour).padStart(2, "0")}:
                  {String(selectedRange.start.time.minute).padStart(2, "0")}
                </span>
              )}
            </div>

            {/* End Time */}
            <div className="flex items-center justify-around gap-3">
              <span className="text-sm font-medium text-gray-700 w-8">End</span>
              <div className="flex items-center gap-2">
                <TimeSpinner
                  type="end"
                  unit="hour"
                  value={selectedRange.end.time.hour}
                />
                <span className="text-lg font-semibold text-gray-600">:</span>
                <TimeSpinner
                  type="end"
                  unit="minute"
                  value={selectedRange.end.time.minute}
                />
              </div>
              {(selectedRange.end.date || selectedRange.start.date) && (
                <span className="text-xs text-gray-500">
                  {(
                    selectedRange.end.date || selectedRange.start.date
                  )?.toLocaleDateString()}{" "}
                  {String(selectedRange.end.time.hour).padStart(2, "0")}:
                  {String(selectedRange.end.time.minute).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!selectedRange.start.date}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set
            </button>
          </div>

          {/* Helper Text */}
          {selectedRange.start.date && !selectedRange.end.date && (
            <div className="mt-2 text-xs text-center text-gray-500">
              Click another date to select a range or set time for single day
            </div>
          )}
        </div>
      )}
    </div>
  );
}
