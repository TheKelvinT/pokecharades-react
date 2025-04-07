import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  message,
  Switch,
  Divider,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  LockOutlined,
  MailOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { Title, Text } = Typography;

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notificationForm] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = (values: any) => {
    setLoading(true);
    console.log('Profile form submitted:', values);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Profile updated successfully');
    }, 1000);
  };

  const handlePasswordSubmit = (values: any) => {
    setLoading(true);
    console.log('Password form submitted:', values);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Password updated successfully');
      passwordForm.resetFields();
    }, 1000);
  };

  const handleNotificationSubmit = (values: any) => {
    setLoading(true);
    console.log('Notification settings submitted:', values);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Notification settings updated successfully');
    }, 1000);
  };

  const profileTab = (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+1 234 567 8900',
        role: 'Administrator',
      }}
      onFinish={handleProfileSubmit}
    >
      <div className="flex flex-col md:flex-row gap-8 mb-6">
        <div className="flex flex-col items-center">
          <Avatar size={100} icon={<UserOutlined />} />
          <Upload showUploadList={false}>
            <Button icon={<UploadOutlined />} className="mt-4">
              Change Avatar
            </Button>
          </Upload>
        </div>

        <div className="flex-1">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="role" label="Role">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </div>

      <Divider />

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );

  const securityTab = (
    <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
      <Form.Item
        name="currentPassword"
        label="Current Password"
        rules={[{ required: true, message: 'Please input your current password!' }]}
      >
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[
          { required: true, message: 'Please input your new password!' },
          { min: 8, message: 'Password must be at least 8 characters!' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm New Password"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Please confirm your new password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Update Password
        </Button>
      </Form.Item>
    </Form>
  );

  const notificationsTab = (
    <Form
      form={notificationForm}
      layout="vertical"
      initialValues={{
        emailNotifications: true,
        memberAlerts: true,
        eventAlerts: true,
        systemUpdates: false,
      }}
      onFinish={handleNotificationSubmit}
    >
      <Form.Item name="emailNotifications" label="Email Notifications" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="memberAlerts" label="Member Alerts" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="eventAlerts" label="Event Alerts" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="systemUpdates" label="System Updates" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Preferences
        </Button>
      </Form.Item>
    </Form>
  );

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Profile',
      children: profileTab,
    },
    {
      key: '2',
      label: 'Security',
      children: securityTab,
    },
    {
      key: '3',
      label: 'Notifications',
      children: notificationsTab,
    },
  ];

  return (
    <div>
      <Title level={2}>Account Settings</Title>
      <Card>
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
};

export default AdminSettings;
