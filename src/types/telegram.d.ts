// types/telegram.d.ts
interface TelegramWebApp {
  ready: () => void;
  sendData: (data: string) => void;
  close: () => void;
  expand?: () => void; // Опционально
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

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};