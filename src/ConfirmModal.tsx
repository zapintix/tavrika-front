interface ConfirmModalProps {
  tableNumber: number;
  date: string;
  time: string;
  guests: number;
  onConfirm: () => void;
  onClose: () => void;
}


export default function ConfirmModal({ tableNumber, guests, date, time, onConfirm, onClose }: ConfirmModalProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
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
            Подтверждение брони
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#94a3b8",
            fontSize: "24px", cursor: "pointer", padding: "5px 10px", borderRadius: "8px",
            transition: "all 0.2s"
          }}
            onMouseOver={e => e.currentTarget.style.color="#fff"}
            onMouseOut={e => e.currentTarget.style.color="#94a3b8"}
          >✕</button>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <div style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "rgba(30, 41, 59, 0.5)",
            borderRadius: "10px",
            marginBottom: "20px"
          }}>
            <div style={{ fontSize: "48px", color: "#3b82f6", marginBottom: "10px" }}>
              Стол №{tableNumber}
            </div>
            <div style={{ fontSize: "18px", color: "#cbd5e1", marginBottom: "5px" }}>
              Кол-во гостей: {guests}
            </div>
            <div style={{ fontSize: "18px", color: "#cbd5e1", marginBottom: "5px" }}>
              {date}
            </div>
            <div style={{ fontSize: "18px", color: "#cbd5e1" }}>
              {time}
            </div>
          </div>

          <div style={{ 
            color: "#94a3b8", 
            fontSize: "14px", 
            textAlign: "center",
            lineHeight: "1.5" 
          }}>
            Вы уверены, что хотите забронировать стол №{tableNumber} на {date} в {time}?
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
          <button 
            type="button" 
            onClick={onConfirm}
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
            Забронировать
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
          Бронь будет подтверждена после согласования с администратором
        </div>
      </div>
    </div>
  );
}