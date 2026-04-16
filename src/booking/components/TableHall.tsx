import { useMemo } from "react";
import type { Section, Table } from "../../types/table";
import { getGuestLimits } from "../../utils/TableCapacity";
import type { LayoutTable } from "../types";
import { getGuestWord } from "../utils";

type TableHallProps = {
  sections: Section[];
  availableTableIds: Set<string>;
  selectedTableId: string | null;
  onSelect: (table: Table) => void;
};

type PositionedTable = Table & {
  x: number;
  y: number;
  width: number;
  height: number;
};

function hasPosition(table: Table): table is PositionedTable {
  return (
    table.number < 100 &&
    table.x !== null &&
    table.y !== null &&
    table.width !== null &&
    table.height !== null
  );
}

function buildTableLayout(
  sections: Section[],
  availableTableIds: Set<string>,
  selectedTableId: string | null
): LayoutTable[] {
  if (!sections.length) {
    return [];
  }

  let maxX = 0;
  let maxY = 0;

  sections.forEach((section) => {
    section.tables.filter(hasPosition).forEach((table) => {
      maxX = Math.max(maxX, table.x + table.width);
      maxY = Math.max(maxY, table.y + table.height);
    });
  });

  if (maxX === 0) {
    maxX = 1000;
  }

  if (maxY === 0) {
    maxY = 1000;
  }

  return sections.flatMap((section) =>
    section.tables.filter(hasPosition).map((table) => {
      let newX = table.y;
      let newY = maxX - (table.x + table.width);
      let widthPercent = (table.width / maxX) * 100 * 0.5;
      let heightPercent = (table.height / maxY) * 100 * 1.7;
      let borderRadius = table.borderRadius ?? 6;

      if (table.number === 8) {
        newY += 50;
        heightPercent = 25.6;
      }

      if (table.number === 2) {
        newX -= 75;
        newY -= 50;
        heightPercent = 20.6;
        widthPercent = 16.47;
        borderRadius = 33;
      }

      if (table.number === 1) {
        newY += 10;
        heightPercent = 23.6;
      }

      if (table.number === 12) {
        newY -= 50;
      }

      if (table.number === 13) {
        newX += 110;
        newY += 10;
      }

      if (table.number === 7) {
        newY += 50;
        newX += 52;
        heightPercent = 19;
      }

      if (table.number === 6) {
        newY += 45;
        newX -= 45;
        heightPercent = 19;
      }

      if ([3, 4, 5].includes(table.number)) {
        widthPercent = 8;
        newY += 50;
      }

      if (table.number >= 9 && table.number <= 13) {
        heightPercent = 14;
      }

      return {
        table,
        left: (newX / maxY) * 100,
        bottom: (newY / maxX) * 100,
        width: heightPercent,
        height: widthPercent,
        borderRadius,
        isAvailable: availableTableIds.has(table.id),
        isSelected: selectedTableId === table.id,
        limits: getGuestLimits(table.number),
      };
    })
  );
}

function getCapacityLabel(maxGuests: number): string {
  return `До ${maxGuests} ${getGuestWord(maxGuests)}`;
}

function renderCapacityBadge(maxGuests: number) {
  return (
    <span className="booking-hall-table__capacity" aria-hidden="true">
      <span className="booking-hall-table__capacity-value">{maxGuests}</span>
      <span className="booking-hall-table__capacity-label">чел.</span>
    </span>
  );
}

export function TableHall({
  sections,
  availableTableIds,
  selectedTableId,
  onSelect,
}: TableHallProps) {
  const hallSize = useMemo(() => {
    let maxX = 0;
    let maxY = 0;

    sections.forEach((section) =>
      section.tables.filter(hasPosition).forEach((table) => {
        maxX = Math.max(maxX, table.x + table.width);
        maxY = Math.max(maxY, table.y + table.height);
      })
    );

    return {
      width: maxX || 1000,
      height: maxY || 1000,
    };
  }, [sections]);

  const layout = useMemo(
    () => buildTableLayout(sections, availableTableIds, selectedTableId),
    [sections, availableTableIds, selectedTableId]
  );

  const hallWidthPx = Math.min(hallSize.width * 0.55, 500);
  const hallHeightPx = Math.min(hallSize.height * 0.55, 420);
  const hallMinWidth = Math.min(hallWidthPx, 320);

  return (
    <div className="booking-hall-card">
      <div className="booking-hall-legend">
        <span className="booking-hall-legend-item">
          <span className="booking-hall-legend-dot booking-hall-legend-dot--available" />
          Свободно
        </span>
        <span className="booking-hall-legend-item">
          <span className="booking-hall-legend-dot booking-hall-legend-dot--selected" />
          Выбрано
        </span>
        <span className="booking-hall-legend-item">
          <span className="booking-hall-legend-dot booking-hall-legend-dot--occupied" />
          Занято
        </span>
      </div>

      <div className="booking-hall-scroll">
        <div
          className="booking-hall"
          style={{
            width: "100%",
            maxWidth: `${hallWidthPx}px`,
            minWidth: `${hallMinWidth}px`,
            aspectRatio: `${hallWidthPx} / ${hallHeightPx}`,
          }}
        >
          {layout
            .filter((item) => !item.isAvailable)
            .map(({ table, left, bottom, width, height, borderRadius, limits }) => (
              <div
                key={table.id}
                className="booking-hall-table booking-hall-table--occupied"
                aria-label={getCapacityLabel(limits.max)}
                title={getCapacityLabel(limits.max)}
                style={{
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                {renderCapacityBadge(limits.max)}
              </div>
            ))}

          {layout
            .filter((item) => item.isAvailable)
            .map(({ table, left, bottom, width, height, borderRadius, limits, isSelected }) => (
              <button
                key={table.id}
                type="button"
                className={`booking-hall-table booking-hall-table--available${isSelected ? " booking-hall-table--selected" : ""}`}
                aria-label={getCapacityLabel(limits.max)}
                title={getCapacityLabel(limits.max)}
                style={{
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  borderRadius: `${borderRadius}px`,
                }}
                onClick={() => onSelect(table)}
              >
                {renderCapacityBadge(limits.max)}
              </button>
            ))}

          <div className="booking-hall-feature booking-hall-feature--bar">Бар</div>
          <div className="booking-hall-feature booking-hall-feature--center" />
          <div className="booking-hall-feature booking-hall-feature--entry-top">Вход</div>
          <div className="booking-hall-feature booking-hall-feature--entry-bottom">Вход</div>
        </div>
      </div>
    </div>
  );
}
