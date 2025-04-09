import { EditOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FilterValue, SorterResult, TablePaginationConfig } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import DashboardLoader from '../common/DashboardLoader';
import { TableParams } from '../../types/common/Common';

interface TierTableProps {
  tierType?: 'MONTHLY' | 'YEARLY';
  onShowDrawer?: (mode: 'create' | 'edit' | 'view', record: any) => void;
  loading?: boolean;
  data: TierData[];
  total: number;
  tableParams: TableParams;
  onTableChange: (
    params: TableParams,
    filters: {
      search?: string;
      status?: string;
      recommended?: string;
    }
  ) => void;
  filters: {
    searchText: string;
    statusFilter?: string;
    recommendedFilter?: string;
  };
}

interface TierData {
  id: string;
  name: string;
  originalPrice: number;
  discountAmount: number;
  discountType: 'PERCENT' | 'WHOLE_NUMBER';
  isActive: boolean;
  isRecommended: boolean;
  monthlyEntries: number;
  updatedAt: string;
  // ... other fields ...
}

const TierTable: React.FC<TierTableProps> = ({
  onShowDrawer,
  loading,
  data,
  total,
  tableParams,
  onTableChange,
  filters,
}) => {
  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onTableChange(tableParams, {
        ...filters,
        search: value,
      });
    }, 500),
    [onTableChange, tableParams, filters]
  );

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    debouncedSearch(value);
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string | undefined) => {
    onTableChange(tableParams, {
      ...filters,
      status: value,
    });
  };

  const handleRecommendedFilterChange = (value: string | undefined) => {
    onTableChange(tableParams, {
      ...filters,
      recommended: value,
    });
  };

  // Reset filters
  const resetFilters = () => {
    onTableChange(tableParams, {
      search: '',
      status: undefined,
      recommended: undefined,
    });
    debouncedSearch.cancel();
  };

  const columns: ColumnsType<TierData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: '15%',
    },
    {
      title: 'Price',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      sorter: true,
      width: '10%',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Discount',
      key: 'discount',
      width: '10%',
      render: (_, record) => (
        <span>
          {record.discountAmount}
          {record.discountType === 'PERCENT' ? '%' : '$'}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: '10%',

      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Recommended',
      key: 'recommended',
      width: '10%',

      render: (_, record) => (
        <Tag color={record.isRecommended ? 'blue' : 'default'}>
          {record.isRecommended ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Monthly Entries',
      dataIndex: 'monthlyEntries',
      key: 'monthlyEntries',
      sorter: true,
      width: '12%',
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      width: '15%',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View" trigger="hover">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onShowDrawer?.('view', record)}
            />
          </Tooltip>
          <Tooltip title="Edit" trigger="hover">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onShowDrawer?.('edit', record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle table change
  const handleTableParamsChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<TierData> | SorterResult<TierData>[]
  ) => {
    const sort = Array.isArray(sorter) ? sorter[0] : sorter;
    onTableChange(
      {
        pagination,
        filters,
        sortField: sort.field as string,
        sortOrder: sort.order as 'ascend' | 'descend' | undefined,
      },
      {
        search: filters.searchText?.[0] as string,
        status: filters.status?.[0] as string,
        recommended: filters.recommended?.[0] as string,
      }
    );
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search by name"
          prefix={<SearchOutlined />}
          onChange={handleSearchChange}
          value={filters.searchText}
          style={{ width: 200 }}
          allowClear
          onClear={() => {
            debouncedSearch('');
          }}
        />
        <Select
          placeholder="Filter by status"
          style={{ width: 150 }}
          allowClear
          value={filters.statusFilter}
          onChange={handleStatusFilterChange}
          options={[
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' },
          ]}
        />
        <Select
          placeholder="Filter by recommended"
          style={{ width: 180 }}
          allowClear
          value={filters.recommendedFilter}
          onChange={handleRecommendedFilterChange}
          options={[
            { label: 'Recommended', value: 'true' },
            { label: 'Not Recommended', value: 'false' },
          ]}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={resetFilters}
          disabled={!filters.searchText && !filters.statusFilter && !filters.recommendedFilter}
        >
          Reset Filters
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          ...tableParams.pagination,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `Total ${total} items`,
        }}
        loading={{
          spinning: loading,
          indicator: <DashboardLoader tip="Loading tiers..." />,
        }}
        onChange={handleTableParamsChange}
        rowKey="id"
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default TierTable;
