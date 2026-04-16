import type { Table } from "../../types/table";
import type { GuestLimits } from "../types";
import { getGuestWord } from "../utils";

type GuestCountStepProps = {
  selectedTable: Table;
  tableLimits: GuestLimits;
  currentGuestCount: number;
  sliderProgress: number;
  guestCountError: string;
  onGuestCountChange: (value: number) => void;
};

export function GuestCountStep({
  selectedTable,
  tableLimits,
  currentGuestCount,
  sliderProgress,
  guestCountError,
  onGuestCountChange,
}: GuestCountStepProps) {
  return (
    <div className="booking-step-content">
      <div className="booking-inline-card booking-inline-card--accent">
        <span className="booking-inline-card__label">Выбранный стол</span>
        <strong>Стол №{selectedTable.number}</strong>
        <span>
          Вместимость: от {tableLimits.min} до {tableLimits.max} {getGuestWord(tableLimits.max)}
        </span>
      </div>

      <div className="booking-guest-counter">
        <div className="booking-guest-counter__value">
          <strong>{currentGuestCount}</strong>
          <span>{getGuestWord(currentGuestCount)}</span>
        </div>

        <input
          type="range"
          min={tableLimits.min}
          max={tableLimits.max}
          value={currentGuestCount}
          onChange={(event) => onGuestCountChange(Number.parseInt(event.target.value, 10))}
          style={{
            background: `linear-gradient(to right, rgba(148, 163, 184, 0.8) 0%, rgba(148, 163, 184, 0.8) ${sliderProgress}%, rgba(148, 163, 184, 0.25) ${sliderProgress}%, rgba(148, 163, 184, 0.25) 100%)`,
          }}
        />

        <div className="booking-counter-actions">
          <button
            type="button"
            onClick={() => onGuestCountChange(Math.max(tableLimits.min, currentGuestCount - 1))}
            disabled={currentGuestCount <= tableLimits.min}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => onGuestCountChange(Math.min(tableLimits.max, currentGuestCount + 1))}
            disabled={currentGuestCount >= tableLimits.max}
          >
            +
          </button>
        </div>
      </div>
      {guestCountError && <div className="booking-error-banner">{guestCountError}</div>}
    </div>
  );
}
