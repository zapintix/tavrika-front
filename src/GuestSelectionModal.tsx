import { useState } from "react";
import { getGuestLimits } from "./utils/TableCapacity";

interface GuestModalProps {
  tableNumber: number;
  onConfirm: (count: number) => void;
  onClose: () => void;
}

export default function GuestSelectionModal({
  tableNumber,
  onConfirm,
  onClose
}: GuestModalProps) {
  const { min, max } = getGuestLimits(tableNumber);
  const [count, setCount] = useState(min);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

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
        padding: "20px"
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #1e293b, #0f172a)",
          borderRadius: "16px",
          padding: "30px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          paddingBottom: "15px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h3 style={{ margin: 0, fontSize: "22px", color: "#fff" }}>
            Количество гостей
          </h3>
          <button 
            onClick={onClose} 
            style={{
              background: "none", 
              border: "none", 
              color: "#94a3b8",
              fontSize: "24px", 
              cursor: "pointer", 
              padding: "5px 10px", 
              borderRadius: "8px",
              transition: "all 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.color="#fff"}
            onMouseOut={e => e.currentTarget.style.color="#94a3b8"}
          >
            ✕
          </button>
        </div>

        <div style={{ 
          textAlign: "center", 
          marginBottom: "30px" 
        }}>
          <div style={{ 
            fontSize: "16px", 
            color: "#cbd5e1", 
            marginBottom: "5px" 
          }}>
            Стол №{tableNumber}
          </div>
          <div style={{ 
            fontSize: "14px", 
            color: "#94a3b8", 
            marginBottom: "25px" 
          }}>
            Выберите количество гостей (от {min} до {max})
          </div>

          {/* Отображение текущего количества */}
          <div style={{
            fontSize: "48px",
            color: "#3b82f6",
            fontWeight: "bold",
            marginBottom: "20px",
            minHeight: "60px"
          }}>
            {count}
            <div style={{
              fontSize: "16px",
              color: "#94a3b8",
              marginTop: "5px"
            }}>
              {count === 1 ? "гость" : 
               count >= 2 && count <= 4 ? "гостя" : 
               "гостей"}
            </div>
          </div>

          {/* Ползунок */}
          <div style={{ padding: "0 10px" }}>
            <input
              type="range"
              min={min}
              max={max}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              style={{
                width: "100%",
                height: "6px",
                WebkitAppearance: "none",
                appearance: "none",
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((count - min) / (max - min)) * 100}%, #475569 ${((count - min) / (max - min)) * 100}%, #475569 100%)`,
                borderRadius: "10px",
                outline: "none",
                margin: "15px 0"
              }}
            />
            
            {/* Деления на ползунке */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 5px",
              marginTop: "5px"
            }}>
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <div 
                  key={value}
                  style={{
                    width: "1px",
                    height: value % 2 === 0 ? "12px" : "8px",
                    backgroundColor: "#64748b",
                    position: "relative"
                  }}
                >
                  {value % 2 === 0 && (
                    <span style={{
                      position: "absolute",
                      top: "15px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "12px",
                      color: "#94a3b8",
                      minWidth: "20px"
                    }}>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки + и - */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "20px",
            marginTop: "25px" 
          }}>
            <button
              type="button"
              disabled={count <= min}
              onClick={() => setCount(c => Math.max(min, c - 1))}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                border: "1px solid #475569",
                backgroundColor: count <= min ? "#1e293b" : "transparent",
                color: count <= min ? "#64748b" : "#94a3b8",
                fontSize: "28px",
                cursor: count <= min ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                if (count > min) {
                  e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.2)";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
              onMouseLeave={(e) => {
                if (count > min) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              −
            </button>

            <button
              type="button"
              disabled={count >= max}
              onClick={() => setCount(c => Math.min(max, c + 1))}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                border: "1px solid #475569",
                backgroundColor: count >= max ? "#1e293b" : "transparent",
                color: count >= max ? "#64748b" : "#94a3b8",
                fontSize: "24px",
                cursor: count >= max ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                if (count < max) {
                  e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.2)";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
              onMouseLeave={(e) => {
                if (count < max) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Кнопки действий */}
        <div style={{ display: "flex", gap: "15px" }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{
              flex: 1, 
              padding: "16px", 
              borderRadius: "10px", 
              border: "1px solid #475569",
              backgroundColor: "transparent", 
              color: "#94a3b8", 
              fontSize: "16px", 
              fontWeight: "500", 
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Назад
          </button>
          <button 
            type="button" 
            onClick={() => onConfirm(count)}
            style={{
              flex: 1, 
              padding: "16px", 
              borderRadius: "10px", 
              border: "none",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", 
              color: "#fff", 
              fontSize: "16px", 
              fontWeight: "600", 
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Далее
          </button>
        </div>

        <div style={{
          marginTop: "20px", 
          paddingTop: "15px", 
          borderTop: "1px solid rgba(255,255,255,0.1)",
          color: "#64748b", 
          fontSize: "12px", 
          textAlign: "center"
        }}>
          * Указанное количество гостей можно будет изменить при подтверждении брони
        </div>
      </div>
    </div>
  );
}