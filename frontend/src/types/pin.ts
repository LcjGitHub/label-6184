/**
 * 徽章交换记录类型定义
 */
export interface Pin {
  id: number;
  pattern_description: string;
  source: string;
  exchange_partner: string;
  exchange_date: string;
  worn: boolean;
}

/**
 * 创建/更新徽章时的表单数据
 */
export interface PinFormData {
  pattern_description: string;
  source: string;
  exchange_partner: string;
  exchange_date: string;
  worn: boolean;
}

/**
 * 排序字段
 */
export type PinSortField = "exchange_date" | "source";

/**
 * 排序方向
 */
export type SortOrder = "asc" | "desc";

/**
 * 列表查询参数
 */
export interface PinListQuery {
  keyword?: string;
  sortBy?: PinSortField;
  sortOrder?: SortOrder;
}
