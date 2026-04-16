import { useEffect, useMemo, useState } from "react";
import { formatBookingDate, getLocalDateValue, parseLocalDate } from "../utils";

type DatePickerFieldProps = {
  value: string;
  minDate?: string;
  onChange: (value: string) => void;
};

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});

function getMonthStart(dateValue: string): Date {
  const date = parseLocalDate(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function getCalendarDays(month: Date): Array<Date | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const days: Array<Date | null> = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, monthIndex, day));
  }

  const trailingPlaceholders = (7 - (days.length % 7)) % 7;

  for (let index = 0; index < trailingPlaceholders; index += 1) {
    days.push(null);
  }

  return days;
}

function formatMonthLabel(month: Date): string {
  const label = monthFormatter.format(month);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function DatePickerField({
  value,
  minDate = getLocalDateValue(),
  onChange,
}: DatePickerFieldProps) {
  const selectedDate = value || minDate;
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(selectedDate));

  useEffect(() => {
    setVisibleMonth((currentMonth) => {
      const nextMonth = getMonthStart(selectedDate);
      return getMonthIndex(currentMonth) === getMonthIndex(nextMonth) ? currentMonth : nextMonth;
    });
  }, [selectedDate]);

  const minimumMonth = useMemo(() => getMonthStart(minDate), [minDate]);
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const today = getLocalDateValue();
  const canGoToPreviousMonth = getMonthIndex(visibleMonth) > getMonthIndex(minimumMonth);

  return (
    <div className="booking-calendar" role="group" aria-label="Выбор даты бронирования">
      <div className="booking-calendar__header">
        <button
          type="button"
          className="booking-calendar__nav"
          onClick={() =>
            setVisibleMonth((currentMonth) => {
              if (!canGoToPreviousMonth) {
                return currentMonth;
              }

              return new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            })
          }
          disabled={!canGoToPreviousMonth}
          aria-label="Предыдущий месяц"
        >
          {"<"}
        </button>

        <div className="booking-calendar__heading">
          <strong>{formatMonthLabel(visibleMonth)}</strong>
          <span>{formatBookingDate(selectedDate)}</span>
        </div>

        <button
          type="button"
          className="booking-calendar__nav"
          onClick={() =>
            setVisibleMonth(
              (currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
            )
          }
          aria-label="Следующий месяц"
        >
          {">"}
        </button>
      </div>

      <div className="booking-calendar__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="booking-calendar__grid">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} className="booking-calendar__placeholder" aria-hidden="true" />;
          }

          const dayValue = getLocalDateValue(day);
          const isSelected = dayValue === selectedDate;
          const isToday = dayValue === today;
          const isUnavailable = dayValue < minDate;
          const className = [
            "booking-calendar__day",
            isSelected ? "is-selected" : "",
            isToday ? "is-today" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={dayValue}
              type="button"
              className={className}
              disabled={isUnavailable}
              onClick={() => onChange(dayValue)}
              aria-pressed={isSelected}
              aria-label={formatBookingDate(dayValue)}
            >
              <span className="booking-calendar__day-number">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
