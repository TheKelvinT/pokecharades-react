import React, { useState } from 'react';
import {
  Table,
  Button,
  Card,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Alert,
  Divider,
  Row,
  Col,
  Descriptions,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { tiersList } from '../../services/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MAX_ACTIVE_TIERS = 3; // Maximum allowed active tiers

const TierList: React.FC = () => {
  const [data, setData] = useState(tiersList);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Count active tiers
  const activeTiers = data.filter(tier => tier.active);
  const activeCount = activeTiers.length;
  const tierCapacityPercentage = (activeCount / MAX_ACTIVE_TIERS) * 100;

  const showModal = (record?: any) => {
    setEditingId(record?.id || null);
    form.setFieldsValue(
      record
        ? {
            ...record,
            features: record.features.join('\n'),
          }
        : {
            name: '',
            price: 0,
            features: '',
            active: activeCount < MAX_ACTIVE_TIERS, // Default to active if there's room
          }
    );
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this tier?',
      content: 'This action cannot be undone.',
      onOk() {
        setData(data.filter(item => item.id !== id));
        message.success('Tier deleted successfully');
      },
    });
  };

  const handleSetActive = (id: number) => {
    // Check if we're already at the limit
    if (activeCount >= MAX_ACTIVE_TIERS) {
      message.error(
        `Only ${MAX_ACTIVE_TIERS} active tiers are allowed. Please deactivate one first.`
      );
      return;
    }

    setData(
      data.map(item => ({
        ...item,
        active: item.id === id ? true : item.active,
      }))
    );
    message.success('Tier activated successfully');
  };

  const handleSetInactive = (id: number) => {
    setData(
      data.map(item => ({
        ...item,
        active: item.id === id ? false : item.active,
      }))
    );
    message.success('Tier deactivated successfully');
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();

      // Convert string features to array
      const featuresArray = values.features
        .split('\n')
        .filter((feature: string) => feature.trim() !== '');

      // Check if we're adding a new active tier when we're already at the limit
      if (values.active && !editingId && activeCount >= MAX_ACTIVE_TIERS) {
        message.error(
          `Only ${MAX_ACTIVE_TIERS} active tiers are allowed. Please set this tier as inactive.`
        );
        values.active = false;
      }

      // Check if we're changing an inactive tier to active when we're at the limit
      if (values.active && editingId) {
        const currentTier = data.find(item => item.id === editingId);
        if (!currentTier?.active && activeCount >= MAX_ACTIVE_TIERS) {
          message.error(
            `Only ${MAX_ACTIVE_TIERS} active tiers are allowed. Please set this tier as inactive.`
          );
          values.active = false;
        }
      }

      if (editingId) {
        // Update existing tier
        setData(
          data.map(item =>
            item.id === editingId ? { ...item, ...values, features: featuresArray } : item
          )
        );
        message.success('Tier updated successfully');
      } else {
        // Create new tier
        const newId = Math.max(...data.map(item => item.id), 0) + 1;
        setData([...data, { id: newId, ...values, features: featuresArray }]);
        message.success('Tier created successfully');
      }
      setVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Features',
      dataIndex: 'features',
      key: 'features',
      render: (features: string[]) => (
        <ul className="pl-4">
          {features.map((feature, index) => (
            <li key={index} className="list-disc">
              {feature}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          {!record.active ? (
            <Button
              type="default"
              icon={<CheckCircleOutlined />}
              onClick={() => handleSetActive(record.id)}
              disabled={activeCount >= MAX_ACTIVE_TIERS}
            >
              Activate
            </Button>
          ) : (
            <Button type="default" danger onClick={() => handleSetInactive(record.id)}>
              Deactivate
            </Button>
          )}
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Tier Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add New Tier
        </Button>
      </div>

      {/* Current Active Tiers Section */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Title level={4}>Currently Active Tiers</Title>
          <div className="flex items-center">
            <Text className="mr-2">Active Tier Capacity:</Text>
            <Progress
              type="circle"
              percent={tierCapacityPercentage}
              width={50}
              format={() => `${activeCount}/${MAX_ACTIVE_TIERS}`}
              status={activeCount >= MAX_ACTIVE_TIERS ? 'exception' : 'normal'}
            />
          </div>
        </div>
        <Divider />

        {activeTiers.length > 0 ? (
          <Row gutter={[24, 24]}>
            {activeTiers.map(tier => (
              <Col xs={24} sm={12} lg={8} key={tier.id}>
                <Card
                  title={tier.name}
                  bordered
                  hoverable
                  className="h-full flex flex-col"
                  bodyStyle={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px',
                  }}
                >
                  <div>
                    <Text strong className="text-xl">
                      ${tier.price.toFixed(2)}
                    </Text>
                  </div>

                  <div className="flex justify-end mt-auto pt-4">
                    <Space>
                      <Button size="small" onClick={() => showModal(tier)}>
                        Edit
                      </Button>
                      <Button size="small" danger onClick={() => handleSetInactive(tier.id)}>
                        Deactivate
                      </Button>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert
            message="No Active Tiers"
            description="There are currently no active tiers. Please activate at least one tier."
            type="warning"
            showIcon
          />
        )}

        {activeCount >= MAX_ACTIVE_TIERS && (
          <Alert
            message="Maximum Tier Limit Reached"
            description={`You have reached the maximum limit of ${MAX_ACTIVE_TIERS} active tiers. To activate a new tier, please deactivate an existing one first.`}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="mt-4"
          />
        )}
      </Card>

      {/* Tier List Table */}
      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingId ? 'Edit Tier' : 'Add New Tier'}
        open={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical" name="tier_form">
          <Form.Item
            name="name"
            label="Tier Name"
            rules={[{ required: true, message: 'Please enter tier name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber prefix="$" min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="features"
            label="Features (one per line)"
            rules={[{ required: true, message: 'Please enter at least one feature' }]}
          >
            <TextArea
              rows={4}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </Form.Item>

          <Form.Item
            name="active"
            label="Status"
            valuePropName="checked"
            help={
              activeCount >= MAX_ACTIVE_TIERS
                ? `Maximum ${MAX_ACTIVE_TIERS} active tiers allowed`
                : undefined
            }
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              disabled={!editingId && activeCount >= MAX_ACTIVE_TIERS}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TierList;
