import axios from "axios";
import type { WearingHistory, WearingHistoryFormData } from "../types/wearingHistory";

const api = axios.create({
  baseURL: "/api",
});

export async function fetchWearingHistory(pinId: number): Promise<WearingHistory[]> {
  const { data } = await api.get<WearingHistory[]>(`/pins/${pinId}/wearing-history`);
  return data;
}

export async function createWearingHistory(
  pinId: number,
  payload: WearingHistoryFormData
): Promise<WearingHistory> {
  const { data } = await api.post<WearingHistory>(`/pins/${pinId}/wearing-history`, payload);
  return data;
}

export async function deleteWearingHistory(historyId: number): Promise<void> {
  await api.delete(`/wearing-history/${historyId}`);
}
