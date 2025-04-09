import {
  CheckCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  StarFilled,
  StarOutlined,
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
  Tabs,
  Tag,
  Typography,
  message,
  Modal,
} from 'antd';
import React, { useState } from 'react';
import {
  useActiveTiers,
  useTiers,
  useDeactivateTierStatus,
  useSetRecommended,
} from '../../api/tierApi';
import TierDrawer from '../../components/tier/TierDrawer';
import TierTable from '../../components/tier/TierTable';
import { PricingTier } from '../../types/Tier';
import { useTableConfig } from '../../hooks/useTableConfig';
import { TableParams } from '../../types/common/Common';
import DashboardLoader from '../../components/common/DashboardLoader';

const { Title, Text } = Typography;

const MAX_ACTIVE_TIERS = 3; // Maximum allowed active tiers per type (monthly/annual)

// First, let's define the interface for the tier data

// Helper function to calculate final price
const calculateFinalPrice = (tier: PricingTier) => {
  const price = tier.originalPrice || 0;
  const discount = tier.discountAmount || 0;

  if (tier.discountType === 'PERCENT') {
    return price * (1 - discount / 100);
  }
  return price - discount;
};

const TierList: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PricingTier | undefined>();
  const [confirmLoading, _] = useState(false);
  const [activeTab, setActiveTab] = useState<'monthly' | 'annual'>('monthly');

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
  const [recommendedFilter, setRecommendedFilter] = useState<string | undefined>();

  // Separate query for active tiers
  const { data: activetiersData, isLoading: isLoadingActiveTiers } = useActiveTiers({
    tierType: activeTab === 'monthly' ? 'MONTHLY' : 'YEARLY',
  });
  console.log('activetiersData', activetiersData);
  // Regular query for table data
  const {
    data: apiData,
    isLoading: isLoadingTable,
    error,
  } = useTiers({
    tierType: activeTab === 'monthly' ? 'MONTHLY' : 'YEARLY',
    take: tableParams.pagination.pageSize,
    skip: ((tableParams.pagination.current || 1) - 1) * (tableParams.pagination.pageSize || 10),
    sortBy: tableParams.sortField || 'name',
    order: (tableParams.sortOrder || 'ascend') === 'ascend' ? 'asc' : 'desc',
    search: searchText,
    isActive: statusFilter ? statusFilter === 'true' : undefined,
    isRecommended: recommendedFilter ? recommendedFilter === 'true' : undefined,
  });

  // Move hooks to component level
  const { mutate: deactivateTierStatus, isPending: isDeactivatingStatus } =
    useDeactivateTierStatus();
  const { mutate: setRecommended, isPending: isSettingRecommended } = useSetRecommended();

  // Handler for table changes
  const handleTableConfigChange = (
    newTableParams: TableParams,
    filters: {
      search?: string;
      status?: string;
      recommended?: string;
    }
  ) => {
    handleTableChange(newTableParams.pagination, newTableParams.filters || {}, {
      field: newTableParams.sortField,
      order: newTableParams.sortOrder,
    });
    setSearchText(filters.search || '');
    setStatusFilter(filters.status);
    setRecommendedFilter(filters.recommended);
  };

  // Get active tiers from separate API response
  const activeTiers = activetiersData?.data?.data ?? [];
  const activeCount = activeTiers.filter(
    tier => tier.tierType === (activeTab === 'monthly' ? 'MONTHLY' : 'YEARLY')
  ).length;

  const showDrawer = (mode: 'create' | 'edit' | 'view', record?: PricingTier) => {
    setDrawerMode(mode);
    setEditingId(record?.id || null);
    setSelectedTier(record);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setSelectedTier(undefined);
  };

  // Update renderActiveTiers to accept mutation functions
  const renderActiveTiers = (
    tiers: PricingTier[],
    showDrawer: (mode: 'create' | 'edit' | 'view', record?: PricingTier) => void
  ) => {
    const handleSetRecommended = (tier: PricingTier) => {
      const existingRecommended = tiers.find(t => t.isRecommended && t.id !== tier.id);

      Modal.confirm({
        title: 'Set as Recommended Tier',
        content: existingRecommended
          ? `This will remove the recommended status from "${existingRecommended.name}" and set "${tier.name}" as the recommended tier. Continue?`
          : `Set "${tier.name}" as the recommended tier?`,
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          setRecommended(tier.id, {
            onSuccess: () => {
              message.success('Recommended tier updated successfully');
            },
            onError: error => {
              message.error('Failed to update recommended tier: ' + error.message);
            },
          });
        },
      });
    };

    if (tiers.length === 0) {
      return (
        <Alert
          message="No Active Tiers"
          description="There are currently no active tiers. Please activate at least one tier."
          type="warning"
          showIcon
        />
      );
    }

    // Create an array of 3 positions with empty slots
    const positionedTiers = Array(MAX_ACTIVE_TIERS).fill(null);

    // Place tiers in their correct positions (converting from 1-based to 0-based index)
    tiers.forEach(tier => {
      if (tier.position && tier.position >= 1 && tier.position <= MAX_ACTIVE_TIERS) {
        positionedTiers[tier.position - 1] = tier;
      }
    });

    return (
      <Row gutter={[16, 16]} className="py-4">
        {positionedTiers.map((tier, index) => (
          <Col xs={24} sm={24} md={8} key={tier?.id || `empty-${index}`}>
            {tier ? (
              // Render actual tier card
              <Card
                className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
                  tier.isRecommended ? 'border-2 border-blue-500' : ''
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
                {tier.isRecommended && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl text-sm">
                    Recommended
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-6">
                  <Title
                    level={3}
                    style={{ margin: 0, color: tier.isRecommended ? '#1890ff' : undefined }}
                  >
                    {tier.name}
                  </Title>
                  <Text type="secondary" className="text-sm">
                    {tier.summary}
                  </Text>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  {tier.discountAmount > 0 && (
                    <Text delete type="secondary" className="text-lg">
                      ${tier.originalPrice.toFixed(2)}
                    </Text>
                  )}
                  <div className="flex items-center justify-center">
                    <Text strong className="text-4xl">
                      ${calculateFinalPrice(tier).toFixed(2)}
                    </Text>
                    <Text type="secondary" className="ml-2">
                      /{tier.tierType === 'MONTHLY' ? 'mo' : 'yr'}
                    </Text>
                  </div>
                  {tier.discountAmount > 0 && (
                    <Tag color="green" className="mt-2">
                      Save{' '}
                      {tier.discountType === 'PERCENT'
                        ? `${tier.discountAmount}%`
                        : `$${tier.discountAmount.toFixed(2)}`}
                    </Tag>
                  )}
                </div>

                {/* Benefits List */}
                <div className="flex-grow mb-6">
                  <div className="mb-4">
                    <Text strong>Includes:</Text>
                  </div>
                  <ul className="list-none p-0">
                    {tier.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start mb-3">
                        <CheckCircleOutlined className="text-green-500 mr-2 mt-1" />
                        <Text>{benefit}</Text>
                      </li>
                    ))}
                    <li className="flex items-start mb-3">
                      <CheckCircleOutlined className="text-green-500 mr-2 mt-1" />
                      <Text>
                        <span className="font-bold">{tier.monthlyEntries}</span> monthly entries
                      </Text>
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-6 border-t">
                  <Space className="w-full justify-end">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => showDrawer('view', tier)}
                      title="View Details"
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => showDrawer('edit', tier)}
                      title="Edit"
                    />
                    <Button
                      type="text"
                      icon={
                        tier.isRecommended ? (
                          <StarFilled style={{ color: '#faad14' }} />
                        ) : (
                          <StarOutlined />
                        )
                      }
                      onClick={() => handleSetRecommended(tier)}
                      disabled={isSettingRecommended}
                      title={tier.isRecommended ? 'Remove Recommended' : 'Set as Recommended'}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<StopOutlined />}
                      onClick={() => {
                        deactivateTierStatus(tier.id, {
                          onSuccess: () => {
                            message.success('Tier deactivated successfully');
                          },
                          onError: error => {
                            message.error('Failed to deactivate tier: ' + error.message);
                          },
                        });
                      }}
                      disabled={isDeactivatingStatus}
                      title="Deactivate"
                    />
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

  // Update getCollapseItems to pass mutation functions
  const getCollapseItems = (type: 'monthly' | 'annual') => {
    const currentTiers = activeTiers.filter(
      tier => tier.tierType === (type === 'monthly' ? 'MONTHLY' : 'YEARLY')
    );
    const typeActiveCount = currentTiers.length;

    return [
      {
        key: '1',
        label: (
          <Title level={5} style={{ margin: 0, marginRight: '24px' }}>
            Currently Active {type === 'monthly' ? 'Monthly' : 'Annual'} Tiers ({typeActiveCount}/
            {MAX_ACTIVE_TIERS})
          </Title>
        ),
        children: isLoadingActiveTiers ? (
          <DashboardLoader tip="Loading active tiers..." />
        ) : (
          renderActiveTiers(currentTiers, showDrawer)
        ),
      },
    ];
  };

  // Define tab items for the Tabs component
  const tabItems = [
    {
      key: 'monthly',
      label: 'Monthly Tiers',
      children: (
        <>
          <Collapse
            items={getCollapseItems('monthly')}
            defaultActiveKey={['1']}
            className="mb-6"
            style={{ background: '#fff' }}
          />
          <Card styles={{ body: { padding: '24px' } }}>
            <Title level={5}>Monthly Tiers</Title>
            <TierTable
              tierType="MONTHLY"
              onShowDrawer={showDrawer}
              loading={isLoadingTable}
              data={apiData?.data.data || []}
              total={apiData?.data?.meta?.total || 0}
              tableParams={tableParams}
              onTableChange={handleTableConfigChange}
              filters={{
                searchText,
                statusFilter,
                recommendedFilter,
              }}
            />
          </Card>
        </>
      ),
    },
    {
      key: 'annual',
      label: 'Annual Tiers',
      children: (
        <>
          <Collapse
            items={getCollapseItems('annual')}
            defaultActiveKey={['1']}
            className="mb-6"
            style={{ background: '#fff' }}
          />
          <Card styles={{ body: { padding: '24px' } }}>
            <Title level={5}>Annual Tiers</Title>
            <TierTable
              tierType="YEARLY"
              onShowDrawer={showDrawer}
              loading={isLoadingTable}
              data={apiData?.data.data || []}
              total={apiData?.data?.meta?.total || 0}
              tableParams={tableParams}
              onTableChange={handleTableConfigChange}
              filters={{
                searchText,
                statusFilter,
                recommendedFilter,
              }}
            />
          </Card>
        </>
      ),
    },
  ];

  // Show loading state only when both queries are loading and we have no data
  if (isLoadingTable && isLoadingActiveTiers && !apiData && !activetiersData) {
    return <DashboardLoader tip="Loading tier management..." />;
  }

  if (error) {
    return <Alert type="error" message="Failed to load tiers" description={error.message} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Tier Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showDrawer('create')}
          disabled={activeCount >= MAX_ACTIVE_TIERS}
        >
          Add New Tier
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={key => setActiveTab(key as 'monthly' | 'annual')}
        className="mb-6"
      />

      <TierDrawer
        open={drawerOpen}
        mode={drawerMode}
        editingId={editingId}
        tierData={selectedTier}
        onClose={handleDrawerClose}
        setDrawerMode={setDrawerMode}
        loading={confirmLoading}
        activeCount={activeCount}
        maxActiveTiers={MAX_ACTIVE_TIERS}
      />
    </div>
  );
};

export default TierList;
