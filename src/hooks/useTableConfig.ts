import { useState } from 'react';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

interface TableParams {
  pagination: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue | null>;
}

export const useTableConfig = (initialParams?: Partial<TableParams>) => {
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      ...initialParams?.pagination,
    },
    sortField: initialParams?.sortField,
    sortOrder: initialParams?.sortOrder,
    filters: initialParams?.filters || {},
  });

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[]
  ) => {
    const sort = Array.isArray(sorter) ? sorter[0] : sorter;

    setTableParams({
      pagination,
      filters,
      sortField: sort.field as string,
      sortOrder: sort.order as string,
    });
  };

  return {
    tableParams,
    handleTableChange,
  };
};
