/**
 * 徽章系列类型定义
 */
export interface Series {
  id: number;
  name: string;
  brand: string;
  description: string;
}

/**
 * 创建/更新系列时的表单数据
 */
export interface SeriesFormData {
  name: string;
  brand: string;
  description: string;
}
