import type { Section } from "../types/table";
import type { StepDefinition } from "./types";

export const STEPS: StepDefinition[] = [
  {
    title: "На кого бронь",
    caption: "Выбор гостя",
  },
  {
    title: "Дата и время",
    caption: "Когда прийти",
  },
  {
    title: "Стол",
    caption: "Выбор места",
  },
  {
    title: "Гости",
    caption: "Количество мест",
  },
  {
    title: "Подтверждение",
    caption: "Проверка данных",
  },
];

export const MOCK_SECTIONS: Section[] = [
  {
    id: "f1398858-0f9f-4614-93fa-6f8d0f521dd3",
    name: "Зал",
    tables: [
      { id: "93f7b752-a44c-4923-bc75-c650c09aa956", number: 1, name: "", x: 460, y: 60, width: 130, height: 60, borderRadius: 0 },
      { id: "0fa40dd0-dd85-4fc9-b8a0-41f891da1d76", number: 2, name: "", x: 410, y: 650, width: 100, height: 100, borderRadius: 0 },
      { id: "371d6255-059b-4611-9316-1c2dd6e2165a", number: 3, name: "", x: 330, y: 370, width: 150, height: 60, borderRadius: 0 },
      { id: "fce460f2-d709-4f57-9278-21ce7f836061", number: 4, name: "", x: 240, y: 370, width: 150, height: 60, borderRadius: 0 },
      { id: "72195031-4ef0-4767-82b1-e11033adca0b", number: 5, name: "", x: 150, y: 370, width: 150, height: 60, borderRadius: 0 },
      { id: "eccc804d-06e8-4bfe-9a97-6483182be68c", number: 6, name: "", x: 90, y: 640, width: 150, height: 60, borderRadius: 0 },
      { id: "e912a2d8-9aa1-4f55-9bcc-9a99e912f4c8", number: 7, name: "", x: 10, y: 540, width: 150, height: 60, borderRadius: 0 },
      { id: "41429a8a-a77c-4fcb-aab6-d0aaf54700e0", number: 8, name: "", x: 20, y: 20, width: 150, height: 60, borderRadius: 0 },
      { id: "aa17f2fe-e890-4286-9e48-1827a7f81b0d", number: 9, name: "", x: 120, y: 130, width: 70, height: 50, borderRadius: 0 },
      { id: "cf6bcd31-42ef-4d3c-b65c-a163ab032903", number: 10, name: "", x: 200, y: 130, width: 70, height: 50, borderRadius: 0 },
      { id: "b046a8db-c90d-47f5-bf4b-5c6ddbda4445", number: 11, name: "", x: 280, y: 130, width: 70, height: 50, borderRadius: 0 },
      { id: "51bdf14d-9ca5-42cf-9003-c39473701411", number: 12, name: "", x: 360, y: 130, width: 70, height: 50, borderRadius: 0 },
      { id: "e4acfa77-2e48-4d6a-8930-e02e657b6d23", number: 13, name: "", x: 360, y: 20, width: 70, height: 50, borderRadius: 0 },
    ],
  },
];
