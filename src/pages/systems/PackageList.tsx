import {
  CheckCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SwapOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Row,
  Space,
  Tag,
  Typography,
  message,
  Modal,
  Tooltip,
} from 'antd';
import React, { useState } from 'react';
import PackageDrawer from '../../components/package/PackageDrawer';
import PackageTable from '../../components/package/PackageTable';
import { useTableConfig } from '../../hooks/useTableConfig';
import { TableParams } from '../../types/common/Common';
import DashboardLoader from '../../components/common/DashboardLoader';
import { packagesList } from '../../services/mockData';

const { Title, Text } = Typography;

const MAX_ACTIVE_PACKAGES = 5; // Maximum allowed active packages

interface PackageData {
  id: string;
  name: string;
  tier: string;
  duration: number;
  price: number;
  discount: number;
  isActive: boolean;
  updatedAt: string;
  position?: number;
}

// Helper function to calculate final price
const calculateFinalPrice = (pkg: PackageData) => {
  const price = pkg.price || 0;
  const discount = pkg.discount || 0;
  return price * (1 - discount / 100);
};

const PackageList: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | undefined>();
  const [reorderModalVisible, setReorderModalVisible] = useState(false);
  const [selectedPackageForReorder, setSelectedPackageForReorder] = useState<PackageData | null>(
    null
  );

  // Add table config state
  const { tableParams, handleTableChange } = useTableConfig({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    sortField: 'name',
    sortOrder: 'ascend',
  });

  // Add filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Get active packages
  const activePackages = packagesList.filter(pkg => pkg.active);
  const activeCount = activePackages.length;

  const showDrawer = (mode: 'create' | 'edit' | 'view', record?: PackageData) => {
    setDrawerMode(mode);
    setEditingId(record?.id || null);
    setSelectedPackage(record);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setSelectedPackage(undefined);
  };

  // Handler for table changes
  const handleTableConfigChange = (
    newTableParams: TableParams,
    filters: {
      search?: string;
      status?: string;
    }
  ) => {
    handleTableChange(newTableParams.pagination, newTableParams.filters || {}, {
      field: newTableParams.sortField,
      order: newTableParams.sortOrder,
    });
    setSearchText(filters.search || '');
    setStatusFilter(filters.status);
  };

  const handleReorder = (pkg: PackageData, newPosition: number) => {
    // Implement reorder logic here
    setReorderModalVisible(false);
    setSelectedPackageForReorder(null);
  };

  const renderActivePackages = (
    packages: PackageData[],
    showDrawer: (mode: 'create' | 'edit' | 'view', record?: PackageData) => void
  ) => {
    if (packages.length === 0) {
      return (
        <Alert
          message="No Active Packages"
          description="There are currently no active packages. Please activate at least one package."
          type="warning"
          showIcon
        />
      );
    }

    // Create an array of 5 positions with empty slots
    const positionedPackages = Array(MAX_ACTIVE_PACKAGES).fill(null);

    // Place packages in their correct positions (converting from 1-based to 0-based index)
    packages.forEach(pkg => {
      if (pkg.position && pkg.position >= 1 && pkg.position <= MAX_ACTIVE_PACKAGES) {
        positionedPackages[pkg.position - 1] = pkg;
      }
    });

    return (
      <Row gutter={[16, 16]} className="py-4">
        {positionedPackages.map((pkg, index) => (
          <Col xs={24} sm={24} md={8} key={pkg?.id || `empty-${index}`}>
            {pkg ? (
              // Render actual package card
              <Card
                className="h-full flex flex-col transition-all duration-300 hover:shadow-lg"
                styles={{
                  body: {
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  },
                }}
                style={{ maxWidth: '350px', margin: '0 auto' }}
              >
                {/* Package Header */}
                <div className="text-center mb-6">
                  <Title level={3} style={{ margin: 0 }}>
                    {pkg.name}
                  </Title>
                  <Tag color={pkg.isActive ? 'green' : 'red'} className="mt-2">
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  {pkg.discount > 0 && (
                    <Text delete type="secondary" className="text-lg">
                      ${pkg.price.toFixed(2)}
                    </Text>
                  )}
                  <div className="flex items-center justify-center">
                    <Text strong className="text-4xl">
                      ${calculateFinalPrice(pkg).toFixed(2)}
                    </Text>
                    <Text type="secondary" className="ml-2">
                      /{pkg.duration === 1 ? 'mo' : `${pkg.duration}mo`}
                    </Text>
                  </div>
                  {pkg.discount > 0 && (
                    <Tag color="green" className="mt-2">
                      Save {pkg.discount}%
                    </Tag>
                  )}
                </div>

                {/* Package Details */}
                <div className="flex-grow mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Tier:</Text>
                      <Text strong>{pkg.tier}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Duration:</Text>
                      <Text strong>
                        {pkg.duration} {pkg.duration === 1 ? 'month' : 'months'}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-6 border-t">
                  <Space className="w-full justify-end">
                    <Tooltip title="View Details">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => showDrawer('view', pkg)}
                      />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => showDrawer('edit', pkg)}
                      />
                    </Tooltip>
                    <Tooltip title="Reorder">
                      <Button
                        type="text"
                        icon={<SwapOutlined />}
                        onClick={() => {
                          setSelectedPackageForReorder(pkg);
                          setReorderModalVisible(true);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Deactivate">
                      <Button
                        type="text"
                        danger
                        icon={<StopOutlined />}
                        onClick={() => {
                          // Implement deactivate logic here
                          message.success('Package deactivated successfully');
                        }}
                      />
                    </Tooltip>
                  </Space>
                </div>
              </Card>
            ) : (
              // Render empty placeholder card
              <Card
                className="h-full flex flex-col border-dashed"
                styles={{
                  body: {
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                }}
                style={{ maxWidth: '350px', margin: '0 auto' }}
              >
                <div className="text-center text-gray-400">
                  <div className="mb-4">
                    <Text type="secondary" className="text-lg">
                      Position {index + 1}
                    </Text>
                  </div>
                  <Text type="secondary">Available Slot</Text>
                </div>
              </Card>
            )}
          </Col>
        ))}
      </Row>
    );
  };

  const getCollapseItems = () => {
    return [
      {
        key: '1',
        label: (
          <div className="flex justify-between items-center w-full">
            <Title level={5} style={{ margin: 0 }}>
              Currently Active Packages ({activeCount}/{MAX_ACTIVE_PACKAGES})
            </Title>
          </div>
        ),
        children: renderActivePackages(activePackages, showDrawer),
      },
    ];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Package Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showDrawer('create')}
          disabled={activeCount >= MAX_ACTIVE_PACKAGES}
        >
          Add New Package
        </Button>
      </div>

      <Collapse
        items={getCollapseItems()}
        defaultActiveKey={['1']}
        className="mb-6"
        style={{ background: '#fff' }}
      />

      <Card styles={{ body: { padding: '24px' } }}>
        <Title level={5}>All Packages</Title>
        <PackageTable
          onShowDrawer={showDrawer}
          loading={false}
          data={packagesList}
          total={packagesList.length}
          tableParams={tableParams}
          onTableChange={handleTableConfigChange}
          filters={{
            searchText,
            statusFilter,
          }}
        />
      </Card>

      <PackageDrawer
        open={drawerOpen}
        mode={drawerMode}
        editingId={editingId}
        packageData={selectedPackage}
        onClose={handleDrawerClose}
        setDrawerMode={setDrawerMode}
        activeCount={activeCount}
        maxActivePackages={MAX_ACTIVE_PACKAGES}
        onSubmit={values => {
          console.log('Form values:', values);
          // Implement form submission logic here
          handleDrawerClose();
        }}
        onDelete={id => {
          console.log('Delete package:', id);
          // Implement delete logic here
          handleDrawerClose();
        }}
      />

      <Modal
        title="Select Position"
        open={reorderModalVisible}
        onCancel={() => {
          setReorderModalVisible(false);
          setSelectedPackageForReorder(null);
        }}
        footer={null}
      >
        {selectedPackageForReorder && (
          <Space direction="vertical" style={{ width: '100%' }}>
            {[1, 2, 3, 4, 5].map(position => (
              <Button
                key={position}
                block
                onClick={() => handleReorder(selectedPackageForReorder, position)}
                disabled={position === selectedPackageForReorder?.position}
              >
                Move to Position {position}
              </Button>
            ))}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default PackageList;
