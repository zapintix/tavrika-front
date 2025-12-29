import { useEffect, useState, useCallback, useRef } from "react";
import TableSelectionModal from "./TableSelectionModal";
import ConfirmModal from "./ConfirmModal";
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
  
  const [selectedDateTime, setSelectedDateTime] = useState<{date: string, time: string}>(() => {
    const today = new Date().toISOString().split("T")[0];
    return { date: today, time: "12:00" };
  });
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservedTableIds, setReservedTableIds] = useState<Set<string>>(new Set());
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [timeError, setTimeError] = useState<string>("");
  
  const tgRef = useRef<TelegramWebApp | null>(null);

  const isTimeInPast = useCallback((date: string, time: string): boolean => {
    const now = new Date();
    const selectedDate = new Date(date);
    
    const [hours, minutes] = time.split(':').map(Number);
    
    selectedDate.setHours(hours, minutes, 0, 0);
    
    return selectedDate < now;
  }, []);

  const getMinTimeForToday = useCallback((): string => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 22) {
      return "12:00";
    }
    
    if (currentHour >= 12) {
      const nextHour = currentHour + 1;
      return `${nextHour.toString().padStart(2, "0")}:00`;
    }
    
    return "12:00";
  }, []);

  const availableTimes = useCallback(() => {
    const times: string[] = [];
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const isToday = selectedDateTime.date === today;
    
    for (let hour = 12; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      
      if (isToday) {
        if (hour < now.getHours()) {
          continue; 
        }
        if (hour === now.getHours() && now.getMinutes() > 0) {
          continue;
        }
      }
      
      times.push(timeString);
    }
    
    return times;
  }, [selectedDateTime.date]);

  const validateDateTime = useCallback((date: string, time: string): boolean => {
    setTimeError("");
    
    if (isTimeInPast(date, time)) {
      setTimeError("Выбранное время уже прошло. Пожалуйста, выберите актуальное время.");
      return false;
    }
    
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    
    if (date === today) {
      const minTime = getMinTimeForToday();
      const [minHour] = minTime.split(':').map(Number);
      const [selectedHour] = time.split(':').map(Number);
      
      if (selectedHour < minHour) {
        setTimeError(`Сегодня можно бронировать только с ${minTime}. Пожалуйста, выберите другое время.`);
        return false;
      }
    }
    
    return true;
  }, [isTimeInPast, getMinTimeForToday]);

  const loadMockData = useCallback(() => {
    const mockSections: Section[] = [
      {
        id: "f1398858-0f9f-4614-93fa-6f8d0f521dd3",
        name: "Зал",
        tables: [
          { id: "93f7b752-a44c-4923-bc75-c650c09aa956", number: 1, name: "", x: 460, y: 60, width: 130, height: 60 },
          { id: "0fa40dd0-dd85-4fc9-b8a0-41f891da1d76", number: 2, name: "", x: 410, y: 650, width: 100, height: 100 },
          { id: "371d6255-059b-4611-9316-1c2dd6e2165a", number: 3, name: "", x: 330, y: 370, width: 150, height: 60 },
          { id: "fce460f2-d709-4f57-9278-21ce7f836061", number: 4, name: "", x: 240, y: 370, width: 150, height: 60 },
          { id: "72195031-4ef0-4767-82b1-e11033adca0b", number: 5, name: "", x: 150, y: 370, width: 150, height: 60 },
          { id: "eccc804d-06e8-4bfe-9a97-6483182be68c", number: 6, name: "", x: 90, y: 640, width: 150, height: 60 },
          { id: "e912a2d8-9aa1-4f55-9bcc-9a99e912f4c8", number: 7, name: "", x: 10, y: 540, width: 150, height: 60 },
          { id: "41429a8a-a77c-4fcb-aab6-d0aaf54700e0", number: 8, name: "", x: 20, y: 20, width: 150, height: 60 },
          { id: "aa17f2fe-e890-4286-9e48-1827a7f81b0d", number: 9, name: "", x: 120, y: 130, width: 70, height: 50 },
          { id: "cf6bcd31-42ef-4d3c-b65c-a163ab032903", number: 10, name: "", x: 200, y: 130, width: 70, height: 50 },
          { id: "b046a8db-c90d-47f5-bf4b-5c6ddbda4445", number: 11, name: "", x: 280, y: 130, width: 70, height: 50 },
          { id: "51bdf14d-9ca5-42cf-9003-c39473701411", number: 12, name: "", x: 360, y: 130, width: 70, height: 50 },
          { id: "e4acfa77-2e48-4d6a-8930-e02e657b6d23", number: 13, name: "", x: 360, y: 20, width: 70, height: 50 }
        ]
      }
    ];
    
    setSections(mockSections);
    
    const allTables = mockSections.flatMap(section => section.tables);
    setFilteredTables(allTables);
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!selectedDateTime.date || !selectedDateTime.time) return;
    
    if (!validateDateTime(selectedDateTime.date, selectedDateTime.time)) {
      return;
    }

    const fetchReservedTables = async () => {
      try {
        const res = await fetch(`https://hgq64vxn-8000.euw.devtunnels.ms/api/reservations/table`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            date: selectedDateTime.date,
            time: selectedDateTime.time 
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
  }, [selectedDateTime.date, selectedDateTime.time, validateDateTime]);

  useEffect(() => {
    if (sections.length === 0) return;
    
    const allTables = sections.flatMap(section => section.tables);
    
    const availableTables = allTables.filter(table => 
      !reservedTableIds.has(table.id) && table.number < 100
    );
    
    console.log("Всего столов:", allTables.length);
    console.log("Занятые столы:", reservedTableIds.size);
    console.log("Доступные столы:", availableTables.length);
    
    setFilteredTables(availableTables);
  }, [sections, reservedTableIds]);

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

  const handleDateTimeChange = useCallback((date: string, time: string) => {
    // Проверяем валидность перед установкой
    if (validateDateTime(date, time)) {
      setSelectedDateTime({ date, time });
    } else {
      // Если время невалидно, все равно обновляем, но показываем ошибку
      setSelectedDateTime({ date, time });
    }
  }, [validateDateTime]);

  const handleSelectTableClick = useCallback(() => {
    if (filteredTables.length === 0) {
      alert("На выбранное время нет свободных столов. Пожалуйста, выберите другое время.");
      return;
    }
    
    // Дополнительная проверка перед открытием модалки
    if (!validateDateTime(selectedDateTime.date, selectedDateTime.time)) {
      return;
    }
    
    setShowTableModal(true);
  }, [filteredTables.length, selectedDateTime.date, selectedDateTime.time, validateDateTime]);

  const handleTableSelect = useCallback((table: Table) => {
    setSelectedTable(table);
    setShowTableModal(false);
    setShowConfirmModal(true);
  }, []);

  const handleReservationConfirm = useCallback(() => {
    if (!selectedTable || !selectedDateTime) return;
    
    // Финальная проверка перед отправкой
    if (!validateDateTime(selectedDateTime.date, selectedDateTime.time)) {
      setShowConfirmModal(false);
      return;
    }
    
    const tg = tgRef.current;
    setShowConfirmModal(false);

    if (!tg) {
      alert(`Бронь создана!\nСтол: ${selectedTable.number}\nВремя: ${selectedDateTime.time}\nДата: ${selectedDateTime.date}`);
      return;
    }

    // Формируем полные данные для отправки
    const fullData = {
      action: "create_reservation",
      tableId: selectedTable.id,         
      tableNumber: selectedTable.number, 
      time: selectedDateTime.time,
      date: selectedDateTime.date,
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
  }, [selectedTable, selectedDateTime, validateDateTime]);

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

  return (
    <div style={{ 
      background: "#0d1117", 
      color: "#fff",
      padding: "20px 20px 0px 20px",
      minHeight: "100vh"
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
        <div style={{ marginBottom: "25px" }}>
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
            value={selectedDateTime.date}
            onChange={(e) => {
              const newDate = e.target.value;
              // При смене даты автоматически проверяем время
              const isValid = validateDateTime(newDate, selectedDateTime.time);
              if (!isValid) {
                // Если время невалидно для новой даты, сбрасываем на первое доступное
                const today = new Date().toISOString().split("T")[0];
                const isToday = newDate === today;
                
                if (isToday) {
                  const minTime = getMinTimeForToday();
                  setSelectedDateTime({ date: newDate, time: minTime });
                } else {
                  setSelectedDateTime({ date: newDate, time: "12:00" });
                }
              } else {
                setSelectedDateTime({ date: newDate, time: selectedDateTime.time });
              }
            }}
            min={new Date().toISOString().split("T")[0]}
            style={{
              width: "95%", 
              padding: "12px 10px", 
              borderRadius: "10px",
              border: timeError ? "1px solid #ef4444" : "1px solid #475569", 
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
            Время
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
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            maxHeight: "220px",
            paddingRight: "5px",
            paddingBottom: "25px",
          }}>
            {availableTimes().map((t) => {
              const isSelected = selectedDateTime.time === t;
              const isPast = isTimeInPast(selectedDateTime.date, t);
              
              return (
                <button
                  key={t}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateTimeChange(selectedDateTime.date, t)}
                  style={{
                    padding: "14px 10px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid #3b82f6" : "1px solid #475569",
                    background: isPast ? "rgba(100, 116, 139, 0.2)" : 
                              isSelected ? "rgba(59,130,246,0.1)" : "transparent",
                    color: isPast ? "#64748b" : 
                          isSelected ? "#3b82f6" : "#94a3b8",
                    cursor: isPast ? "not-allowed" : "pointer",
                    fontSize: "15px",
                    transition: "all 0.2s",
                    fontWeight: isSelected ? "600" : "400",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    if (!isPast && !isSelected) {
                      e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.2)";
                      e.currentTarget.style.color = "#cbd5e1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPast && !isSelected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  {t}
                  {isPast && (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}></div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Подсказка о доступном времени */}
          <div style={{
            marginTop: "-15px",
            fontSize: "12px",
            color: "#64748b",
            textAlign: "center"
          }}>
            {(() => {
              const today = new Date().toISOString().split("T")[0];
              const isToday = selectedDateTime.date === today;
              
              if (isToday) {
                const minTime = getMinTimeForToday();
                return `Сегодня можно бронировать с ${minTime}`;
              }
              return "Рабочее время: с 12:00 до 22:00";
            })()}
          </div>
        </div>

        {/* Информация о доступности */}
        <div style={{
          marginBottom: "25px",
          padding: "12px 16px",
          backgroundColor: reservedTableIds.size > 0 ? "rgba(30, 41, 59, 0.5)" : "rgba(30, 41, 59, 0.5)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)",
          opacity: timeError ? 0.5 : 1
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px"
          }}>
            <span style={{ color: "#cbd5e1", fontSize: "14px" }}>Свободных столов:</span>
            <span style={{ 
              color: timeError ? "#94a3b8" : 
                     filteredTables.length > 0 ? "#10b981" : "#ef4444",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              {timeError ? "—" : filteredTables.length}
            </span>
          </div>
          <div style={{ 
            color: timeError ? "#64748b" : "#94a3b8", 
            fontSize: "12px" 
          }}>
            {timeError ? "Выберите актуальное время" : 
             filteredTables.length > 0 
              ? `На ${selectedDateTime.time} доступно ${filteredTables.length} столов`
              : `На ${selectedDateTime.time} все столы заняты`}
          </div>
        </div>

        {/* Кнопка выбора стола */}
        <div style={{ textAlign: "center" }}>
          <button 
            onClick={handleSelectTableClick}
            disabled={filteredTables.length === 0 || !!timeError}
            style={{
              padding: "16px 40px",
              borderRadius: "12px",
              border: "none",
              background: timeError ? "linear-gradient(135deg, #475569, #334155)" :
                       filteredTables.length === 0 
                ? "linear-gradient(135deg, #475569, #334155)" 
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: (filteredTables.length === 0 || timeError) ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              width: "100%",
              maxWidth: "300px",
              opacity: (filteredTables.length === 0 || timeError) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (filteredTables.length > 0 && !timeError) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (filteredTables.length > 0 && !timeError) {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {timeError ? "Выберите актуальное время" :
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

      {showConfirmModal && selectedTable && selectedDateTime && (
        <ConfirmModal
          tableNumber={selectedTable.number}
          date={selectedDateTime.date}
          time={selectedDateTime.time}
          onConfirm={handleReservationConfirm}
          onClose={handleConfirmClose}
        />
      )}
    </div>
  );
}

export default App;