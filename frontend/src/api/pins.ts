import axios from "axios";
import type { Pin, PinFormData } from "../types/pin";

const api = axios.create({
  baseURL: "/api",
});

/**
 * 获取全部徽章记录
 */
export async function fetchPins(): Promise<Pin[]> {
  const { data } = await api.get<Pin[]>("/pins");
  return data;
}

/**
 * 获取单条徽章记录
 */
export async function fetchPin(id: number): Promise<Pin> {
  const { data } = await api.get<Pin>(`/pins/${id}`);
  return data;
}

/**
 * 新增徽章记录
 */
export async function createPin(payload: PinFormData): Promise<Pin> {
  const { data } = await api.post<Pin>("/pins", payload);
  return data;
}

/**
 * 更新徽章记录
 */
export async function updatePin(id: number, payload: PinFormData): Promise<Pin> {
  const { data } = await api.put<Pin>(`/pins/${id}`, payload);
  return data;
}

/**
 * 删除徽章记录
 */
export async function deletePin(id: number): Promise<void> {
  await api.delete(`/pins/${id}`);
}
