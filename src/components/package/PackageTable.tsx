import {
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Button, Input, Select, Space, Table, Tag, Tooltip, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import DashboardLoader from '../common/DashboardLoader';
import { TableParams } from '../../types/common/Common';
import { FilterValue, SorterResult, TablePaginationConfig } from 'antd/es/table/interface';

interface PackageTableProps {
  onShowDrawer?: (mode: 'create' | 'edit' | 'view', record: any) => void;
  loading?: boolean;
  data: PackageData[];
  total: number;
  tableParams: TableParams;
  onTableChange: (
    params: TableParams,
    filters: {
      search?: string;
      status?: string;
    }
  ) => void;
  filters: {
    searchText: string;
    statusFilter?: string;
  };
}

interface PackageData {
  id: string;
  name: string;
  tier: string;
  duration: number;
  price: number;
  discount: number;
  isActive: boolean;
  updatedAt: string;
}

const PackageTable: React.FC<PackageTableProps> = ({
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

  // Reset filters
  const resetFilters = () => {
    onTableChange(tableParams, {
      search: '',
      status: undefined,
    });
    debouncedSearch.cancel();
  };

  // Add this handler function
  const handleTableParamsChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<PackageData> | SorterResult<PackageData>[]
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
      }
    );
  };

  const columns: ColumnsType<PackageData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: '20%',
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      width: '15%',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: '15%',
      render: (duration: number) => `${duration} ${duration === 1 ? 'month' : 'months'}`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      width: '15%',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      width: '15%',
      render: (discount: number) => (discount > 0 ? `${discount}%` : '-'),
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
        <Button
          icon={<ReloadOutlined />}
          onClick={resetFilters}
          disabled={!filters.searchText && !filters.statusFilter}
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
          indicator: <DashboardLoader tip="Loading packages..." />,
        }}
        onChange={handleTableParamsChange}
        rowKey="id"
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default PackageTable;
