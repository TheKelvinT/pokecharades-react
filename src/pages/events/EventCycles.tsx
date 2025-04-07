import React, { useState } from 'react';
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Tabs,
  Descriptions,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { eventsList } from '../../services/mockData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const EventCycles: React.FC = () => {
  const [data, setData] = useState(eventsList);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Filter events based on status
  const upcomingEvents = data.filter(event => event.status === 'upcoming');
  const pastEvents = data.filter(event => event.status === 'completed');

  // Common columns for both tabs
  const commonColumns = [
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => dayjs(date).format('MMMM D, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          upcoming: 'blue',
          completed: 'green',
          cancelled: 'red',
        };
        return (
          <Tag color={colorMap[status] || 'default'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
  ];

  // Columns specific to upcoming events
  const upcomingColumns = [
    ...commonColumns,
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
            size="small"
            title="View Details"
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
            title="Edit Event"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
            title="Delete Event"
          />
        </Space>
      ),
    },
  ];

  // Columns specific to past events
  const pastColumns = [
    ...commonColumns,
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
      sorter: (a: any, b: any) => a.participants - b.participants,
    },
    {
      title: 'No. of Entries',
      dataIndex: 'entries',
      key: 'entries',
      render: (_: any, record: any) => record.winners?.length || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
            size="small"
            title="View Details"
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
            title="Edit Event"
          />
        </Space>
      ),
    },
  ];

  const showModal = (record?: any) => {
    setEditingId(record?.id || null);
    form.setFieldsValue(
      record
        ? {
            ...record,
            date: record.date ? dayjs(record.date) : null,
          }
        : {
            name: '',
            date: dayjs().add(7, 'day'),
            location: '',
            status: 'upcoming',
            participants: 0,
            content: '',
            winners: [],
          }
    );
    setVisible(true);
  };

  const showDetailModal = (record: any) => {
    setCurrentEvent(record);
    setDetailVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleDetailCancel = () => {
    setDetailVisible(false);
  };

  const handleDelete = (id: number) => {
    const event = data.find(item => item.id === id);
    if (event && event.status !== 'upcoming') {
      message.error('Only upcoming events can be deleted');
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this event?',
      content: 'This action cannot be undone.',
      onOk() {
        setData(data.filter(item => item.id !== id));
        message.success('Event deleted successfully');
      },
    });
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();

      const formattedValues = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
        winners: values.winners || [],
      };

      if (editingId) {
        // Update existing event
        setData(data.map(item => (item.id === editingId ? { ...item, ...formattedValues } : item)));
        message.success('Event updated successfully');
      } else {
        // Create new event
        const newId = Math.max(...data.map(item => item.id), 0) + 1;
        setData([...data, { id: newId, ...formattedValues }]);
        message.success('Event created successfully');
      }
      setVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Event Cycle Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} className="mb-4">
          Create New Event
        </Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          className="mb-4"
        >
          <TabPane tab="Upcoming Events" key="upcoming">
            <Table
              columns={upcomingColumns}
              dataSource={upcomingEvents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Past Events" key="past">
            <Table
              columns={pastColumns}
              dataSource={pastEvents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Event Modal */}
      <Modal
        title={editingId ? 'Edit Event' : 'Create New Event'}
        open={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={700}
      >
        <Form form={form} layout="vertical" name="event_form">
          <Form.Item
            name="name"
            label="Event Name"
            rules={[{ required: true, message: 'Please enter event name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="date"
            label="Event Date"
            rules={[{ required: true, message: 'Please select event date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="upcoming">Upcoming</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="participants"
            label="Estimated Participants"
            rules={[{ required: true, message: 'Please enter participants count' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="content"
            label="Event Description"
            rules={[{ required: true, message: 'Please enter event description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        title="Event Details"
        open={detailVisible}
        onCancel={handleDetailCancel}
        footer={[
          <Button key="close" onClick={handleDetailCancel}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              handleDetailCancel();
              showModal(currentEvent);
            }}
          >
            Edit Event
          </Button>,
        ]}
        width={800}
      >
        {currentEvent && (
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Event Information" key="1">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Event Name">{currentEvent.name}</Descriptions.Item>
                <Descriptions.Item label="Date">
                  {dayjs(currentEvent.date).format('MMMM D, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Location">{currentEvent.location}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      currentEvent.status === 'upcoming'
                        ? 'blue'
                        : currentEvent.status === 'completed'
                          ? 'green'
                          : 'red'
                    }
                  >
                    {currentEvent.status.charAt(0).toUpperCase() + currentEvent.status.slice(1)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Participants">
                  {currentEvent.participants}
                </Descriptions.Item>
                <Descriptions.Item label="Description">{currentEvent.content}</Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <TrophyOutlined />
                  Winners
                </span>
              }
              key="2"
            >
              {currentEvent.winners && currentEvent.winners.length > 0 ? (
                <Table
                  dataSource={currentEvent.winners}
                  rowKey="place"
                  pagination={false}
                  columns={[
                    {
                      title: 'Place',
                      dataIndex: 'place',
                      key: 'place',
                      render: (place: number) => {
                        const colors = ['gold', 'silver', '#cd7f32'];
                        return place <= 3 ? (
                          <Tag color={colors[place - 1]}>
                            {place === 1 ? '1st' : place === 2 ? '2nd' : '3rd'}
                          </Tag>
                        ) : (
                          <span>{place}th</span>
                        );
                      },
                    },
                    { title: 'Member', dataIndex: 'name', key: 'name' },
                    { title: 'Prize', dataIndex: 'prize', key: 'prize' },
                  ]}
                />
              ) : (
                <div className="py-8 text-center">
                  <Text type="secondary">No winners recorded for this event yet.</Text>
                </div>
              )}
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default EventCycles;
