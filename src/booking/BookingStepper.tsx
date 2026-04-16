import { useEffect, useMemo, useState } from "react";
import type { Section, Table } from "../types/table";
import { getDefaultGues } from "../utils/DefaultUser";
import { getGuestLimits } from "../utils/TableCapacity";
import "../booking-stepper.css";
import { MOCK_SECTIONS, STEPS } from "./constants";
import { ProgressSteps } from "./components/ProgressSteps";
//import { SummarySidebar } from "./components/SummarySidebar";
import { BookingTypeStep } from "./steps/BookingTypeStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { DateTimeStep } from "./steps/DateTimeStep";
import { GuestCountStep } from "./steps/GuestCountStep";
import { TableStep } from "./steps/TableStep";
import type { BookingType, GuestInfo, GuestInfoErrors } from "./types";
import {
  formatTime,
  getAvailableHours,
  getAvailableMinutes,
  getBookingTypeLabel,
  getLocalDateValue,
  getTimeSelectionError,
  validateGuestInfo,
} from "./utils";

const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

export default function BookingStepper() {
  const defaultGuest = useMemo(() => getDefaultGues(), []);
  const webApp = typeof window !== "undefined" ? window.WebApp : undefined;
  const isMaxWebApp = Boolean(
    webApp && (webApp.initData || webApp.initDataUnsafe?.query_id || webApp.initDataUnsafe?.user || webApp.initDataUnsafe?.chat)
  );
  const maxWebAppUser = webApp?.initDataUnsafe?.user;

  const [currentStep, setCurrentStep] = useState(0);
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: "", phone: "" });
  const [guestErrors, setGuestErrors] = useState<GuestInfoErrors>({});
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateValue());
  const [selectedTime, setSelectedTime] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [reservedTableIds, setReservedTableIds] = useState<Set<string>>(new Set());
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [timeError, setTimeError] = useState("");
  const [tableError, setTableError] = useState("");
  const [guestCountError, setGuestCountError] = useState("");
  const [isLayoutLoading, setIsLayoutLoading] = useState(true);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [maxWebAppPhone, setMaxWebAppPhone] = useState("");
  const [maxWebAppContactError, setMaxWebAppContactError] = useState("");
  const [isContactRequesting, setIsContactRequesting] = useState(false);

  const defaultGuestInfo = useMemo<GuestInfo>(
    () => ({
      name: defaultGuest.name,
      phone: String(defaultGuest.number),
    }),
    [defaultGuest.name, defaultGuest.number]
  );
  const maxWebAppGuestInfo = useMemo<GuestInfo>(
    () => ({
      name: [maxWebAppUser?.first_name, maxWebAppUser?.last_name].filter(Boolean).join(" ").trim() || maxWebAppUser?.username || "Пользователь MAX",
      phone: maxWebAppPhone,
    }),
    [maxWebAppPhone, maxWebAppUser?.first_name, maxWebAppUser?.last_name, maxWebAppUser?.username]
  );
  const selfGuestInfo = useMemo<GuestInfo>(
    () => (isMaxWebApp ? maxWebAppGuestInfo : defaultGuestInfo),
    [defaultGuestInfo, isMaxWebApp, maxWebAppGuestInfo]
  );
  const activeGuestInfo = bookingType === "self" ? selfGuestInfo : guestInfo;
  const allTables = useMemo(
    () => sections.flatMap((section) => section.tables).filter((table) => table.number < 100),
    [sections]
  );

  const availableTableIds = useMemo(() => {
    if (!selectedTime || getTimeSelectionError(selectedDate, selectedTime)) {
      return new Set<string>();
    }

    return new Set(
      allTables
        .filter((table) => !reservedTableIds.has(table.id))
        .map((table) => table.id)
    );
  }, [allTables, reservedTableIds, selectedDate, selectedTime]);

  const availableTables = useMemo(
    () => allTables.filter((table) => availableTableIds.has(table.id)),
    [allTables, availableTableIds]
  );

  const availableHours = useMemo(() => getAvailableHours(selectedDate), [selectedDate]);
  const selectedHour = selectedTime ? Number.parseInt(selectedTime.split(":")[0], 10) : null;
  const selectedMinute = selectedTime ? Number.parseInt(selectedTime.split(":")[1], 10) : null;

  const availableMinutes = useMemo(() => {
    if (selectedHour === null || Number.isNaN(selectedHour)) {
      return [];
    }

    return getAvailableMinutes(selectedDate, selectedHour);
  }, [selectedDate, selectedHour]);

  const tableLimits = selectedTable ? getGuestLimits(selectedTable.number) : null;
  const currentGuestCount = guestCount ?? tableLimits?.min ?? 0;
  const sliderProgress =
    tableLimits && guestCount !== null
      ? tableLimits.max === tableLimits.min
        ? 100
        : ((guestCount - tableLimits.min) / (tableLimits.max - tableLimits.min)) * 100
      : 0;

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(window.location.search);
    const tablesParam = params.get("tables");

    if (!tablesParam) {
      setSections(MOCK_SECTIONS);
      setIsLayoutLoading(false);
      return () => {
        mounted = false;
      };
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(tablesParam));

      if (Array.isArray(parsed) && mounted) {
        setSections(parsed);
      } else if (mounted) {
        setSections(MOCK_SECTIONS);
      }
    } catch (error) {
      console.error("Ошибка парсинга данных столов:", error);
      if (mounted) {
        setSections(MOCK_SECTIONS);
      }
    } finally {
      if (mounted) {
        setIsLayoutLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTime) {
      setReservedTableIds(new Set());
      setIsAvailabilityLoading(false);
      return;
    }

    const error = getTimeSelectionError(selectedDate, selectedTime);
    if (error) {
      setReservedTableIds(new Set());
      setIsAvailabilityLoading(false);
      return;
    }

    let cancelled = false;

    const fetchReservedTables = async () => {
      try {
        setIsAvailabilityLoading(true);

        const response = await fetch(`${apiBaseUrl}/api/reservations/table`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
            time: selectedTime,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setReservedTableIds(new Set(data.reservedTableIds || []));
        }
      } catch (error) {
        console.error("Ошибка загрузки занятых столов:", error);
        if (!cancelled) {
          setReservedTableIds(new Set());
        }
      } finally {
        if (!cancelled) {
          setIsAvailabilityLoading(false);
        }
      }
    };

    fetchReservedTables();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (!selectedTable) {
      return;
    }

    if (!availableTableIds.has(selectedTable.id)) {
      setSelectedTable(null);
      setGuestCount(null);

      if (currentStep > 2) {
        setCurrentStep(2);
      }
    }
  }, [availableTableIds, currentStep, selectedTable]);

  useEffect(() => {
    if (!selectedTable) {
      return;
    }

    const limits = getGuestLimits(selectedTable.number);
    setGuestCount((currentCount) => {
      if (currentCount === null) {
        return limits.min;
      }

      return Math.min(Math.max(currentCount, limits.min), limits.max);
    });
  }, [selectedTable]);

  const requestMaxWebAppContact = async () => {
    if (!isMaxWebApp) {
      return null;
    }

    if (isContactRequesting) {
      return maxWebAppPhone || null;
    }

    if (typeof webApp?.requestContact !== "function") {
      setMaxWebAppContactError("Запрос номера телефона недоступен в текущем клиенте MAX.");
      return null;
    }

    try {
      setIsContactRequesting(true);
      setMaxWebAppContactError("");

      const { phone } = await webApp.requestContact();
      const nextPhone = phone.trim();

      if (!nextPhone) {
        setMaxWebAppContactError("MAX не передал номер телефона. Попробуйте запросить его ещё раз.");
        return null;
      }

      setMaxWebAppPhone(nextPhone);
      return nextPhone;
    } catch (error) {
      console.error("Ошибка запроса номера телефона в MAX:", error);
      setMaxWebAppContactError("Не удалось получить номер телефона из MAX. Попробуйте ещё раз.");
      return null;
    } finally {
      setIsContactRequesting(false);
    }
  };

  const isStepOneReady =
    (bookingType === "self" && (!isMaxWebApp || Boolean(selfGuestInfo.phone))) ||
    (bookingType === "other" && Object.keys(validateGuestInfo(guestInfo)).length === 0);
  const isStepTwoReady = Boolean(selectedTime) && !getTimeSelectionError(selectedDate, selectedTime);
  const isStepThreeReady = selectedTable ? availableTableIds.has(selectedTable.id) : false;
  const isStepFourReady =
    selectedTable !== null &&
    guestCount !== null &&
    guestCount >= (tableLimits?.min ?? 0) &&
    guestCount <= (tableLimits?.max ?? 0);

  const highestUnlockedStep = isStepOneReady
    ? isStepTwoReady
      ? isStepThreeReady
        ? isStepFourReady
          ? 4
          : 3
        : 2
      : 1
    : 0;

  const resetBooking = () => {
    setCurrentStep(0);
    setBookingType(null);
    setGuestInfo({ name: "", phone: "" });
    setGuestErrors({});
    setSelectedDate(getLocalDateValue());
    setSelectedTime("");
    setReservedTableIds(new Set());
    setSelectedTable(null);
    setGuestCount(null);
    setTimeError("");
    setTableError("");
    setGuestCountError("");
    setConfirmError("");
    setMaxWebAppContactError("");
    setIsConfirming(false);
  };

  const handleBookingTypeSelect = (type: BookingType) => {
    setBookingType(type);
    setGuestErrors({});

    if (type === "self") {
      setGuestInfo({ name: "", phone: "" });
      setMaxWebAppContactError("");

      if (isMaxWebApp && !maxWebAppPhone && !isContactRequesting) {
        void requestMaxWebAppContact();
      }

      return;
    }

    setMaxWebAppContactError("");
  };

  const handleGuestInfoChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo((current) => ({
      ...current,
      [field]: value,
    }));

    setGuestErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setSelectedTable(null);
    setGuestCount(null);

    if (!selectedTime) {
      return;
    }

    const nextError = getTimeSelectionError(value, selectedTime);
    if (nextError) {
      setSelectedTime("");
      setTimeError("");
      return;
    }

    setTimeError("");
  };

  const handleHourChange = (value: string) => {
    if (!value) {
      setSelectedTime("");
      return;
    }

    const hour = Number.parseInt(value, 10);
    const minutesForHour = getAvailableMinutes(selectedDate, hour);

    if (minutesForHour.length === 0) {
      setSelectedTime("");
      return;
    }

    const nextMinute =
      selectedMinute !== null && minutesForHour.includes(selectedMinute)
        ? selectedMinute
        : minutesForHour[0];

    setSelectedTime(formatTime(hour, nextMinute));
    setSelectedTable(null);
    setGuestCount(null);
    setTimeError("");
  };

  const handleMinuteChange = (value: string) => {
    if (selectedHour === null || !value) {
      return;
    }

    setSelectedTime(formatTime(selectedHour, Number.parseInt(value, 10)));
    setSelectedTable(null);
    setGuestCount(null);
    setTimeError("");
  };

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setTableError("");
  };

  const handleGuestCountChange = (value: number) => {
    setGuestCount(value);
    setGuestCountError("");
  };

  const goToStep = (step: number) => {
    if (step <= highestUnlockedStep) {
      setCurrentStep(step);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!bookingType) {
        return;
      }

      if (bookingType === "self" && isMaxWebApp && !selfGuestInfo.phone) {
        const requestedPhone = await requestMaxWebAppContact();

        if (!requestedPhone) {
          return;
        }
      }

      if (bookingType === "other") {
        const errors = validateGuestInfo(guestInfo);

        if (Object.keys(errors).length > 0) {
          setGuestErrors(errors);
          return;
        }
      }
    }

    if (currentStep === 1) {
      const error = getTimeSelectionError(selectedDate, selectedTime);

      if (error) {
        setTimeError(error);
        return;
      }
    }

    if (currentStep === 2 && !selectedTable) {
      setTableError("Выберите свободный стол, чтобы продолжить.");
      return;
    }

    if (currentStep === 3) {
      if (!selectedTable || guestCount === null) {
        setGuestCountError("Укажите количество гостей.");
        return;
      }

      const limits = getGuestLimits(selectedTable.number);

      if (guestCount < limits.min || guestCount > limits.max) {
        setGuestCountError(`Для этого стола доступно от ${limits.min} до ${limits.max} гостей.`);
        return;
      }
    }

    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleConfirm = async () => {
    if (!selectedTable || guestCount === null || !bookingType) {
      return;
    }

    setConfirmError("");

    let resolvedGuestInfo = activeGuestInfo;

    if (bookingType === "self" && isMaxWebApp && !selfGuestInfo.phone) {
      const requestedPhone = await requestMaxWebAppContact();

      if (!requestedPhone) {
        return;
      }

      resolvedGuestInfo = {
        ...selfGuestInfo,
        phone: requestedPhone,
      };
    }

    const reservationSummary = [
      "Бронь создана!",
      `Формат: ${getBookingTypeLabel(bookingType)}`,
      `Гость: ${resolvedGuestInfo.name}`,
      `Телефон: ${resolvedGuestInfo.phone}`,
      `Дата: ${selectedDate}`,
      `Время: ${selectedTime}`,
      `Стол: №${selectedTable.number}`,
      `Гостей: ${guestCount}`,
    ].join("\n");

    if (!isMaxWebApp) {
      alert(reservationSummary);
      resetBooking();
      return;
    }

    if (!webApp?.initData) {
      setConfirmError("В WebApp не пришёл initData, поэтому бронь нельзя отправить на backend.");
      return;
    }

    const reservationPayload = {
      initData: webApp.initData,
      bookingType,
      guestName: resolvedGuestInfo.name,
      guestPhone: resolvedGuestInfo.phone,
      date: selectedDate,
      time: selectedTime,
      guestCount,
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
    };

    console.log("[MAX WebApp] Отправка данных брони на backend:", reservationPayload);

    try {
      setIsConfirming(true);
      const response = await fetch(`${apiBaseUrl}/api/reservations/webapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationPayload),
      });

      if (!response.ok) {
        let errorMessage = "Не удалось создать бронь через WebApp.";

        try {
          const errorData = (await response.json()) as { detail?: string; message?: string };
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // ignore JSON parsing errors and keep fallback message
        }

        setConfirmError(errorMessage);
        return;
      }

      const result = (await response.json()) as { message?: string };
      console.log("[MAX WebApp] Результат создания брони:", result);

      resetBooking();
      webApp.close?.();
    } catch (error) {
      console.error("Ошибка отправки данных на backend из WebApp:", error);
      setConfirmError("Не удалось отправить данные в backend. Проверьте API и повторите попытку.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLayoutLoading) {
    return (
      <div className="booking-stepper">
        <div className="booking-shell booking-shell--centered">
          <div className="booking-panel booking-panel--loading">Загрузка схемы зала...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-stepper">
      <div className="booking-shell">
        <header className="booking-hero">
          <div>
            <span className="booking-hero__eyebrow">Tavrika</span>
            <h1 className="booking-hero__title">Пошаговое бронирование стола</h1>
            <p className="booking-hero__subtitle">
              Последовательно пройдите все этапы: от выбора гостя до финального подтверждения.
            </p>
          </div>

          <button type="button" className="booking-ghost-button" onClick={resetBooking}>
            Сбросить
          </button>
        </header>

        <ProgressSteps
          steps={STEPS}
          currentStep={currentStep}
          highestUnlockedStep={highestUnlockedStep}
          onGoToStep={goToStep}
        />

        <div className="booking-layout">
          <section className="booking-panel">
            <div className="booking-panel__header">
              <div>
                <span className="booking-panel__eyebrow">Шаг {currentStep + 1}</span>
                <h2>{STEPS[currentStep].title}</h2>
              </div>
              <p>{STEPS[currentStep].caption}</p>
            </div>

            {currentStep === 0 && (
              <BookingTypeStep
                bookingType={bookingType}
                defaultGuestInfo={selfGuestInfo}
                guestInfo={guestInfo}
                guestErrors={guestErrors}
                isMaxWebApp={isMaxWebApp}
                isContactRequesting={isContactRequesting}
                contactRequestError={maxWebAppContactError}
                onBookingTypeSelect={handleBookingTypeSelect}
                onGuestInfoChange={handleGuestInfoChange}
                onRequestContact={requestMaxWebAppContact}
              />
            )}

            {currentStep === 1 && (
              <DateTimeStep
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                availableHours={availableHours}
                selectedHour={selectedHour}
                selectedMinute={selectedMinute}
                availableMinutes={availableMinutes}
                timeError={timeError}
                onDateChange={handleDateChange}
                onHourChange={handleHourChange}
                onMinuteChange={handleMinuteChange}
              />
            )}

            {currentStep === 2 && (
              <TableStep
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                availableTables={availableTables}
                isAvailabilityLoading={isAvailabilityLoading}
                sections={sections}
                availableTableIds={availableTableIds}
                selectedTableId={selectedTable?.id ?? null}
                tableError={tableError}
                onTableSelect={handleTableSelect}
              />
            )}

            {currentStep === 3 && selectedTable && tableLimits && (
              <GuestCountStep
                selectedTable={selectedTable}
                tableLimits={tableLimits}
                currentGuestCount={currentGuestCount}
                sliderProgress={sliderProgress}
                guestCountError={guestCountError}
                onGuestCountChange={handleGuestCountChange}
              />
            )}

            {currentStep === 4 && selectedTable && guestCount !== null && (
              <ConfirmationStep
                bookingType={bookingType}
                activeGuestInfo={activeGuestInfo}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedTable={selectedTable}
                guestCount={guestCount}
              />
            )}

            {confirmError && <div className="booking-error-banner">{confirmError}</div>}

            <div className="booking-actions">
              <button
                type="button"
                className={`booking-secondary-button${currentStep === 0 ? " booking-secondary-button--hidden" : ""}`}
                onClick={handleBack}
                disabled={currentStep === 0 || isConfirming}
                aria-hidden={currentStep === 0}
                tabIndex={currentStep === 0 ? -1 : 0}
              >
                Назад
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  className="booking-primary-button"
                  onClick={() => {
                    void handleNext();
                  }}
                  disabled={isConfirming || isContactRequesting}
                >
                  Далее
                </button>
              ) : (
                <button type="button" className="booking-primary-button" onClick={handleConfirm} disabled={isConfirming}>
                  Подтвердить бронь
                </button>
              )}
            </div>
          </section>

          {/* <SummarySidebar
            steps={STEPS}
            currentStep={currentStep}
            bookingType={bookingType}
            activeGuestInfo={activeGuestInfo}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedTable={selectedTable}
            guestCount={guestCount}
          /> */}
        </div>
      </div>
    </div>
  );
}
