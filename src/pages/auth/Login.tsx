import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLogin } from '../../api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import AuthLayout from './AuthLayout';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { mutate: login, isPending } = useLogin({
    onSuccess: data => {
      // Store tokens in Redux
      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      // Navigate to dashboard
      navigate('/dashboard');
    },
  });

  const handleSubmit = (values: { email: string; password: string }) => {
    login(values);
  };

  return (
    <AuthLayout title="Log in to your account">
      <Form name="login" onFinish={handleSubmit} size="large" layout="vertical">
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email Address" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end items-center">
            {/* <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item> */}
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Log In
          </Button>
        </Form.Item>

        {/* <Divider plain>Or</Divider> */}

        {/* <div className="text-center">
          <p>Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-800">Sign Up</Link></p>
        </div> */}
      </Form>
    </AuthLayout>
  );
};

export default Login;
