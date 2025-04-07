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
  Switch,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { partnersList } from '../../services/mockData';

const { Title } = Typography;

const Partners: React.FC = () => {
  const [data, setData] = useState(partnersList);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = (record?: any) => {
    setEditingId(record?.id || null);
    form.setFieldsValue(
      record || {
        name: '',
        contactPerson: '',
        email: '',
        promoCode: '',
        discount: 0,
        active: true,
      }
    );
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this partner?',
      content: 'This action cannot be undone.',
      onOk() {
        setData(data.filter(item => item.id !== id));
        message.success('Partner deleted successfully');
      },
    });
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();

      if (editingId) {
        // Update existing partner
        setData(data.map(item => (item.id === editingId ? { ...item, ...values } : item)));
        message.success('Partner updated successfully');
      } else {
        // Create new partner
        const newId = Math.max(...data.map(item => item.id), 0) + 1;
        setData([...data, { id: newId, ...values }]);
        message.success('Partner created successfully');
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
      title: 'Partner Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Promo Code',
      dataIndex: 'promoCode',
      key: 'promoCode',
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number) => `${discount}%`,
      sorter: (a: any, b: any) => a.discount - b.discount,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: any) => record.active === value,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
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
        <Title level={2}>Business Partners</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add New Partner
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingId ? 'Edit Partner' : 'Add New Partner'}
        open={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical" name="partner_form">
          <Form.Item
            name="name"
            label="Partner Name"
            rules={[{ required: true, message: 'Please enter partner name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label="Contact Person"
            rules={[{ required: true, message: 'Please enter contact person' }]}
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
            name="promoCode"
            label="Promo Code"
            rules={[{ required: true, message: 'Please enter promo code' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="discount"
            label="Discount (%)"
            rules={[{ required: true, message: 'Please enter discount' }]}
          >
            <InputNumber min={0} max={100} precision={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Partners;
