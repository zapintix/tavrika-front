declare global {
  interface MaxWebAppUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  }

  type MaxWebAppChatType = "DIALOG" | "CHAT" | "CHANNEL";
  type MaxWebAppPlatform = "ios" | "android" | "desktop" | "web";

  interface MaxWebAppChat {
    id: number;
    type: MaxWebAppChatType;
  }

  interface MaxWebAppInitDataUnsafe {
    user?: MaxWebAppUser;
    chat?: MaxWebAppChat;
    query_id?: string;
    start_param?: string;
    auth_date?: number;
    hash?: string;
    [key: string]: unknown;
  }

  interface MaxWebAppShareResult {
    status: "shared" | "cancelled";
  }

  interface MaxWebAppBackButton {
    isVisible?: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  }

  interface MaxWebApp {
    initData?: string;
    initDataUnsafe?: MaxWebAppInitDataUnsafe;
    platform?: MaxWebAppPlatform;
    version?: string;
    ready?: () => void;
    close?: () => void;
    requestContact?: () => Promise<{ phone: string }>;
    shareMaxContent?: (
      params: { text?: string; link?: string } | { mid: string; chatType: "DIALOG" | "CHAT" }
    ) => Promise<MaxWebAppShareResult>;
    enableClosingConfirmation?: () => void;
    disableClosingConfirmation?: () => void;
    BackButton?: MaxWebAppBackButton;
  }

  interface Window {
    WebApp?: MaxWebApp;
  }
}

export {};
