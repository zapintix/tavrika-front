import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import type { BookingType, GuestInfo, GuestInfoErrors } from "./types";

const RUSSIAN_PHONE_COUNTRY = "RU" as const;
const GUEST_NAME_ALLOWED_PATTERN = /^[\p{L}\s'-]+$/u;
const LAST_BOOKING_MINUTE = 30;

function getWorkingHoursRange(date: string): { startHour: number; endHour: number } {
  const day = parseLocalDate(date).getDay();
  const isWeekend = day === 0 || day === 6;

  return {
    startHour: isWeekend ? 10 : 11,
    endHour: isWeekend ? 21 : 22,
  };
}

export function getLocalDateValue(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
}

export function parseLocalDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export function formatBookingDate(date: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseLocalDate(date));
}

export function getGuestWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return "гость";
  }

  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return "гостя";
  }

  return "гостей";
}

export function getBookingTypeLabel(type: BookingType | null): string {
  if (type === "other") {
    return "На другого человека";
  }

  if (type === "self") {
    return "На себя";
  }

  return "Не выбрано";
}

export function validateGuestInfo(info: GuestInfo): GuestInfoErrors {
  const errors: GuestInfoErrors = {};

  const nameError = validateGuestName(info.name);
  if (nameError) {
    errors.name = nameError;
  }

  if (!info.phone.trim()) {
    errors.phone = "Введите номер телефона";
  } else if (!isValidRussianPhoneNumber(info.phone)) {
    errors.phone = "Введите корректный номер телефона";
  }

  return errors;
}

export function validateGuestName(name: string): string | undefined {
  const normalizedName = name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    return "Введите имя";
  }

  const letterCount = Array.from(normalizedName).filter((char) => /\p{L}/u.test(char)).length;

  if (letterCount < 2) {
    return "Имя должно содержать минимум 2 буквы";
  }

  if (!GUEST_NAME_ALLOWED_PATTERN.test(normalizedName)) {
    return "Имя может содержать только буквы, пробел, дефис и апостроф";
  }

  return undefined;
}

export function formatRussianPhoneNumber(input: string): string {
  const normalizedInput = input.trim();

  if (!normalizedInput || !isValidRussianPhoneNumber(normalizedInput)) {
    return input;
  }

  const phoneNumber = parsePhoneNumberFromString(normalizedInput, RUSSIAN_PHONE_COUNTRY);

  return phoneNumber ? phoneNumber.formatNational() : input;
}

export function isValidRussianPhoneNumber(input: string): boolean {
  const normalizedInput = input.trim();

  if (!normalizedInput || !isValidPhoneNumber(normalizedInput, RUSSIAN_PHONE_COUNTRY)) {
    return false;
  }

  const phoneNumber = parsePhoneNumberFromString(normalizedInput, RUSSIAN_PHONE_COUNTRY);

  return phoneNumber?.country === RUSSIAN_PHONE_COUNTRY;
}

export function getTimeSelectionError(date: string, time: string): string {
  if (!time) {
    return "Выберите время бронирования.";
  }

  const now = new Date();
  const selectedDate = parseLocalDate(date);
  const [hours, minutes] = time.split(":").map(Number);

  selectedDate.setHours(hours, minutes, 0, 0);

  if (selectedDate.getTime() < now.getTime()) {
    return "Выбранное время уже прошло. Пожалуйста, выберите актуальное время.";
  }

  return "";
}

export function getAvailableMinutes(date: string, hour: number): number[] {
  const now = new Date();
  const today = getLocalDateValue(now);
  const isToday = date === today;
  const { endHour } = getWorkingHoursRange(date);
  const isLastAvailableHour = hour === endHour - 1;
  const maxMinute = isLastAvailableHour ? LAST_BOOKING_MINUTE : 59;
  const minutes: number[] = [];

  if (isToday && hour === now.getHours()) {
    for (let minute = 0; minute <= maxMinute; minute += 1) {
      if (minute > now.getMinutes()) {
        minutes.push(minute);
      }
    }

    return minutes;
  }

  for (let minute = 0; minute <= maxMinute; minute += 1) {
    minutes.push(minute);
  }

  return minutes;
}

export function getAvailableHours(date: string): number[] {
  const now = new Date();
  const today = getLocalDateValue(now);
  const isToday = date === today;
  const { startHour, endHour } = getWorkingHoursRange(date);
  const hours: number[] = [];

  for (let hour = startHour; hour < endHour; hour += 1) {
    if (isToday && hour < now.getHours()) {
      continue;
    }

    if (isToday && hour === now.getHours() && getAvailableMinutes(date, hour).length === 0) {
      continue;
    }

    hours.push(hour);
  }

  return hours;
}
