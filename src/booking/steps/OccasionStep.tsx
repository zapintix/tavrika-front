type OccasionStepProps = {
  occasion: string;
  onOccasionChange: (value: string) => void;
};

export function OccasionStep({ occasion, onOccasionChange }: OccasionStepProps) {
  return (
    <div className="booking-step-content">
      <div className="booking-form-grid--double">
        <label className="booking-field">
          <span>Что за мероприятие?</span>
          <input
            type="text"
            value={occasion}
            onChange={(event) => onOccasionChange(event.target.value)}
            placeholder="Например, день рождения, свидание или деловая встреча (по желанию)"
          />
        </label>
      </div>
    </div>
  );
}
