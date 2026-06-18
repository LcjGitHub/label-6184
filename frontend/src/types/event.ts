/**
 * 线下交换活动类型定义
 */
export interface Event {
  id: number;
  name: string;
  event_date: string;
  location: string;
  max_attendees: number;
  remark: string;
}

/**
 * 创建/更新活动时的表单数据
 */
export interface EventFormData {
  name: string;
  event_date: string;
  location: string;
  max_attendees: number;
  remark: string;
}
