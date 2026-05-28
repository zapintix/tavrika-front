import type { BookingType, GuestInfo, GuestInfoErrors } from "../types";

type BookingTypeStepProps = {
  bookingType: BookingType | null;
  defaultGuestInfo: GuestInfo;
  guestInfo: GuestInfo;
  guestErrors: GuestInfoErrors;
  isMaxWebApp: boolean;
  isContactRequesting: boolean;
  contactRequestError: string;
  onBookingTypeSelect: (type: BookingType) => void;
  onGuestInfoChange: (field: keyof GuestInfo, value: string) => void;
  onRequestContact: () => Promise<string | null>;
};

export function BookingTypeStep({
  bookingType,
  defaultGuestInfo,
  guestInfo,
  guestErrors,
  isMaxWebApp,
  isContactRequesting,
  contactRequestError,
  onBookingTypeSelect,
  onGuestInfoChange,
  onRequestContact,
}: BookingTypeStepProps) {
  
    const renderGuestForm = () => (
    <div className="booking-form-grid">
      <label className="booking-field">
        <span>Имя гостя</span>

        <input
          type="text"
          value={guestInfo.name}
          onChange={(event) =>
            onGuestInfoChange("name", event.target.value)
          }
          placeholder="Например, Мария"
        />

        {guestErrors.name && <em>{guestErrors.name}</em>}
      </label>

      <label className="booking-field">
        <span>Телефон гостя</span>

        <input
          type="tel"
          value={guestInfo.phone}
          onChange={(event) => {
            let value = event.target.value.replace(/\D/g, "");

            if (value.length > 11) {
              value = value.slice(0, 11);
            }

            onGuestInfoChange("phone", value);
          }}
          placeholder="+7 (900) 123-45-67"
        />

        {guestErrors.phone && <em>{guestErrors.phone}</em>}
      </label>
    </div>
  );
    return (
    <div className="booking-step-content">
      {isMaxWebApp ? (
        <>
          <div className="booking-choice-grid">
            <button
              type="button"
              className={`booking-choice${bookingType === "self" ? " is-selected" : ""}`}
              onClick={() => onBookingTypeSelect("self")}
            >
              <span className="booking-choice__icon">На себя</span>
              <strong>{defaultGuestInfo.name}</strong>
              <span>
                {defaultGuestInfo.phone || "Номер запросим через MAX"}
              </span>
            </button>

            <button
              type="button"
              className={`booking-choice${bookingType === "other" ? " is-selected" : ""}`}
              onClick={() => onBookingTypeSelect("other")}
            >
              <span className="booking-choice__icon">На другого</span>
              <strong>Передать бронь гостю</strong>
              <span>Укажем имя и телефон для связи</span>
            </button>
          </div>

          {bookingType === "self" && (
            <div className="booking-inline-card">
              <span className="booking-inline-card__label">
                Контакт для брони
              </span>

              <strong>{defaultGuestInfo.name}</strong>

              <span>
                {defaultGuestInfo.phone || "Номер телефона ещё не получен"}
              </span>

              <button
                type="button"
                className="booking-inline-card__action"
                onClick={() => {
                  void onRequestContact();
                }}
                disabled={isContactRequesting}
              >
                {isContactRequesting
                  ? "Запрашиваем номер..."
                  : defaultGuestInfo.phone
                    ? "Обновить номер из MAX"
                    : "Запросить номер из MAX"}
              </button>

              {!defaultGuestInfo.phone && !contactRequestError && (
                <small className="booking-inline-card__hint">
                  Номер телефона нужен для подтверждения брони в MAX.
                </small>
              )}

              {contactRequestError && (
                <div className="booking-error-banner">
                  {contactRequestError}
                </div>
              )}
            </div>
          )}

          {bookingType === "other" && renderGuestForm()}
        </>
      ) : (
        renderGuestForm()
      )}
    </div>
  );
}
