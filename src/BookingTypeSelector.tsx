import React from 'react';

interface BookingTypeSelectorProps {
  onSelect: (type: 'self' | 'other') => void;
}

const BookingTypeSelector: React.FC<BookingTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div style={{ 
      background: "linear-gradient(145deg, #1e293b, #0f172a)",
      borderRadius: "16px",
      padding: "30px 20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.1)",
      maxWidth: "400px",
      margin: "0 auto",
      width: "80%",
      textAlign: "center"
    }}>
      <h2 style={{ 
        marginTop: "0", 
        marginBottom: "20px", 
        fontSize: "24px", 
        color: "#fff"
      }}>
        Бронирование стола
      </h2>
      
      <p style={{ 
        color: "#cbd5e1", 
        marginBottom: "30px",
        fontSize: "14px"
      }}>
        Выберите, для кого будет бронь
      </p>

      <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
        <button
          onClick={() => onSelect('self')}
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            width: "100%"
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
          📱 На себя
        </button>

        <button
          onClick={() => onSelect('other')}
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid #475569",
            background: "transparent",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            width: "100%"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
            e.currentTarget.style.borderColor = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "#475569";
          }}
        >
          👤 На другого человека
        </button>
      </div>
    </div>
  );
};

export default BookingTypeSelector;