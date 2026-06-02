import type { Table } from "../../types/table";
import type { BookingType, GuestInfo } from "../types";
import { formatBookingDate, getGuestWord } from "../utils";

type ConfirmationStepProps = {
  bookingType: BookingType | null;
  activeGuestInfo: GuestInfo;
  selectedDate: string;
  selectedTime: string;
  selectedTable: Table;
  guestCount: number;
  occasion: string;
};

export function ConfirmationStep({
  activeGuestInfo,
  selectedDate,
  selectedTime,
  selectedTable,
  guestCount,
  occasion,
}: ConfirmationStepProps) {
  return (
    <div className="booking-step-content">
      <div className="booking-confirm-grid">
        <div className="booking-confirm-card">
          <span>Гость</span>
          <strong>{activeGuestInfo.name}</strong>
          <small>{activeGuestInfo.phone}</small>
        </div>
        <div className="booking-confirm-card">
          <span>Дата и время</span>
          <strong>{formatBookingDate(selectedDate)}</strong>
          <small>{selectedTime}</small>
        </div>
        <div className="booking-confirm-card">
          <span>Стол</span>
          <strong>№{selectedTable.number}</strong>
          <small>{guestCount} {getGuestWord(guestCount)}</small>
        </div>
        <div className="booking-confirm-card">
          <span>Мероприятие</span>
          <strong>{occasion || "Не указано"}</strong>
        </div>
      </div>
    </div>
  );
}
