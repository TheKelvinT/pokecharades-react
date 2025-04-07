import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AppRouter from './AppRouter';
import { themeConfig } from './utils/theme';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
