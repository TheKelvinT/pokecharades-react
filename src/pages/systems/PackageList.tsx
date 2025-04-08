import React, { useState } from 'react';
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Alert,
  Divider,
  Row,
  Col,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { packagesList, tiersList } from '../../services/mockData';

const { Title, Text } = Typography;
const { Option } = Select;

const MAX_ACTIVE_PACKAGES = 5; // Maximum allowed active packages

const PackageList: React.FC = () => {
  const [data, setData] = useState(packagesList);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Count active packages
  const activePackages = data.filter(pkg => pkg.active);
  const activeCount = activePackages.length;
  const packageCapacityPercentage = (activeCount / MAX_ACTIVE_PACKAGES) * 100;

  const showModal = (record?: any) => {
    setEditingId(record?.id || null);
    form.setFieldsValue(
      record || {
        name: '',
        tier: undefined,
        duration: 1,
        price: 0,
        discount: 0,
        active: activeCount < MAX_ACTIVE_PACKAGES, // Default to active if there's room
      }
    );
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this package?',
      content: 'This action cannot be undone.',
      onOk() {
        setData(data.filter(item => item.id !== id));
        message.success('Package deleted successfully');
      },
    });
  };

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    // If trying to activate and already at limit
    if (!currentStatus && activeCount >= MAX_ACTIVE_PACKAGES) {
      message.error(
        `Only ${MAX_ACTIVE_PACKAGES} active packages are allowed. Please deactivate one first.`
      );
      return;
    }

    setData(data.map(item => (item.id === id ? { ...item, active: !currentStatus } : item)));
    message.success(`Package ${currentStatus ? 'deactivated' : 'activated'} successfully`);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();

      // Check if we're adding a new active package when we're already at the limit
      if (values.active && !editingId && activeCount >= MAX_ACTIVE_PACKAGES) {
        message.error(
          `Only ${MAX_ACTIVE_PACKAGES} active packages are allowed. Please set this package as inactive.`
        );
        values.active = false;
      }

      // Check if we're changing an inactive package to active when we're at the limit
      if (values.active && editingId) {
        const currentPackage = data.find(item => item.id === editingId);
        if (!currentPackage?.active && activeCount >= MAX_ACTIVE_PACKAGES) {
          message.error(
            `Only ${MAX_ACTIVE_PACKAGES} active packages are allowed. Please set this package as inactive.`
          );
          values.active = false;
        }
      }

      if (editingId) {
        // Update existing package
        setData(data.map(item => (item.id === editingId ? { ...item, ...values } : item)));
        message.success('Package updated successfully');
      } else {
        // Create new package
        const newId = Math.max(...data.map(item => item.id), 0) + 1;
        setData([...data, { id: newId, ...values }]);
        message.success('Package created successfully');
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
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} ${duration === 1 ? 'month' : 'months'}`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number) => (discount > 0 ? `${discount}%` : '-'),
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
          <Button
            type={record.active ? 'default' : 'primary'}
            icon={<CheckCircleOutlined />}
            onClick={() => handleToggleActive(record.id, record.active)}
            disabled={!record.active && activeCount >= MAX_ACTIVE_PACKAGES}
          >
            {record.active ? 'Deactivate' : 'Activate'}
          </Button>
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
        <Title level={2}>Package Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add New Package
        </Button>
      </div>

      {/* Current Active Packages Section */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Title level={4}>Currently Active Packages</Title>
          <div className="flex items-center">
            <Text className="mr-2">Active Package Capacity:</Text>
            <Progress
              type="circle"
              percent={packageCapacityPercentage}
              width={50}
              format={() => `${activeCount}/${MAX_ACTIVE_PACKAGES}`}
              status={activeCount >= MAX_ACTIVE_PACKAGES ? 'exception' : 'normal'}
            />
          </div>
        </div>
        <Divider />

        {activePackages.length > 0 ? (
          <Row gutter={[24, 24]}>
            {activePackages.map(pkg => (
              <Col xs={24} sm={12} lg={8} key={pkg.id}>
                <Card
                  title={pkg.name}
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
                      ${pkg.price.toFixed(2)}
                    </Text>

                    <div className="mt-2">
                      <div>
                        <Text type="secondary">Tier:</Text> {pkg.tier}
                      </div>
                      <div>
                        <Text type="secondary">Duration:</Text> {pkg.duration}{' '}
                        {pkg.duration === 1 ? 'month' : 'months'}
                      </div>
                      {pkg.discount > 0 && (
                        <div>
                          <Text type="secondary">Discount:</Text>{' '}
                          <Text type="success">{pkg.discount}%</Text>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-auto pt-4">
                    <Space>
                      <Button size="small" onClick={() => showModal(pkg)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => handleToggleActive(pkg.id, pkg.active)}
                      >
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
            message="No Active Packages"
            description="There are currently no active packages. Please activate at least one package to make it available to members."
            type="warning"
            showIcon
          />
        )}

        {activeCount >= MAX_ACTIVE_PACKAGES && (
          <Alert
            message="Maximum Package Limit Reached"
            description={`You have reached the maximum limit of ${MAX_ACTIVE_PACKAGES} active packages. To activate a new package, please deactivate an existing one first.`}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="mt-4"
          />
        )}
      </Card>

      {/* Package List Table */}
      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingId ? 'Edit Package' : 'Add New Package'}
        open={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical" name="package_form">
          <Form.Item
            name="name"
            label="Package Name"
            rules={[{ required: true, message: 'Please enter package name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tier"
            label="Tier"
            rules={[{ required: true, message: 'Please select a tier' }]}
          >
            <Select placeholder="Select tier">
              {tiersList.map(tier => (
                <Option key={tier.id} value={tier.name}>
                  {tier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (months)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber prefix="$" min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="discount"
            label="Discount (%)"
            rules={[{ required: true, message: 'Please enter discount' }]}
          >
            <InputNumber min={0} max={100} precision={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="active"
            label="Status"
            valuePropName="checked"
            help={
              activeCount >= MAX_ACTIVE_PACKAGES
                ? `Maximum ${MAX_ACTIVE_PACKAGES} active packages allowed`
                : undefined
            }
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              disabled={!editingId && activeCount >= MAX_ACTIVE_PACKAGES}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PackageList;
