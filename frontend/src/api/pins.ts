import axios from "axios";
import type { Pin, PinFormData, PinListQuery, PinPatchData } from "../types/pin";

const api = axios.create({
  baseURL: "/api",
});

/**
 * 获取全部徽章记录，支持关键词搜索和排序
 */
export async function fetchPins(query?: PinListQuery): Promise<Pin[]> {
  const params: Record<string, string> = {};
  if (query?.keyword) {
    params.keyword = query.keyword;
  }
  if (query?.sortBy) {
    params.sort_by = query.sortBy;
  }
  if (query?.sortOrder) {
    params.sort_order = query.sortOrder;
  }
  const { data } = await api.get<Pin[]>("/pins", { params });
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

/**
 * 部分更新徽章记录（用于切换收藏状态）
 */
export async function patchPin(id: number, payload: PinPatchData): Promise<Pin> {
  const { data } = await api.patch<Pin>(`/pins/${id}`, payload);
  return data;
}
