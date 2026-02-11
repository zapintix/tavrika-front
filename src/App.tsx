import { useEffect, useState, useCallback, useRef } from "react";
import TableSelectionModal from "./TableSelectionModal";
import ConfirmModal from "./ConfirmModal";
import GuestSelectionModal from "./GuestSelectionModal";
import type { Table, Section } from "./types/table";

interface TelegramWebApp {
  ready: () => void;
  sendData: (data: string) => void;
  close: () => void;
  expand?: () => void;
  onEvent?: (event: string, handler: () => void) => void;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    query_id?: string;
    [key: string]: unknown;
  };
}

function App() {
  const [sections, setSections] = useState<Section[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);

  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0]; // Сегодняшняя дата
  });
  const [selectedTime, setSelectedTime] = useState<string>(""); // Время не выбрано
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservedTableIds, setReservedTableIds] = useState<Set<string>>(new Set());
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [timeError, setTimeError] = useState<string>("");
  
  const tgRef = useRef<TelegramWebApp | null>(null);

  const isTimeInPast = useCallback((date: string, time: string): boolean => {
    const now = new Date();
    const selectedDateObj = new Date(date);
    
    const [hours, minutes] = time.split(':').map(Number);
    
    selectedDateObj.setHours(hours, minutes, 0, 0);
    
    return selectedDateObj < now;
  }, []);

  const getMinTimeForToday = useCallback((): string => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  
  // Минимальный час в зависимости от дня недели
  const startHour = isWeekend ? 10 : 11;
  const endHour = isWeekend ? 21 : 22;
  
  // Если текущий час меньше времени открытия
  if (currentHour < startHour) {
    return `${startHour.toString().padStart(2, "0")}:00`;
  }
  
  // Если уже позже времени закрытия
  if (currentHour >= endHour) {
    return "завтра";
  }
  
  // Если текущий час доступен для бронирования, минимальное время - текущий час + 1 минута
  const nextMinute = currentMinute + 1;
  if (nextMinute < 60) {
    return `${currentHour.toString().padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`;
  } else {
    // Если следующая минута переходит на следующий час
    const nextHour = currentHour + 1;
    if (nextHour <= endHour) {
      return `${nextHour.toString().padStart(2, "0")}:00`;
    } else {
      return "завтра";
    }
  }
}, []);

  

  const getAvailableMinutes = useCallback((date: string, hour: number): number[] => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const isToday = date === today;
    
    const minutes = [];
    
    if (isToday && hour === now.getHours()) {
      // Если выбрали текущий час, показываем только минуты от текущей+1 до 59
      for (let minute = 0; minute <= 59; minute++) {
        if (minute > now.getMinutes()) {
          minutes.push(minute);
        }
      }
    } else {
      // Для других часов показываем все минуты от 00 до 59
      for (let minute = 0; minute <= 59; minute++) {
        minutes.push(minute);
      }
    }
    
    return minutes;
  }, []);

  const getAvailableHours = useCallback((date: string): number[] => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const isToday = date === today;
  const dateObj = new Date(date); 
  const day = dateObj.getDay();
  const isWeekend = day === 0 || day === 6;

  const hours: number[] = [];

  let startHour = isWeekend ? 10 : 11;
  let endHour = isWeekend ? 21 : 22;

  for (let hour = startHour; hour < endHour; hour++) {
    if (isToday) {
      if (hour < now.getHours()) {
        continue; 
      }
      // Для текущего часа нужно проверить, есть ли доступные минуты
      if (hour === now.getHours()) {
        const availableMinutes = getAvailableMinutes(date, hour);
        if (availableMinutes.length === 0) {
          continue; // Если нет доступных минут для этого часа, пропускаем его
        }
      }
    }
    hours.push(hour);
  }
  
  return hours;
}, [getAvailableMinutes]);

  const validateTime = useCallback((date: string, time: string): boolean => {
    setTimeError("");
    
    if (!time) {
      return false; 
    }
    
    if (isTimeInPast(date, time)) {
      setTimeError("Выбранное время уже прошло. Пожалуйста, выберите актуальное время.");
      return false;
    }
    
    return true;
  }, [isTimeInPast, getMinTimeForToday]);

  const loadMockData = useCallback(() => {
    const mockSections: Section[] = [
      {
        id: "f1398858-0f9f-4614-93fa-6f8d0f521dd3",
        name: "Зал",
        tables: [
          { id: "93f7b752-a44c-4923-bc75-c650c09aa956", number: 1, name: "", x: 460, y: 60, width: 130, height: 60, borderRadius : 0},
          { id: "0fa40dd0-dd85-4fc9-b8a0-41f891da1d76", number: 2, name: "", x: 410, y: 650, width: 100, height: 100, borderRadius : 0 },
          { id: "371d6255-059b-4611-9316-1c2dd6e2165a", number: 3, name: "", x: 330, y: 370, width: 150, height: 60, borderRadius : 0 },
          { id: "fce460f2-d709-4f57-9278-21ce7f836061", number: 4, name: "", x: 240, y: 370, width: 150, height: 60, borderRadius : 0 },
          { id: "72195031-4ef0-4767-82b1-e11033adca0b", number: 5, name: "", x: 150, y: 370, width: 150, height: 60, borderRadius : 0 },
          { id: "eccc804d-06e8-4bfe-9a97-6483182be68c", number: 6, name: "", x: 90, y: 640, width: 150, height: 60, borderRadius : 0 },
          { id: "e912a2d8-9aa1-4f55-9bcc-9a99e912f4c8", number: 7, name: "", x: 10, y: 540, width: 150, height: 60, borderRadius : 0 },
          { id: "41429a8a-a77c-4fcb-aab6-d0aaf54700e0", number: 8, name: "", x: 20, y: 20, width: 150, height: 60, borderRadius : 0 },
          { id: "aa17f2fe-e890-4286-9e48-1827a7f81b0d", number: 9, name: "", x: 120, y: 130, width: 70, height: 50, borderRadius : 0 },
          { id: "cf6bcd31-42ef-4d3c-b65c-a163ab032903", number: 10, name: "", x: 200, y: 130, width: 70, height: 50, borderRadius : 0 },
          { id: "b046a8db-c90d-47f5-bf4b-5c6ddbda4445", number: 11, name: "", x: 280, y: 130, width: 70, height: 50, borderRadius : 0 },
          { id: "51bdf14d-9ca5-42cf-9003-c39473701411", number: 12, name: "", x: 360, y: 130, width: 70, height: 50, borderRadius : 0 },
          { id: "e4acfa77-2e48-4d6a-8930-e02e657b6d23", number: 13, name: "", x: 360, y: 20, width: 70, height: 50, borderRadius : 0 }
        ]
      }
    ];
    
    setSections(mockSections);
    
    const allTables = mockSections.flatMap(section => section.tables);
    setFilteredTables(allTables);
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!selectedTime) {
      // Если время не выбрано, очищаем список занятых столов
      setReservedTableIds(new Set());
      return;
    }
    
    if (!validateTime(selectedDate, selectedTime)) {
      return;
    }

    const fetchReservedTables = async () => {
      try {
        const res = await fetch('http://10.10.36.35:8103/api/reservations/table', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            date: selectedDate,
            time: selectedTime 
          })
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Ответ от сервера (занятые столы):", data);
        
        const reservedIds = data.reservedTableIds || [];
        console.log("Занятые ID столов:", reservedIds);
        
        setReservedTableIds(new Set(reservedIds));
        
      } catch (error) {
        console.error("Ошибка загрузки занятых столов:", error);
        setReservedTableIds(new Set());
      }
    };

    fetchReservedTables();
  }, [selectedDate, selectedTime, validateTime]);

  useEffect(() => {
    if (sections.length === 0) return;
    
    const allTables = sections.flatMap(section => section.tables);
    
    // Если время не выбрано, показываем все столы (без фильтрации)
    const availableTables = selectedTime 
      ? allTables.filter(table => 
          !reservedTableIds.has(table.id) && table.number < 100
        )
      : allTables; // Показываем все столы, когда время не выбрано
    
    console.log("Всего столов:", allTables.length);
    console.log("Занятые столы:", reservedTableIds.size);
    console.log("Доступные столы:", availableTables.length);
    
    setFilteredTables(availableTables);
  }, [sections, reservedTableIds, selectedTime]);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      const tg = window.Telegram?.WebApp;
      
      if (!tg) {
        console.log("Режим разработки - Telegram не найден");
        if (mounted) {
          loadMockData();
        }
        return;
      }

      tgRef.current = tg;
      
      if (tg.expand) {
        tg.expand();
      }
      
      tg.ready();

      // Получаем данные из URL параметров
      const urlParams = new URLSearchParams(window.location.search);
      const tablesParam = urlParams.get("tables");

      if (tablesParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(tablesParam));
          if (Array.isArray(parsed) && mounted) {
            setTimeout(() => {
              if (mounted) {
                setSections(parsed);
                
                // Собираем все таблицы из всех секций
                const allTables = parsed.flatMap(section => section.tables);
                setFilteredTables(allTables);
                
                setIsLoading(false);
              }
            }, 0);
          } else if (mounted) {
            loadMockData();
          }
        } catch (e) {
          console.error("Ошибка парсинга данных столов:", e);
          if (mounted) {
            loadMockData();
          }
        }
      } else if (mounted) {
        loadMockData();
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [loadMockData]);

  const handleDateChange = useCallback((newDate: string) => {
    setSelectedDate(newDate);
    
    // Если время было выбрано, проверяем его валидность для новой даты
    if (selectedTime) {
      validateTime(newDate, selectedTime);
    } else {
      // Если время не выбрано, очищаем ошибку
      setTimeError("");
    }
  }, [selectedTime, validateTime]);

  const handleGuestConfirm = useCallback((count: number) => {
    setGuestCount(count);
    setShowGuestModal(false);
    setShowConfirmModal(true);
  }, []);

  // Функция для выбора времени (часа и минуты)
  const handleTimeSelect = useCallback((hour: number, minute: number) => {
    const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    setSelectedTime(timeString);
    validateTime(selectedDate, timeString);
  }, [selectedDate, validateTime]);

  const handleSelectTableClick = useCallback(() => {
    if (!selectedTime) {
      alert("Пожалуйста, выберите время бронирования.");
      return;
    }
    
    if (!validateTime(selectedDate, selectedTime)) {
      return;
    }
    
    if (filteredTables.length === 0) {
      alert("На выбранное время нет свободных столов. Пожалуйста, выберите другое время.");
      return;
    }
    
    setShowTableModal(true);
  }, [selectedTime, selectedDate, filteredTables.length, validateTime]);

  const handleTableSelect = useCallback((table: Table) => {
    setSelectedTable(table);
    setShowTableModal(false);
    setGuestCount(null);
    setShowGuestModal(true);
  }, []);


  const handleReservationConfirm = useCallback(() => {
    if (!selectedTable || !selectedTime || guestCount == null) return;
    
    // Финальная проверка перед отправкой
    if (!validateTime(selectedDate, selectedTime)) {
      setShowConfirmModal(false);
      return;
    }
    
    const tg = tgRef.current;
    setShowConfirmModal(false);

    if (!tg) {
      alert(`Бронь создана!\nСтол: ${selectedTable.number}\nВремя: ${selectedTime}\nДата: ${selectedDate}`);
      return;
    }

    // Формируем полные данные для отправки
    const fullData = {
      action: "create_reservation",
      tableId: selectedTable.id,         
      tableNumber: selectedTable.number,
      guests: guestCount, 
      time: selectedTime,
      date: selectedDate,
      userId: tg.initDataUnsafe?.user?.id,
      userName: tg.initDataUnsafe?.user?.first_name 
                || tg.initDataUnsafe?.user?.username,
      timestamp: new Date().toISOString()
    };

    console.log("Отправка данных брони:", fullData);
    
    try {
      tg.sendData(JSON.stringify(fullData));
      
      // Показываем сообщение об успехе
      setTimeout(() => {
        alert(`✅ Бронь стола №${selectedTable.number} подтверждена!\nПриложение закроется через 2 секунды.`);
        
        setTimeout(() => {
          tg.close();
        }, 2000);
      }, 500);
      
    } catch (error) {
      console.error("Ошибка отправки данных:", error);
      alert("Ошибка отправки данных бронирования.");
    }
  }, [selectedTable, selectedDate, selectedTime, guestCount, validateTime]);

  const handleTableModalClose = useCallback(() => {
    setShowTableModal(false);
  }, []);

  const handleConfirmClose = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        background: "#0d1117", 
        minHeight: "100vh", 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff" 
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const availableHours = getAvailableHours(selectedDate);
  const currentHour = selectedTime ? parseInt(selectedTime.split(':')[0]) : null;
  const availableMinutes = currentHour ? getAvailableMinutes(selectedDate, currentHour) : Array.from({ length: 60 }, (_, i) => i);

  return (
    <div style={{ 
      background: "#0d1117", 
      color: "#fff",
      padding: "20px 20px 0px 20px",
      minHeight: "100vh",
      boxSizing: "border-box"
    }}>
      <div style={{
        background: "linear-gradient(145deg, #1e293b, #0f172a)",
        borderRadius: "16px",
        padding: "15px",
        marginBottom: "30px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
        maxWidth: "600px",
        minHeight: "593px",
        margin: "0 auto",
        width: "90%"
      }}>
        <h2 style={{ 
          marginTop: "0", 
          marginBottom: "25px", 
          fontSize: "22px", 
          color: "#fff",
          textAlign: "center"
        }}>
          Выберите дату и время
        </h2>

        {/* Выбор даты */}
        <div style={{ marginBottom: "25px", display: "flex", flexDirection: "column"}}>
          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            color: "#cbd5e1", 
            fontSize: "14px", 
            fontWeight: "500"
          }}>
            Дата
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={today}
            style={{
              padding: "12px 10px", 
              borderRadius: "10px",
              border: "1px solid #475569", 
              backgroundColor: "#1e293b", 
              color: "#fff", 
              fontSize: "16px", 
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Выбор времени */}
        <div style={{ marginBottom: "30px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            color: "#cbd5e1", 
            fontSize: "14px", 
            fontWeight: "500" 
          }}>
            Время {selectedDate && `(${selectedDate})`}
          </label>
          
          {/* Сообщение об ошибке времени */}
          {timeError && (
            <div style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "15px",
              color: "#f87171",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <span>{timeError}</span>
            </div>
          )}
          
          {/* Двойной пикер для часов и минут */}
          <div style={{
            display: "flex",
            alignItems: "center",
            borderRadius: "10px",
            border: "1px solid #475569", 
            padding: "15px 0",
            marginBottom: "10px"
          }}>
            {/* Часы */}
            <div style={{
              flex: 1,
              textAlign: "center",
              borderRight: "1px solid #334155"
            }}>
              <div style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "10px"
              }}>
                Часы
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxHeight: "120px",
                overflowY: "auto",
              }}>
                {availableHours.map(hour => {
                  const [currentHour] = selectedTime.split(':').map(Number);
                  const isSelected = currentHour === hour;
                  
                  return (
                    <div
                      key={hour}
                      onClick={() => {
                        const minute = selectedTime ? parseInt(selectedTime.split(':')[1]) : 0;
                        // Проверяем, доступна ли выбранная минута для этого часа
                        const minutesForThisHour = getAvailableMinutes(selectedDate, hour);
                        const validMinute = minutesForThisHour.includes(minute) ? minute : (minutesForThisHour.length > 0 ? minutesForThisHour[0] : 0);
                        handleTimeSelect(hour, validMinute);
                      }}
                      style={{
                        width: "50px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        fontSize: "18px",
                        fontWeight: isSelected ? "600" : "400",
                        color: isSelected ? "#3b82f6" : "#94a3b8",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        backgroundColor: isSelected ? "rgba(59, 130, 246, 0.1)" : "transparent",
                        border: isSelected ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                        minHeight: "40px"
                      }}
                    >
                      {hour.toString().padStart(2, "0")}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Двоеточие */}
            <div style={{
              fontSize: "20px",
              color: "#3b82f6",
              fontWeight: "600",
              padding: "0 10px"
            }}>
              :
            </div>

            {/* Минуты */}
            <div style={{
              flex: 1,
              textAlign: "center",
              borderLeft: "1px solid #334155"
            }}>
              <div style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "10px"
              }}>
                Минуты
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0px",
                maxHeight: "120px",
                overflowY: "auto",
                paddingLeft: "5px"
              }}>
                {availableMinutes.map(minute => {
                  const [, currentMinute] = selectedTime.split(':').map(Number);
                  const isSelected = currentMinute === minute;
                  
                  return (
                    <div
                      key={minute}
                      onClick={() => {
                        const hour = selectedTime ? parseInt(selectedTime.split(':')[0]) : (availableHours.length > 0 ? availableHours[0] : 12);
                        handleTimeSelect(hour, minute);
                      }}
                      style={{
                        width: "50px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        fontSize: "18px",
                        fontWeight: isSelected ? "600" : "400",
                        color: isSelected ? "#3b82f6" : "#94a3b8",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        backgroundColor: isSelected ? "rgba(59, 130, 246, 0.1)" : "transparent",
                        border: isSelected ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                        minHeight: "40px"
                      }}
                    >
                      {minute.toString().padStart(2, "0")}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Скрытие стандартного скролла для WebKit браузеров */}
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          
          {/* Подсказка о доступном времени */}
          <div style={{
            marginTop: "5px",
            fontSize: "12px",
            color: "#64748b",
            textAlign: "center"
          }}>
            {(() => {
              const date = new Date(selectedDate)
              const day = date.getDay();
              const isWeekend = day === 0 || day === 6;

              if (isWeekend){
                return "Рабочее время: с 10:00 до 21:00";
              }
              
              return "Рабочее время: с 11:00 до 22:00";
            })()}
          </div>
        </div>

        {/* Информация о доступности */}
        <div style={{
          marginBottom: "25px",
          padding: "12px 16px",
          backgroundColor: "rgba(30, 41, 59, 0.5)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)",
          opacity: selectedTime ? 1 : 0.7
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}>
            <span style={{ color: "#cbd5e1", fontSize: "14px" }}>Свободных столов:</span>
            <span style={{ 
              color: !selectedTime ? "#94a3b8" :
                     timeError ? "#94a3b8" : 
                     filteredTables.length > 0 ? "#10b981" : "#ef4444",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              {!selectedTime ? "—" :
               timeError ? "—" : filteredTables.length}
            </span>
          </div>
          <div style={{ 
            color: !selectedTime ? "#64748b" : 
                   timeError ? "#64748b" : "#94a3b8", 
            fontSize: "12px" 
          }}>
            {!selectedTime ? "Выберите время для просмотра доступности" :
             timeError ? "Выберите актуальное время" : 
             filteredTables.length > 0 
              ? `На ${selectedTime} доступно ${filteredTables.length} столов`
              : `На ${selectedTime} все столы заняты`}
          </div>
        </div>

        {/* Кнопка выбора стола */}
        <div style={{ textAlign: "center" }}>
          <button 
            onClick={handleSelectTableClick}
            disabled={!selectedTime || filteredTables.length === 0 || !!timeError}
            style={{
              padding: "16px 40px",
              borderRadius: "12px",
              border: "none",
              background: !selectedTime ? "linear-gradient(135deg, #475569, #334155)" :
                       timeError ? "linear-gradient(135deg, #475569, #334155)" :
                       filteredTables.length === 0 
                ? "linear-gradient(135deg, #475569, #334155)" 
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: (!selectedTime || filteredTables.length === 0 || timeError) 
                ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              width: "100%",
              maxWidth: "300px",
              opacity: (!selectedTime || filteredTables.length === 0 || timeError) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (selectedTime && filteredTables.length > 0 && !timeError) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTime && filteredTables.length > 0 && !timeError) {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {!selectedTime ? "Выберите время" :
             timeError ? "Выберите актуальное время" :
             filteredTables.length === 0 ? "Нет свободных столов" : "Выбрать стол"}
          </button>
        </div>
      </div>

      {showTableModal && (
        <TableSelectionModal
          sections={sections}
          filteredTableIds={filteredTables.map(t => t.id)}
          onTableSelect={handleTableSelect}
          onClose={handleTableModalClose}
        />
      )}

      {showConfirmModal && selectedTable && selectedTime && guestCount && (
      <ConfirmModal
        tableNumber={selectedTable.number}
        date={selectedDate}
        time={selectedTime}
        guests={guestCount}
        onConfirm={handleReservationConfirm}
        onClose={handleConfirmClose}
      />
    )}

    {showGuestModal && selectedTable && (
    <GuestSelectionModal
      tableNumber={selectedTable.number}
      onConfirm={handleGuestConfirm}
      onClose={() => setShowGuestModal(false)}
    />
  )}
    </div>
  );
}

export default App;