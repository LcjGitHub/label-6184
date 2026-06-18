import axios from "axios";
import type { Series, SeriesFormData } from "../types/series";

const api = axios.create({
  baseURL: "/api",
});

/**
 * 获取全部徽章系列
 */
export async function fetchSeries(): Promise<Series[]> {
  const { data } = await api.get<Series[]>("/series");
  return data;
}

/**
 * 获取单条徽章系列
 */
export async function fetchOneSeries(id: number): Promise<Series> {
  const { data } = await api.get<Series>(`/series/${id}`);
  return data;
}

/**
 * 新增徽章系列
 */
export async function createSeries(payload: SeriesFormData): Promise<Series> {
  const { data } = await api.post<Series>("/series", payload);
  return data;
}

/**
 * 更新徽章系列
 */
export async function updateSeries(id: number, payload: SeriesFormData): Promise<Series> {
  const { data } = await api.put<Series>(`/series/${id}`, payload);
  return data;
}

/**
 * 删除徽章系列
 */
export async function deleteSeries(id: number): Promise<void> {
  await api.delete(`/series/${id}`);
}
