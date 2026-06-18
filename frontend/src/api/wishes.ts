import axios from "axios";
import type { Wish, WishFormData } from "../types/wish";

const api = axios.create({
  baseURL: "/api",
});

/**
 * 获取全部愿望清单
 */
export async function fetchWishes(): Promise<Wish[]> {
  const { data } = await api.get<Wish[]>("/wishes");
  return data;
}

/**
 * 获取单条愿望
 */
export async function fetchWish(id: number): Promise<Wish> {
  const { data } = await api.get<Wish>(`/wishes/${id}`);
  return data;
}

/**
 * 新增愿望
 */
export async function createWish(payload: WishFormData): Promise<Wish> {
  const { data } = await api.post<Wish>("/wishes", payload);
  return data;
}

/**
 * 更新愿望
 */
export async function updateWish(id: number, payload: WishFormData): Promise<Wish> {
  const { data } = await api.put<Wish>(`/wishes/${id}`, payload);
  return data;
}

/**
 * 删除愿望
 */
export async function deleteWish(id: number): Promise<void> {
  await api.delete(`/wishes/${id}`);
}
