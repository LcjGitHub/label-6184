/**
 * 交换对象联系人类型定义
 */
export interface Contact {
  id: number;
  nickname: string;
  city: string;
  contact_info: string;
  remark: string;
}

/**
 * 创建/更新联系人时的表单数据
 */
export interface ContactFormData {
  nickname: string;
  city: string;
  contact_info: string;
  remark: string;
}
