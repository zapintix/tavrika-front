import type { Table } from "../../types/table";
import type { BookingType, GuestInfo, StepDefinition } from "../types";
import { formatBookingDate, getBookingTypeLabel, getGuestWord } from "../utils";

type SummarySidebarProps = {
  steps: StepDefinition[];
  currentStep: number;
  bookingType: BookingType | null;
  activeGuestInfo: GuestInfo;
  selectedDate: string;
  selectedTime: string;
  selectedTable: Table | null;
  guestCount: number | null;
};

export function SummarySidebar({
  steps,
  currentStep,
  bookingType,
  activeGuestInfo,
  selectedDate,
  selectedTime,
  selectedTable,
  guestCount,
}: SummarySidebarProps) {
  return (
    <aside className="booking-sidebar">
      <div className="booking-sidebar-card">
        <span className="booking-sidebar-card__label">Текущий статус</span>
        <strong>{steps[currentStep].title}</strong>
        <p>{steps[currentStep].caption}</p>
      </div>

      <div className="booking-sidebar-card">
        <span className="booking-sidebar-card__label">Сводка брони</span>
        <dl className="booking-summary">
          <div>
            <dt>На кого</dt>
            <dd>{getBookingTypeLabel(bookingType)}</dd>
          </div>
          <div>
            <dt>Контакт</dt>
            <dd>{bookingType ? `${activeGuestInfo.name || "—"} · ${activeGuestInfo.phone || "—"}` : "—"}</dd>
          </div>
          <div>
            <dt>Дата</dt>
            <dd>{selectedDate ? formatBookingDate(selectedDate) : "—"}</dd>
          </div>
          <div>
            <dt>Время</dt>
            <dd>{selectedTime || "—"}</dd>
          </div>
          <div>
            <dt>Стол</dt>
            <dd>{selectedTable ? `№${selectedTable.number}` : "—"}</dd>
          </div>
          <div>
            <dt>Гости</dt>
            <dd>{guestCount !== null ? `${guestCount} ${getGuestWord(guestCount)}` : "—"}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
