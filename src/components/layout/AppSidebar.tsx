import {
  CalendarOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed }) => {
  const location = useLocation();

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['dashboard'];
    if (path.includes('/admin/tiers')) return ['tiers'];
    if (path.includes('/admin/packages')) return ['packages'];
    if (path.includes('/members/subscribed')) return ['subscribed_members'];
    if (path.includes('/members/unsubscribed')) return ['unsubscribed_members'];
    if (path.includes('/partners')) return ['partners'];
    if (path.includes('/events/cycles')) return ['event_cycles'];
    if (path.includes('/events/content')) return ['event_content'];
    if (path.includes('/content')) return ['content_management'];
    return [];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
        margin: 0,
        padding: 0,
      }}
    >
      <div className="h-16 flex items-center justify-center" style={{ margin: 0, padding: 0 }}>
        <h1
          className={`text-white text-xl font-bold ${collapsed ? 'scale-0' : 'scale-100'} transition-all duration-300`}
        >
          Poke Charades
        </h1>
        {collapsed && <div className="text-white text-2xl font-bold">AD</div>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        style={{ margin: 0, padding: 0 }}
        items={[
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/dashboard">Dashboard</Link>,
          },
          {
            key: 'system',
            icon: <SettingOutlined />,
            label: 'System Settings',
            children: [
              {
                key: 'tiers',
                label: <Link to="/admin/tiers">Tier List</Link>,
              },
              {
                key: 'packages',
                label: <Link to="/admin/packages">Packages</Link>,
              },
            ],
          },
          {
            key: 'membership',
            icon: <UserOutlined />,
            label: <Link to="/members">Membership</Link>,
          },
          {
            key: 'partners',
            icon: <TeamOutlined />,
            label: <Link to="/partners">Business Partners</Link>,
          },
          {
            key: 'events',
            icon: <CalendarOutlined />,
            label: 'Event Management',
            children: [
              {
                key: 'event_cycles',
                label: <Link to="/events/cycles">Cycle Management</Link>,
              },
              {
                key: 'event_content',
                label: <Link to="/events/content">Event Content</Link>,
              },
            ],
          },
          {
            key: 'content_management',
            icon: <FileTextOutlined />,
            label: <Link to="/content">Content Management</Link>,
          },
        ]}
      />
    </Sider>
  );
};

export default AppSidebar;
