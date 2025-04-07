import React from 'react';
import { Card, Typography, Layout } from 'antd';

const { Title } = Typography;
const { Content } = Layout;

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-md">
          <div className="text-center mb-6">
            {/* <Link to="/">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-16 mx-auto mb-4" 
              />
            </Link> */}
            <Title level={3}>{title}</Title>
          </div>
          {children}
        </Card>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
