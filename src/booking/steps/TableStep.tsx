import type { Section, Table } from "../../types/table";
import { TableHall } from "../components/TableHall";
import { formatBookingDate } from "../utils";

type TableStepProps = {
  selectedDate: string;
  selectedTime: string;
  availableTables: Table[];
  isAvailabilityLoading: boolean;
  sections: Section[];
  availableTableIds: Set<string>;
  selectedTableId: string | null;
  tableError: string;
  onTableSelect: (table: Table) => void;
};

export function TableStep({
  selectedDate,
  selectedTime,
  availableTables,
  isAvailabilityLoading,
  sections,
  availableTableIds,
  selectedTableId,
  tableError,
  onTableSelect,
}: TableStepProps) {
  return (
    <div className="booking-step-content">
      <div className="booking-stats">
        <div className="booking-stat">
          <span>Дата</span>
          <strong>{formatBookingDate(selectedDate)}</strong>
        </div>
        <div className="booking-stat">
          <span>Время</span>
          <strong>{selectedTime || "Не выбрано"}</strong>
        </div>
        <div className="booking-stat">
          <span>Свободных столов</span>
          <strong>{isAvailabilityLoading ? "..." : availableTables.length}</strong>
        </div>
      </div>

      {isAvailabilityLoading ? (
        <div className="booking-empty-state">Обновляем доступность столов на выбранное время...</div>
      ) : (
        <>
          <TableHall
            sections={sections}
            availableTableIds={availableTableIds}
            selectedTableId={selectedTableId}
            onSelect={onTableSelect}
          />

          {availableTables.length === 0 && (
            <div className="booking-empty-state">
              На выбранное время свободных столов нет. Попробуйте изменить дату или время.
            </div>
          )}
        </>
      )}

      {tableError && <div className="booking-error-banner">{tableError}</div>}
    </div>
  );
}
