import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, message, Alert } from 'antd';
import { MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import moment from 'moment';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Forgot password values:', {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
      });
      setLoading(false);
      setSubmitted(true);
      message.success('Password reset link has been sent to your email!');
    }, 1500);
  };

  const disableFutureDates = (current: moment.Moment) => {
    return current && current > moment().endOf('day');
  };

  return (
    <AuthLayout title="Reset your password">
      {!submitted ? (
        <>
          <p className="text-gray-600 mb-6">
            Enter your email address and date of birth to verify your identity. We'll send you a
            link to reset your password.
          </p>
          <Form name="forgot-password" onFinish={onFinish} size="large" layout="vertical">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email Address" />
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: 'Please select your date of birth!' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder="Select Date of Birth"
                disabledDate={disableFutureDates}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Send Reset Link
              </Button>
            </Form.Item>

            <div className="text-center mt-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Back to Login
              </Link>
            </div>
          </Form>
        </>
      ) : (
        <div className="text-center py-4">
          <Alert
            message="Reset Link Sent"
            description="We have sent a password reset link to your email address. Please check your inbox and follow the instructions."
            type="success"
            showIcon
            className="mb-6"
          />
          <Button type="primary" onClick={() => setSubmitted(false)}>
            Try Another Email
          </Button>
          <div className="mt-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
