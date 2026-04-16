import { DatePickerField } from "../components/DatePickerField";
import { formatBookingDate, getLocalDateValue } from "../utils";

type DateTimeStepProps = {
  selectedDate: string;
  selectedTime: string;
  availableHours: number[];
  selectedHour: number | null;
  selectedMinute: number | null;
  availableMinutes: number[];
  timeError: string;
  onDateChange: (value: string) => void;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
};

export function DateTimeStep({
  selectedDate,
  selectedTime,
  availableHours,
  selectedHour,
  selectedMinute,
  availableMinutes,
  timeError,
  onDateChange,
  onHourChange,
  onMinuteChange,
}: DateTimeStepProps) {
  return (
    <div className="booking-step-content">
      <div className="booking-form-grid booking-form-grid--double">
        <div className="booking-field">
          <span>Дата</span>
          <DatePickerField
            value={selectedDate}
            minDate={getLocalDateValue()}
            onChange={onDateChange}
          />
        </div>

        <div className="booking-helper-card">
          <span className="booking-helper-card__label">График работы</span>
          <strong>Пн-Пт: 11:00-22:00</strong>
          <span>Сб-Вс: 10:00-21:00</span>
        </div>
      </div>

      <div className="booking-form-grid booking-form-grid--triple">
        <label className="booking-field">
          <span>Часы</span>
          <select value={selectedHour ?? ""} onChange={(event) => onHourChange(event.target.value)}>
            <option value="">Выберите час</option>
            {availableHours.map((hour) => (
              <option key={hour} value={hour}>
                {hour.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>

        <label className="booking-field">
          <span>Минуты</span>
          <select
            value={selectedMinute ?? ""}
            onChange={(event) => onMinuteChange(event.target.value)}
            disabled={selectedHour === null}
          >
            <option value="">Выберите минуты</option>
            {availableMinutes.map((minute) => (
              <option key={minute} value={minute}>
                {minute.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>

        <div className="booking-inline-card booking-inline-card--accent">
          <span className="booking-inline-card__label">Текущий выбор</span>
          <strong>{selectedTime || "Время не выбрано"}</strong>
          <span>{formatBookingDate(selectedDate)}</span>
        </div>
      </div>

      {timeError && <div className="booking-error-banner">{timeError}</div>}
    </div>
  );
}
