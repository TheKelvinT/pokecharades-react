import { useState } from 'react';
import { TablePaginationConfig, SorterResult } from 'antd/es/table/interface';
import { TableParams } from '../types/common/Common';

export const useTableConfig = (initialConfig: TableParams) => {
  const [tableParams, setTableParams] = useState<TableParams>(initialConfig);

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: SorterResult<any> | SorterResult<any>[]
  ) => {
    setTableParams({
      pagination,
      sortField: Array.isArray(sorter) ? undefined : (sorter.field as string),
      sortOrder: Array.isArray(sorter)
        ? undefined
        : (sorter.order as 'ascend' | 'descend' | undefined),
      filters,
    });
  };

  return { tableParams, handleTableChange };
};
