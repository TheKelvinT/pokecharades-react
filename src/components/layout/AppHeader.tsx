import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: logout, isPending: isLoggingOut } = useLogout({
    onSuccess: () => {
      dispatch(clearCredentials());
      navigate('/login');
    },
  });

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: 'Profile Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/admin/settings'),
    },
    {
      key: '2',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => logout(),
      disabled: isLoggingOut,
    },
  ];

  return (
    <Header className="flex justify-between items-center px-6 shadow-sm">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        className="text-lg"
      />
      <Dropdown menu={{ items }} placement="bottomRight">
        <Space className="cursor-pointer">
          <Avatar icon={<UserOutlined />} />
          <span className="hidden md:inline">Admin User</span>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
