import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AppRouter from './AppRouter';
import { themeConfig } from './utils/theme';
import 'antd/dist/reset.css';
import Home from './pages/home/Home';

const App: React.FC = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/*" element={<AppRouter />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
