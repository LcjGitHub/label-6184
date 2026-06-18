import axios from "axios";
import type { Event, EventFormData } from "../types/event";

const api = axios.create({
  baseURL: "/api",
});

/**
 * 获取全部活动
 */
export async function fetchEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>("/events");
  return data;
}

/**
 * 获取单条活动
 */
export async function fetchEvent(id: number): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${id}`);
  return data;
}

/**
 * 新增活动
 */
export async function createEvent(payload: EventFormData): Promise<Event> {
  const { data } = await api.post<Event>("/events", payload);
  return data;
}

/**
 * 更新活动
 */
export async function updateEvent(id: number, payload: EventFormData): Promise<Event> {
  const { data } = await api.put<Event>(`/events/${id}`, payload);
  return data;
}

/**
 * 删除活动
 */
export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`/events/${id}`);
}
