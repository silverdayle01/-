
export enum DiaperBrand {
  Huggies = "האגיס",
  Pampers = "פמפרס",
  Titulim = "טיטולים",
  Other = "אחר",
}

export interface DiaperLog {
  id: string;
  timestamp: number;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  diaperBrand: DiaperBrand;
  logs: DiaperLog[];
}

export interface DiaperConsumptionEstimate {
  daily: number;
  weekly: number;
  monthly: number;
}
