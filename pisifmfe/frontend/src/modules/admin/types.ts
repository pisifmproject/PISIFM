// src/modules/admin/types.ts

export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR',
  MAINTENANCE = 'MAINTENANCE',
  QC = 'QC',
  MANAGEMENT = 'MANAGEMENT',
  VIEWER = 'VIEWER',
}

export enum VisibilityCategory {
  GLOBAL_DASHBOARD = 'GLOBAL_DASHBOARD',
  PLANT_DASHBOARD = 'PLANT_DASHBOARD',
  UTILITY = 'UTILITY',
  MAIN_PANEL_1 = 'MAIN_PANEL_1',
  MAIN_PANEL_2 = 'MAIN_PANEL_2',
  MAIN_PANEL_3 = 'MAIN_PANEL_3',
  MAIN_PANEL_4 = 'MAIN_PANEL_4',
  MACHINE_DETAIL = 'MACHINE_DETAIL',
}

export enum VisibilityGroup {
  KPI = 'KPI',
  CHART = 'CHART',
  TABLE = 'TABLE',
  LIST = 'LIST',
  STATUS = 'STATUS',
  TAB = 'TAB',
  FORM = 'FORM',
  OUTPUT = 'OUTPUT',
  OEE = 'OEE',
  MACHINES = 'MACHINES',
  UTILITY_CONSUMPTION = 'UTILITY_CONSUMPTION',
  PROCESS_PARAM = 'PROCESS_PARAM',
  ALARM_DATA = 'ALARM_DATA',
  PACKING_LINE_KPI = 'PACKING_LINE_KPI',
  PACKING_WEIGHER = 'PACKING_WEIGHER',
  PACKING_BAGMAKER = 'PACKING_BAGMAKER',
}

export interface DataItem {
  id: string;
  key: string;
  label: string;
  category: VisibilityCategory;
  group: VisibilityGroup;
  location: string;
  defaultVisible: boolean;
  plantScopeId?: string;
}

export interface PlantInfo {
  id: string;
  name: string;
  machines: { id: string; name: string }[];
  lvmdps: { id: string; name: string }[];
}
