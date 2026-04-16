import type { StepDefinition } from "../types";

type ProgressStepsProps = {
  steps: StepDefinition[];
  currentStep: number;
  highestUnlockedStep: number;
  onGoToStep: (step: number) => void;
};

export function ProgressSteps({
  steps,
  currentStep,
  highestUnlockedStep,
  onGoToStep,
}: ProgressStepsProps) {
  return (
    <div className="booking-progress">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isUnlocked = index <= highestUnlockedStep;

        return (
          <button
            key={step.title}
            type="button"
            className={`booking-progress__step${isActive ? " is-active" : ""}${isCompleted ? " is-completed" : ""}`}
            onClick={() => onGoToStep(index)}
            disabled={!isUnlocked}
          >
            <span className="booking-progress__index">{index + 1}</span>
            <span className="booking-progress__meta">
              <span className="booking-progress__title">{step.title}</span>
              <span className="booking-progress__caption">{step.caption}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
