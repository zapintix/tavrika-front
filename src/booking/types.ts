import type { Table } from "../types/table";

export type BookingType = "self" | "other";

export type GuestInfo = {
  name: string;
  phone: string;
};

export type GuestInfoErrors = {
  name?: string;
  phone?: string;
};

export type StepDefinition = {
  title: string;
  caption: string;
};

export type GuestLimits = {
  min: number;
  max: number;
};

export type LayoutTable = {
  table: Table;
  left: number;
  bottom: number;
  width: number;
  height: number;
  borderRadius: number;
  isAvailable: boolean;
  isSelected: boolean;
  limits: GuestLimits;
};
