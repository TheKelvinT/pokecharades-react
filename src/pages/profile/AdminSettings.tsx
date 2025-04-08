import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  Select,
  Space,
  message,
  Alert,
  Spin,
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useChangePassword } from '../../api/authApi';
import { useAdminProfile } from '../../api/profileApi';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: profileData, isLoading: isLoadingProfile } = useAdminProfile();

  // Add the new mutation hook
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword({
    onSuccess: () => {
      // message.success('Password updated successfully');
      setShowPasswordForm(false);
      passwordForm.resetFields();
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || 'Failed to update password');
      } else {
        message.error('Failed to update password');
      }
    },
  });

  const handleProfileSubmit = (values: any) => {
    setLoading(true);
    console.log('Profile form submitted:', values);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      message.success('Profile updated successfully');
    }, 1000);
  };

  const handlePasswordSubmit = (values: any) => {
    // Extract only the fields needed for the API
    const passwordData = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };

    // Call the API
    changePassword(passwordData);
  };

  const startEditing = () => {
    form.setFieldsValue(profileData);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const togglePasswordForm = () => {
    if (showPasswordForm) {
      passwordForm.resetFields();
    }
    setShowPasswordForm(!showPasswordForm);
  };

  // Password validation pattern
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Prefixes for the phone input
  const prefixSelector = (
    <Form.Item name="countryCode" noStyle>
      <Select style={{ width: 80 }}>
        <Option value="+1">+1</Option>
        <Option value="+44">+44</Option>
        <Option value="+61">+61</Option>
        <Option value="+86">+86</Option>
        <Option value="+91">+91</Option>
      </Select>
    </Form.Item>
  );

  return (
    <div className="min-h-screen p-6">
      <Title level={2}>Admin Settings</Title>

      {/* Admin Information Section */}
      <Card
        title="Admin Information"
        extra={
          !isEditing &&
          !isLoadingProfile && (
            <Button type="primary" icon={<EditOutlined />} onClick={startEditing}>
              Edit
            </Button>
          )
        }
        className="mb-6"
      >
        <div className="min-h-[150px]">
          {isLoadingProfile ? (
            <div className="flex items-center justify-center ">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            </div>
          ) : isEditing ? (
            <Form
              form={form}
              layout="vertical"
              initialValues={profileData}
              onFinish={handleProfileSubmit}
              validateTrigger={['onBlur']}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    validateTrigger={['onBlur']}
                    rules={[{ required: true, message: 'Please input your first name' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    validateTrigger={['onBlur']}
                    rules={[{ required: true, message: 'Please input your last name' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item name="email" label="Email">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    validateTrigger={['onBlur']}
                    rules={[{ required: true, message: 'Please input your phone number' }]}
                  >
                    <Input addonBefore={prefixSelector} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item name="role" label="Role">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Save
                  </Button>
                  <Button onClick={cancelEditing} icon={<CloseOutlined />}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="mb-2">
                    <div className="text-gray-500">First Name</div>
                    <div className="font-medium">{profileData?.data.firstName}</div>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <div className="mb-2">
                    <div className="text-gray-500">Last Name</div>
                    <div className="font-medium">{profileData?.data.lastName}</div>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <div className="mb-2">
                    <div className="text-gray-500">Email</div>
                    <div className="font-medium">{profileData?.data.email}</div>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <div className="mb-2">
                    <div className="text-gray-500">Phone</div>
                    <div className="font-medium">
                      {profileData?.data.countryCode} {profileData?.data.phoneNumber}
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <div className="mb-2">
                    <div className="text-gray-500">Role</div>
                    <div className="font-medium">{profileData?.data.role}</div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Card>

      {/* Security Section */}
      <Card title="Security">
        {showPasswordForm ? (
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
            validateTrigger={['onBlur']}
          >
            <Alert
              message="Password Requirements"
              description="Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
              type="info"
              showIcon
              className="mb-4"
            />

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  validateTrigger={['onBlur']}
                  rules={[{ required: true, message: 'Please input your current password' }]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="newPassword"
                  label="New Password"
                  validateTrigger={['onBlur']}
                  rules={[
                    { required: true, message: 'Please input your new password' },
                    { min: 8, message: 'Password must be at least 8 characters' },
                    {
                      pattern: passwordPattern,
                      message:
                        'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  validateTrigger={['onBlur']}
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isChangingPassword}
                  icon={<SaveOutlined />}
                >
                  Update Password
                </Button>
                <Button onClick={togglePasswordForm} icon={<CloseOutlined />}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <div>
            <Space direction="vertical" className="w-full">
              <Text>Change your password to maintain account security.</Text>
              <Button type="primary" icon={<LockOutlined />} onClick={togglePasswordForm}>
                Change Password
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminSettings;
