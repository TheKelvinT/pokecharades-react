export interface TableParams {
  pagination: {
    current?: number;
    pageSize?: number;
  };
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  filters?: Record<string, any>;
}
