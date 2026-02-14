export interface RankingResponse<T> {
  code: number;
  data: T[];
  // 允许额外的动态属性（如 list, result 等）
  [key: string]: unknown;
}
