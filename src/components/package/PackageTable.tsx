import { EditOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useCallback } from 'react';
import DashboardLoader from '../common/DashboardLoader';

interface PackageData {
  id: string;
  name: string;
  originalPrice: number;
  discount: number;
  discountType: 'PERCENT' | 'WHOLE_NUMBER';
  isActive: boolean;
  isRecommended: boolean;
  giveawayEntries: number;
  updatedAt: string;
}

interface PackageTableProps {
  onShowDrawer: (mode: 'create' | 'edit' | 'view', record?: PackageData) => void;
  loading?: boolean;
  data: PackageData[];
  total: number;
  tableParams: any;
  onTableChange: (params: any, filters: any) => void;
  filters: {
    searchText?: string;
    statusFilter?: string;
  };
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

  const calculateFinalPrice = (record: PackageData) => {
    if (!record.discount) return record.originalPrice;
    return record.discountType === 'PERCENT'
      ? record.originalPrice * (1 - record.discount / 100)
      : record.originalPrice - record.discount;
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
      title: 'Original Price',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      sorter: true,
      width: '12%',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      sorter: true,
      width: '12%',
      render: (_: any, record: PackageData) =>
        record.discount > 0 ? (
          <Tag color="green">
            {record.discountType === 'PERCENT'
              ? `${record.discount}%`
              : `$${record.discount.toFixed(2)}`}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Final Price',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      sorter: true,
      width: '12%',
      render: (_: any, record: PackageData) => {
        const finalPrice =
          record.discountType === 'PERCENT'
            ? record.originalPrice * (1 - record.discount / 100) * 1.1
            : (record.originalPrice - record.discount) * 1.1;
        return `$${finalPrice.toFixed(2)}`;
      },
    },
    {
      title: 'Giveaway Entries',
      dataIndex: 'giveawayEntries',
      key: 'giveawayEntries',
      sorter: true,
      width: '15%',
      render: (entries: number) => entries.toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '10%',
      sorter: true,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Recommended',
      dataIndex: 'isRecommended',
      key: 'isRecommended',
      width: '10%',
      sorter: true,
      render: (isRecommended: boolean) => (
        <Tag color={isRecommended ? 'blue' : 'default'}>{isRecommended ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      width: '15%',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_: any, record: PackageData) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onShowDrawer('view', record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onShowDrawer('edit', record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange: TableProps<PackageData>['onChange'] = (
    pagination,
    filters,
    sorter: any
  ) => {
    onTableChange(
      {
        pagination,
        filters,
        sortField: sorter.field,
        sortOrder: sorter.order,
      },
      {
        search: filters.searchText,
        status: filters.status?.[0],
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
        onChange={handleTableChange}
        rowKey="id"
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default PackageTable;
