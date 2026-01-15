import { useRef, useMemo } from "react";
import type { Table, Section } from "./types/table";
interface Props {
  sections: Section[];
  filteredTableIds: string[]; // ID доступных столов
  onTableSelect: (table: Table) => void;
  onClose: () => void;
}

export default function TableSelectionModal({ 
  sections, 
  filteredTableIds, 
  onTableSelect, 
  onClose 
}: Props) {
  const hallRef = useRef<HTMLDivElement>(null);

  const SIZE = 1.7;
  const transformedTables = useMemo(() => {
    if (!sections.length) return [];

    let maxX = 0;
    let maxY = 0;
    
    sections.forEach((section) =>
      section.tables.forEach((table) => {
        if (table.x !== null && table.width !== null) {
          if (table.x + table.width > maxX) maxX = table.x + table.width;
        }
        if (table.y !== null && table.height !== null) {
          if (table.y + table.height > maxY) maxY = table.y + table.height;
        }
      })
    );

    if (maxX === 0) maxX = 1000;
    if (maxY === 0) maxY = 1000;

    const result: Array<{
      table: Table;
      left: number;
      bottom: number;
      width: number;
      height: number;
      borderRadius: number;
      isAvailable: boolean;
    }> = [];

    sections.forEach((section) => {
      section.tables.forEach((table) => {
        if (table.number >= 100) return;
        
        if (table.x === null || table.y === null || 
            table.width === null || table.height === null) {
          return;
        }

        const isAvailable = filteredTableIds.includes(table.id);

        let newX = table.y;
        let newY = maxX - (table.x + table.width);
        let widthPercent = (table.width / maxX) * 100 * 0.5;
        let heightPercent = (table.height / maxY) * 100 * SIZE;
        let borderRadius = table.borderRadius ?? 6;

        //-----------------HARD-CODE-----------------------
        if (table.number === 8) {
          newY += 50;
          heightPercent = 25.6;
        }

        if (table.number === 2) {
          newX -= 75
          newY -= 50;
          heightPercent = 20.6
          widthPercent = 16.47
          borderRadius = 33
        }
        
        if (table.number === 1) {
          newY += 10;
          heightPercent = 23.6
        }

        if (table.number === 12) {
          newY -= 50;
        }

        if (table.number === 7) {
          newY += 50;
          newX += 52;
          heightPercent = 19
        }

        if (table.number === 6) {
          newY += 50;
          newX -= 190;
          heightPercent = 19
        }

        if ([3, 4, 5].includes(table.number)) {
          widthPercent = 8
          newY += 50;
        }
        
        //-------------------------------------------------

        const leftPercent = ((newX / maxY) * 100);
        const bottomPercent = (newY / maxX) * 100;

        result.push({
          table,
          left: leftPercent,
          bottom: bottomPercent,
          width: heightPercent,  
          height: widthPercent,
          isAvailable,
          borderRadius: borderRadius,
        });
      });
    });

    return result;
  }, [sections, filteredTableIds]);

  const hallSize = useMemo(() => {
    let maxX = 0;
    let maxY = 0;

    sections.forEach(section =>
      section.tables.forEach(table => {
        if (
          table.x !== null &&
          table.y !== null &&
          table.width !== null &&
          table.height !== null
        ) {
          maxX = Math.max(maxX, table.x + table.width);
          maxY = Math.max(maxY, table.y + table.height);
        }
      })
    );

    return {
      width: maxX || 1000,
      height: maxY || 1000
    };
  }, [sections]);

  const HeightSCALE = 0.55;
  const WidthSCALE = 0.55;

  const hallWidthPx = hallSize.width * WidthSCALE;
  const hallHeightPx = hallSize.height * HeightSCALE;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const availableTables = transformedTables.filter(item => item.isAvailable);
  const unavailableTables = transformedTables.filter(item => !item.isAvailable);

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "15px"
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1e293b, #0f172a)",
          borderRadius: "14px",
          padding: "20px",
          width: "100%",
          maxWidth: "550px",
          maxHeight: "85vh",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: "20px", 
            color: "#fff" 
          }}>
            Выберите стол
          </h3>
          <button onClick={onClose} style={{
            background: "none", 
            border: "none", 
            color: "#94a3b8",
            fontSize: "22px", 
            cursor: "pointer", 
            padding: "4px 8px", 
            borderRadius: "6px",
            transition: "all 0.2s"
          }}
            onMouseOver={e => e.currentTarget.style.color="#fff"}
            onMouseOut={e => e.currentTarget.style.color="#94a3b8"}
          >✕</button>
        </div>

        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center",
          gap: "15px"
        }}>
          <div
            ref={hallRef}
            style={{
              position: "relative",
              width: Math.min(hallWidthPx, 450),
              height: Math.min(hallHeightPx, 400),
              margin: "0 auto",
              backgroundColor: "#1a1f2e",
              borderRadius: "10px",
              border: "2px solid #2d3748",
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)"
            }}
          >
            {/* Занятые столы (серые) */}
            {unavailableTables.map(({ table, left, bottom, width, height, borderRadius }) => (
              <div
                key={table.id}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  backgroundColor: "rgb(97 17 17 / 91%)",
                  
                  border: "2px solid #475569",
                  borderRadius: borderRadius ? `${borderRadius}px` : "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "white",
                  zIndex: 5
                }}
              >
                <span style={{ 
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>{table.number}</span>
              </div>
            ))}

            {/* Доступные столы (интерактивные) */}
            {availableTables.map(({ table, left, bottom, width, height, borderRadius }) => (
              <button
                key={table.id}
                onClick={() => onTableSelect(table)}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  backgroundColor: "#2d3748",
                  border: "2px solid #4a5568",
                  borderRadius: borderRadius ? `${borderRadius}px` : "6px",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                  zIndex: 10,
                  boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4a5568";
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2d3748";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.2)";
                }}
              >
                <span style={{ 
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {table.number}
                </span>
              </button>
            ))}

            {/* Статические элементы зала */}
            <div style={{
              position: "absolute",
              left: "2%",
              bottom: "37%",
              width: "13%",
              height: "40%",
              backgroundColor: "rgba(26, 64, 102, 1)",
              border: "2px solid #4a5568",
              borderRadius: "6px",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              zIndex: 10
            }}>
              Бар
            </div>

            <div style={{
              position: "absolute",
              left: "65%",
              bottom: "25%",
              width: "33%",
              height: "40%",
              backgroundColor: "rgba(26, 64, 102, 1)",
              border: "2px solid #4a5568",
              borderRadius: "6px",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              zIndex: 10
            }}>
              
            </div>

            <div style={{
              position: "absolute",
              left: "35%",
              bottom: "90%",
              width: "30%",
              height: "19%",
              backgroundColor: "rgba(26, 64, 102, 1)",
              border: "2px solid #4a5568",
              borderRadius: "40px",
              color: "white",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              paddingBottom: "20px",
              zIndex: 10
            }}>
              Вход
            </div>

            <div style={{
              position: "absolute",
              left: "35%",
              top: "90%",
              width: "30%",
              height: "19%",
              backgroundColor: "rgba(26, 64, 102, 1)",
              border: "2px solid #4a5568",
              borderRadius: "40px",
              color: "white",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              paddingTop: "20px",
              zIndex: 10
            }}>
              Вход
            </div>

            {/* Сетка */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(to right, rgba(45, 55, 72, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(45, 55, 72, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%',
              pointerEvents: 'none'
            }}></div>
          </div>

          {/* Легенда */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            fontSize: "12px",
            color: "#cbd5e0",
            marginTop: "10px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#2d3748",
                border: "1px solid #4a5568",
                borderRadius: "4px"
              }}></div>
              <span>Свободные</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "16px",
                height: "16px",
                backgroundColor: "rgb(97 17 17 / 91%)",
                border: "1px solid #475569",
                borderRadius: "4px"
              }}></div>
              <span>Занятые</span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: "20px",
          textAlign: "center"
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: "10px 25px",
              borderRadius: "8px",
              border: "1px solid #475569",
              backgroundColor: "transparent",
              color: "#94a3b8",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.2)";
              e.currentTarget.style.color = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}