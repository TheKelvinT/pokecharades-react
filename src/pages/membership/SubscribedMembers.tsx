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
  Select,
  DatePicker,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { membersList, packagesList } from '../../services/mockData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const SubscribedMembers: React.FC = () => {
  const subscribedMembers = membersList.filter(member => member.subscribed);
  const [data, setData] = useState(subscribedMembers);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = (record?: any) => {
    setEditingId(record?.id || null);
    form.setFieldsValue(
      record
        ? {
            ...record,
            joinDate: record.joinDate ? dayjs(record.joinDate) : null,
          }
        : {
            name: '',
            email: '',
            status: 'active',
            package: undefined,
            joinDate: dayjs(),
            subscribed: true,
          }
    );
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this member?',
      content: 'This action cannot be undone.',
      onOk() {
        setData(data.filter(item => item.id !== id));
        message.success('Member deleted successfully');
      },
    });
  };

  const handleBlock = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    setData(data.map(item => (item.id === id ? { ...item, status: newStatus } : item)));
    message.success(`Member ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();

      const formattedValues = {
        ...values,
        joinDate: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : null,
      };

      if (editingId) {
        // Update existing member
        setData(data.map(item => (item.id === editingId ? { ...item, ...formattedValues } : item)));
        message.success('Member updated successfully');
      } else {
        // Create new member
        const newId = Math.max(...data.map(item => item.id), 0) + 1;
        setData([...data, { id: newId, ...formattedValues }]);
        message.success('Member created successfully');
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
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Package',
      dataIndex: 'package',
      key: 'package',
      filters: packagesList.map(pkg => ({ text: pkg.name, value: pkg.name })),
      onFilter: (value: any, record: any) => record.package === value,
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a: any, b: any) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      render: (date: string) => dayjs(date).format('MMMM D, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Blocked', value: 'blocked' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'blocked' ? 'red' : 'orange'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Button
            icon={record.status === 'blocked' ? <UnlockOutlined /> : <LockOutlined />}
            onClick={() => handleBlock(record.id, record.status)}
            danger={record.status !== 'blocked'}
          >
            {record.status === 'blocked' ? 'Unblock' : 'Block'}
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
        <Title level={2}>Subscribed Members</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add New Member
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingId ? 'Edit Member' : 'Add New Member'}
        open={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical" name="member_form">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter member name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="package"
            label="Package"
            rules={[{ required: true, message: 'Please select a package' }]}
          >
            <Select placeholder="Select package">
              {packagesList.map(pkg => (
                <Option key={pkg.id} value={pkg.name}>
                  {pkg.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="joinDate" label="Join Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="blocked">Blocked</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item name="subscribed" label="Subscribed" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscribedMembers;
