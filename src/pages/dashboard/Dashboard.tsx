import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  DollarOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, List, Row, Space, Statistic, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLoader from '../../components/common/DashboardLoader';
import { quickActions, summaryNumbers } from '../../services/mockData';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const iconMap: any = {
    user: <UserOutlined />,
    dollar: <DollarOutlined />,
    calendar: <CalendarOutlined />,
    team: <TeamOutlined />,
    'user-add': <UserOutlined />,
    gift: <PlusOutlined />,
  };

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchData = async () => {
      // Set loading true when fetching starts
      setLoading(true);

      // Simulate API delay
      setTimeout(() => {
        // Sample data
        const data = {
          totalMembers: 1250,
          activeMemberships: 980,
          upcomingEvents: 5,
          completedEvents: 12,
        };

        setDashboardData(data);
        setLoading(false);
      }, 1000); // 3 second delay to clearly see the loader
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardLoader tip="Loading dashboard data..." />;
  }

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Title level={2}>Dashboard</Title>
        </Col>

        {/* Summary Numbers */}
        {summaryNumbers.map(item => (
          <Col xs={24} sm={12} xl={6} key={item.id}>
            <Card hoverable>
              <Statistic
                title={item.title}
                value={item.value}
                precision={0}
                valueStyle={{ color: item.change >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={iconMap[item.icon]}
                suffix={
                  <Space>
                    {item.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    <span>{Math.abs(item.change)}%</span>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}

        {/* Quick Actions */}
        <Col span={24}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              {quickActions.map(action => (
                <Col xs={12} sm={8} md={6} key={action.id}>
                  <Link to={action.path}>
                    <Button
                      icon={iconMap[action.icon]}
                      size="large"
                      className="w-full h-24 flex flex-col justify-center items-center gap-2"
                    >
                      <span>{action.title}</span>
                    </Button>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Recent Activities - Simplified for mockup */}
        <Col span={24}>
          <Card title="Recent Activities">
            <List
              itemLayout="horizontal"
              dataSource={[
                { id: 1, title: 'New member registered', time: '2 hours ago' },
                { id: 2, title: 'Package "Yearly Premium" updated', time: '5 hours ago' },
                { id: 3, title: 'New event created: "Summer Fest 2023"', time: '1 day ago' },
                { id: 4, title: 'Partner "Acme Corp" added', time: '2 days ago' },
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={item.title} description={item.time} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
