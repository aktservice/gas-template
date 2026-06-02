export interface SheetConfig {
  readonly sheetName: string;
  readonly columns: readonly string[];
}

export interface ConfigSchema {
  readonly CONFIG: SheetConfig;
  readonly USERS: SheetConfig;
  readonly [key: string]: SheetConfig;
}

export const SCHEMA: ConfigSchema = {
  CONFIG: {
    sheetName: 'config',
    columns: [
      'key',
      'value',
      'description',
    ],
  },
  USERS: {
    sheetName: 'users',
    columns: [
      'userId',
      'name',
      'mail',
    ],
  },
} as const;

export interface ConfigInitialValue {
  readonly key: string;
  readonly value: string;
  readonly description: string;
}

export const CONFIG_INITIAL_VALUES: readonly ConfigInitialValue[] = [
  { key: 'API_KEY', value: 'xxx', description: 'API Key for external service' },
  { key: 'DRIVE_FOLDER_ID', value: 'xxx', description: 'Folder ID for storage' },
] as const;

export interface TriggerConfig {
  readonly functionName: string;
  readonly eventType: 'CLOCK' | 'SPREADSHEET';
  readonly schedule: 'DAILY' | 'HOURLY' | 'ON_EDIT' | 'ON_OPEN';
}

export const TRIGGERS: readonly TriggerConfig[] = [
  {
    functionName: 'dailyBatch',
    eventType: 'CLOCK',
    schedule: 'DAILY',
  },
] as const;

export interface PropertyConfig {
  readonly [key: string]: string;
}

export const PROPERTIES: PropertyConfig = {
  APP_NAME: 'sample',
} as const;
