import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import {
  useActivePackages,
  useCreatePackage,
  useDeactivatePackageStatus,
  useDeletePackage,
  usePackages,
  useReorderPackages,
  useUpdatePackage,
} from '../../api/packageApi';
import DashboardLoader from '../../components/common/DashboardLoader';
import PackageDrawer from '../../components/package/PackageDrawer';
import PackageTable from '../../components/package/PackageTable';
import { useTableConfig } from '../../hooks/useTableConfig';
import { TableParams } from '../../types/common/Common';

const { Title, Text } = Typography;

const MAX_ACTIVE_PACKAGES = 5; // Maximum allowed active packages

interface PackageData {
  id: string;
  name: string;
  originalPrice: number;
  discountAmount: number;
  isActive: boolean;
  giveawayEntries: number;
  position?: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  isRecommended: boolean;
  fullAccessDays: number;
  discountType: string;
}

// Helper function to calculate final price
const calculateFinalPrice = (pkg: PackageData) => {
  const price = pkg.originalPrice || 0;
  const discount = pkg.discountAmount || 0;
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

  // Add these state variables at the top of your PackageList component
  const [loadingAction, setLoadingAction] = useState<'reorder' | 'recommend' | 'deactivate' | null>(
    null
  );
  const [loadingPackageId, setLoadingPackageId] = useState<string | null>(null);
  const [switchingPosition, setSwitchingPosition] = useState<number | null>(null);

  // API Hooks
  const { data: activePackagesData, isLoading: isLoadingActive } = useActivePackages();
  const {
    data: apiData,
    isLoading: isLoadingTable,
    error,
  } = usePackages({
    take: tableParams.pagination.pageSize,
    skip: ((tableParams.pagination.current || 1) - 1) * (tableParams.pagination.pageSize || 10),
    sortBy: tableParams.sortField || 'name',
    order: (tableParams.sortOrder || 'ascend') === 'ascend' ? 'asc' : 'desc',
    search: searchText,
    isActive: statusFilter ? statusFilter === 'true' : undefined,
  });

  const { mutate: createPackage, isPending: isCreating } = useCreatePackage();
  const { mutate: updatePackage, isPending: isUpdating } = useUpdatePackage();
  const { mutate: deletePackage, isPending: isDeleting } = useDeletePackage();
  const { mutate: deactivatePackage } = useDeactivatePackageStatus();
  const { mutate: reorderPackages } = useReorderPackages();

  // Get active packages from API response
  const activePackages = activePackagesData?.data?.data ?? [];
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
    const targetPackage = activePackages.find(p => p.position === newPosition);
    if (targetPackage) {
      reorderPackages(
        {
          firstPackageId: pkg.id,
          secondPackageId: targetPackage.id,
        },
        {
          onSuccess: () => {
            message.success('Package positions updated successfully');
            setReorderModalVisible(false);
            setSelectedPackageForReorder(null);
          },
          onError: error => {
            message.error('Failed to update package positions: ' + error.message);
          },
        }
      );
    }
  };

  const handleSubmit = (values: any) => {
    if (drawerMode === 'create') {
      createPackage(values, {
        onSuccess: () => {
          message.success('Package created successfully');
          handleDrawerClose();
        },
        onError: error => {
          message.error('Failed to create package: ' + error.message);
        },
      });
    } else if (drawerMode === 'edit' && editingId) {
      updatePackage(
        { id: editingId, payload: values },
        {
          onSuccess: () => {
            message.success('Package updated successfully');
            handleDrawerClose();
          },
          onError: error => {
            message.error('Failed to update package: ' + error.message);
          },
        }
      );
    }
  };

  const renderActivePackages = (
    packages: PackageData[],
    showDrawer: (mode: 'create' | 'edit' | 'view', record?: PackageData) => void
  ) => {
    // Create an array of 5 positions with empty slots
    const positionedPackages = Array(MAX_ACTIVE_PACKAGES).fill(null);

    // Place packages in their correct positions
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
                className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
                  pkg.isRecommended ? 'border-2 border-blue-500' : ''
                }`}
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
                {pkg.isRecommended && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl text-sm">
                    Recommended
                  </div>
                )}

                {/* Package Header */}
                <div className="text-center mb-6">
                  <Title level={3} style={{ margin: 0 }}>
                    {pkg.name}
                  </Title>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  {pkg.discountAmount > 0 && (
                    <div className="mb-2">
                      <Text delete type="secondary" className="text-lg">
                        ${pkg.originalPrice.toFixed(2)}
                      </Text>
                      <Tag color="green" className="ml-2">
                        {pkg.discountType === 'PERCENT'
                          ? `${pkg.discountAmount}% OFF`
                          : `$${pkg.discountAmount.toFixed(2)} OFF`}
                      </Tag>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <Text strong className="text-4xl">
                      ${calculateFinalPrice(pkg).toFixed(2)}
                    </Text>
                  </div>
                  <Text type="secondary" className="text-sm mt-2 block">
                    {pkg.summary}
                  </Text>
                </div>

                {/* Package Details */}
                <div className="flex-grow mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Full Access:</Text>
                      <Text strong>{pkg.fullAccessDays} days</Text>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text type="secondary">Giveaway Entries:</Text>
                      <Text strong>{pkg.giveawayEntries.toLocaleString()}</Text>
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
                          deactivatePackage(pkg.id, {
                            onSuccess: () => {
                              message.success('Package deactivated successfully');
                            },
                            onError: error => {
                              message.error('Failed to deactivate package: ' + error.message);
                            },
                          });
                        }}
                      />
                    </Tooltip>
                  </Space>
                </div>
              </Card>
            ) : (
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
                <Text type="secondary" className="text-lg">
                  Position {index + 1}
                </Text>
              </Card>
            )}
          </Col>
        ))}
      </Row>
    );
  };

  // Show loading state
  if (isLoadingTable && isLoadingActive && !apiData && !activePackagesData) {
    return <DashboardLoader tip="Loading package management..." />;
  }

  if (error) {
    return <Alert type="error" message="Failed to load packages" description={error.message} />;
  }

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
        items={[
          {
            key: '1',
            label: (
              <div className="flex justify-between items-center w-full">
                <Title level={5} style={{ margin: 0 }}>
                  Currently Active Packages ({activeCount}/{MAX_ACTIVE_PACKAGES})
                </Title>
              </div>
            ),
            children: isLoadingActive ? (
              <DashboardLoader tip="Loading active packages..." />
            ) : (
              renderActivePackages(activePackages, showDrawer)
            ),
          },
        ]}
        defaultActiveKey={['1']}
        className="mb-6"
        style={{ background: '#fff' }}
      />

      <Card styles={{ body: { padding: '24px' } }}>
        <Title level={5}>All Packages</Title>
        <PackageTable
          onShowDrawer={showDrawer}
          loading={isLoadingTable}
          data={apiData?.data?.data || []}
          total={apiData?.data?.meta?.total || 0}
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
        loading={isCreating || isUpdating}
        activeCount={activeCount}
        maxActivePackages={MAX_ACTIVE_PACKAGES}
        onSubmit={handleSubmit}
        onDelete={id => {
          deletePackage(id, {
            onSuccess: () => {
              message.success('Package deleted successfully');
              handleDrawerClose();
            },
            onError: error => {
              message.error('Failed to delete package: ' + error.message);
            },
          });
        }}
      />

      <Modal
        title="Reorder Position"
        open={reorderModalVisible}
        onCancel={() => {
          if (!loadingAction) {
            setReorderModalVisible(false);
            setSelectedPackageForReorder(null);
          }
        }}
        footer={null}
        closable={!loadingAction}
        maskClosable={!loadingAction}
      >
        {selectedPackageForReorder && (
          <div>
            <div className="mb-4">
              <Text>
                Moving: <strong>{selectedPackageForReorder.name}</strong>
              </Text>
            </div>

            <div className="space-y-4">
              {Array(MAX_ACTIVE_PACKAGES)
                .fill(null)
                .map((_, index) => {
                  const position = index + 1;
                  const isLoading =
                    switchingPosition === position &&
                    loadingPackageId === selectedPackageForReorder.id;

                  return (
                    <Button
                      key={position}
                      block
                      onClick={() => handleReorder(selectedPackageForReorder, position)}
                      disabled={
                        position === selectedPackageForReorder.position ||
                        loadingAction === 'reorder'
                      }
                      loading={isLoading}
                    >
                      Position {position}
                    </Button>
                  );
                })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackageList;
