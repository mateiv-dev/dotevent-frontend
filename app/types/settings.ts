export interface NotificationSettings {
  reminder24h: boolean;
  reminder1h: boolean;
  eventUpdates: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'ro';
}

export interface UserSettings {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    reminder24h: true,
    reminder1h: true,
    eventUpdates: true,
  },
  appearance: {
    theme: 'light',
    language: 'en',
  },
};