export interface WearingHistory {
  id: number;
  pin_id: number;
  wear_date: string;
  occasion: string;
  remarks: string;
}

export interface WearingHistoryFormData {
  wear_date: string;
  occasion: string;
  remarks: string;
}
