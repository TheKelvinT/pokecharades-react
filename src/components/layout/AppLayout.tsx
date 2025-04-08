import React, { useState } from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
      <AppSidebar collapsed={collapsed} />
      <Layout style={{ margin: 0, padding: 0 }}>
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          className="site-layout-background"
          style={{
            margin: 0,
            padding: 0,
            minHeight: '100vh',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
