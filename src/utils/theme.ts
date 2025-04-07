import { ThemeConfig, theme } from 'antd';

export const themeConfig: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1677ff',
  },
  components: {
    Button: {
      colorPrimaryHover: '#4096ff',
    },
    Card: {
      colorBgContainer: '#ffffff',
    },
  },
};
