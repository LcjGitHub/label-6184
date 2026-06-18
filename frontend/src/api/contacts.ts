import axios from "axios";
import type { Contact, ContactFormData } from "../types/contact";

const api = axios.create({
  baseURL: "/api",
});

/**
 * 获取全部联系人
 */
export async function fetchContacts(): Promise<Contact[]> {
  const { data } = await api.get<Contact[]>("/contacts");
  return data;
}

/**
 * 获取单条联系人
 */
export async function fetchContact(id: number): Promise<Contact> {
  const { data } = await api.get<Contact>(`/contacts/${id}`);
  return data;
}

/**
 * 新增联系人
 */
export async function createContact(payload: ContactFormData): Promise<Contact> {
  const { data } = await api.post<Contact>("/contacts", payload);
  return data;
}

/**
 * 更新联系人
 */
export async function updateContact(id: number, payload: ContactFormData): Promise<Contact> {
  const { data } = await api.put<Contact>(`/contacts/${id}`, payload);
  return data;
}

/**
 * 删除联系人
 */
export async function deleteContact(id: number): Promise<void> {
  await api.delete(`/contacts/${id}`);
}
