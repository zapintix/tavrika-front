import React, { useState } from 'react';

interface GuestInfoFormProps {
  onSubmit: (name: string, phone: string) => void;
  onBack: () => void;
}

const GuestInfoForm: React.FC<GuestInfoFormProps> = ({ onSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Введите имя';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^[\d+\-\s()]{10,}$/.test(phone.trim())) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(name.trim(), phone.trim());
    }
  };

  return (
    <div style={{ 
      background: "linear-gradient(145deg, #1e293b, #0f172a)",
      borderRadius: "16px",
      padding: "30px 20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.1)",
      maxWidth: "400px",
      margin: "0 auto",
      width: "90%"
    }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          fontSize: "14px",
          cursor: "pointer",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}
      >
        ← Назад
      </button>

      <h2 style={{ 
        marginTop: "0", 
        marginBottom: "20px", 
        fontSize: "22px", 
        color: "#fff",
        textAlign: "center"
      }}>
        Данные гостя
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ 
          display: "block", 
          marginBottom: "8px", 
          color: "#cbd5e1", 
          fontSize: "14px", 
          fontWeight: "500" 
        }}>
          Имя *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите имя гостя"
          style={{
            padding: "12px 10px",
            borderRadius: "10px",
            border: `1px solid ${errors.name ? '#ef4444' : '#475569'}`,
            backgroundColor: "#1e293b",
            color: "#fff",
            fontSize: "16px",
            outline: "none",
            width: "100%",
            boxSizing: "border-box"
          }}
        />
        {errors.name && (
          <div style={{ color: "#f87171", fontSize: "12px", marginTop: "5px" }}>
            {errors.name}
          </div>
        )}
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label style={{ 
          display: "block", 
          marginBottom: "8px", 
          color: "#cbd5e1", 
          fontSize: "14px", 
          fontWeight: "500" 
        }}>
          Номер телефона *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (XXX) XXX-XX-XX"
          style={{
            padding: "12px 10px",
            borderRadius: "10px",
            border: `1px solid ${errors.phone ? '#ef4444' : '#475569'}`,
            backgroundColor: "#1e293b",
            color: "#fff",
            fontSize: "16px",
            outline: "none",
            width: "100%",
            boxSizing: "border-box"
          }}
        />
        {errors.phone && (
          <div style={{ color: "#f87171", fontSize: "12px", marginTop: "5px" }}>
            {errors.phone}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          padding: "14px 20px",
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
        Продолжить
      </button>
    </div>
  );
};

export default GuestInfoForm;
