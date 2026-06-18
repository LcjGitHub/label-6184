/**
 * 愿望清单类型定义
 */
export interface Wish {
  id: number;
  pattern_description: string;
  expected_source: string;
  priority: "高" | "中" | "低";
  achieved: boolean;
}

/**
 * 创建/更新愿望时的表单数据
 */
export interface WishFormData {
  pattern_description: string;
  expected_source: string;
  priority: "高" | "中" | "低";
  achieved: boolean;
}
