export interface Table {
  id: string;
  number: number;
  name: string;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  borderRadius: number | null;
}

export interface Section {
  id: string;
  name: string;
  tables: Table[];
}
