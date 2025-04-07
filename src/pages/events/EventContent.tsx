import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tabs,
  Form,
  Input,
  Select,
  Upload,
  message,
  Space,
  List,
  Avatar,
  Tag,
  Modal,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  FileImageOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { eventsList } from '../../services/mockData';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Mock content items
const mockContents = [
  {
    id: 1,
    title: 'Summer Fest 2023 Banner',
    type: 'image',
    fileUrl: 'https://via.placeholder.com/800x300',
    eventId: 1,
    description: 'Main banner for the Summer Fest event.',
    createdAt: '2023-06-15',
  },
  {
    id: 2,
    title: 'Tech Conference Schedule',
    type: 'document',
    fileUrl: 'https://example.com/docs/schedule.pdf',
    eventId: 2,
    description: 'Detailed schedule for the Tech Conference.',
    createdAt: '2023-04-25',
  },
  {
    id: 3,
    title: 'Fitness Challenge Promo Video',
    type: 'video',
    fileUrl: 'https://example.com/videos/fitness-promo.mp4',
    eventId: 3,
    description: 'Promotional video for the Fitness Challenge event.',
    createdAt: '2023-07-12',
  },
];

const EventContent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [contents, setContents] = useState(mockContents);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);

  const filteredContents = selectedEvent
    ? contents.filter(content => content.eventId === selectedEvent)
    : contents;

  const handleEventChange = (eventId: number) => {
    setSelectedEvent(eventId);
  };

  const handleSubmit = (values: any) => {
    const fileList = values.fileList?.fileList || [];

    if (editMode && editingContent) {
      // Update existing content
      const updated = {
        ...editingContent,
        title: values.title,
        description: values.description,
        type: values.type,
        eventId: values.eventId,
      };

      setContents(contents.map(item => (item.id === editingContent.id ? updated : item)));

      message.success('Content updated successfully');
    } else {
      // Create new content
      const newContent = {
        id: Math.max(...contents.map(item => item.id), 0) + 1,
        title: values.title,
        description: values.description,
        type: values.type,
        eventId: values.eventId,
        fileUrl: fileList.length > 0 ? 'https://via.placeholder.com/800x300' : '',
        createdAt: dayjs().format('YYYY-MM-DD'),
      };

      setContents([...contents, newContent]);
      message.success('Content created successfully');
    }

    setVisible(false);
    setEditMode(false);
    setEditingContent(null);
    form.resetFields();
  };

  const handleEdit = (content: any) => {
    setEditMode(true);
    setEditingContent(content);
    form.setFieldsValue({
      title: content.title,
      description: content.description,
      type: content.type,
      eventId: content.eventId,
    });
    setVisible(true);
  };

  const handleDelete = (contentId: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this content?',
      content: 'This action cannot be undone.',
      onOk() {
        setContents(contents.filter(item => item.id !== contentId));
        message.success('Content deleted successfully');
      },
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Avatar icon={<FileImageOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'document':
        return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#52c41a' }} />;
      case 'video':
        return <Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: '#722ed1' }} />;
      default:
        return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#faad14' }} />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Event Content Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditMode(false);
            setEditingContent(null);
            form.resetFields();
            form.setFieldsValue({ eventId: selectedEvent });
            setVisible(true);
          }}
        >
          Add New Content
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center mb-4">
          <Text strong className="mb-2 sm:mb-0 sm:mr-4">
            Filter by Event:
          </Text>
          <Select
            placeholder="Select an event"
            style={{ width: 300 }}
            allowClear
            onChange={value => setSelectedEvent(value || null)}
          >
            {eventsList.map(event => (
              <Option key={event.id} value={event.id}>
                {event.name}
              </Option>
            ))}
          </Select>
        </div>

        <Divider />

        <List
          itemLayout="horizontal"
          dataSource={filteredContents}
          locale={{ emptyText: 'No content found. Use the button above to add new content.' }}
          renderItem={item => (
            <List.Item
              actions={[
                <Button icon={<EditOutlined />} onClick={() => handleEdit(item)}>
                  Edit
                </Button>,
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={getTypeIcon(item.type)}
                title={
                  <Space>
                    <span>{item.title}</span>
                    <Tag
                      color={
                        item.type === 'image'
                          ? 'blue'
                          : item.type === 'document'
                            ? 'green'
                            : item.type === 'video'
                              ? 'purple'
                              : 'orange'
                      }
                    >
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <p>{item.description}</p>
                    <Text type="secondary">
                      Event:{' '}
                      {eventsList.find(event => event.id === item.eventId)?.name || 'Unknown'}
                    </Text>
                    <div className="mt-2">
                      <Text type="secondary">
                        Created: {dayjs(item.createdAt).format('MMMM D, YYYY')}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editMode ? 'Edit Content' : 'Add New Content'}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Content Title"
            rules={[{ required: true, message: 'Please enter content title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="eventId"
            label="Event"
            rules={[{ required: true, message: 'Please select an event' }]}
          >
            <Select placeholder="Select an event">
              {eventsList.map(event => (
                <Option key={event.id} value={event.id}>
                  {event.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Content Type"
            rules={[{ required: true, message: 'Please select content type' }]}
          >
            <Select placeholder="Select content type">
              <Option value="image">Image</Option>
              <Option value="document">Document</Option>
              <Option value="video">Video</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          {!editMode && (
            <Form.Item
              name="fileList"
              label="Upload File"
              rules={[{ required: true, message: 'Please upload a file' }]}
            >
              <Upload listType="picture" beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editMode ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EventContent;
