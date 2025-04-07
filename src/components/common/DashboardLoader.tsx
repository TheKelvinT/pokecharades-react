import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoaderProps {
  tip?: string;
}

const DashboardLoader: React.FC<LoaderProps> = ({ tip = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip={tip} />
    </div>
  );
};

export default DashboardLoader;
