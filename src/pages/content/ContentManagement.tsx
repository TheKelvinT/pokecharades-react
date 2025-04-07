import React, { useState } from 'react';
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Select,
} from 'antd';
import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface ContentSection {
  id: number;
  title: string;
  content: string;
  type: string;
  lastUpdated: string;
}

interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'rich-text' | 'image' | 'link';
  required?: boolean;
}

interface ContentTemplate {
  [key: string]: {
    title: string;
    fields: TemplateField[];
  };
}

const ContentManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentSection | null>(null);
  const [activeTab, setActiveTab] = useState('main');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Sample initial data - in real app this would come from API
  const [data, setData] = useState<ContentSection[]>([
    {
      id: 1,
      title: 'Hero Section',
      content: 'Welcome to our platform...',
      type: 'main',
      lastUpdated: '2024-03-15',
    },
    {
      id: 2,
      title: 'About Us',
      content: 'We are a leading platform...',
      type: 'main',
      lastUpdated: '2024-03-14',
    },
    {
      id: 3,
      title: 'Privacy Policy',
      content: 'This privacy policy sets out how...',
      type: 'legal',
      lastUpdated: '2024-03-10',
    },
  ]);

  const columns = [
    {
      title: 'Section Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: ContentSection) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            size="small"
            title="Preview Content"
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            title="Edit Content"
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (record: ContentSection) => {
    setCurrentContent(record);
    form.setFieldsValue(record);
    setVisible(true);
  };

  const handlePreview = (record: ContentSection) => {
    setCurrentContent(record);
    setPreviewVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = data.map(item =>
        item.id === currentContent?.id
          ? {
              ...item,
              ...values,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : item
      );
      setData(updatedData);
      setVisible(false);
      message.success('Content updated successfully');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const contentTypes = {
    main: ['Hero Section', 'About Section', 'Call to Action', 'Features', 'Articles'],
    legal: ['Privacy Policy', 'Terms and Conditions', 'Refund Policy'],
    footer: ['Footer Links', 'Contact Information', 'Social Media Links'],
  };

  const filterContentByType = (type: string) => {
    return data.filter(item => item.type === type);
  };

  const contentTemplates: ContentTemplate = {
    'hero-section': {
      title: 'Hero Section',
      fields: [
        { name: 'heading', label: 'Main Heading', type: 'text', required: true },
        { name: 'subheading', label: 'Sub Heading', type: 'text', required: true },
        { name: 'backgroundImage', label: 'Background Image URL', type: 'image', required: true },
        { name: 'ctaText', label: 'CTA Button Text', type: 'text', required: true },
        { name: 'ctaLink', label: 'CTA Button Link', type: 'link', required: true },
      ],
    },
    'about-section': {
      title: 'About Section',
      fields: [
        { name: 'heading', label: 'Section Heading', type: 'text', required: true },
        { name: 'content', label: 'Main Content', type: 'rich-text', required: true },
        { name: 'image', label: 'Section Image URL', type: 'image' },
      ],
    },
    'privacy-policy': {
      title: 'Privacy Policy',
      fields: [
        { name: 'lastUpdated', label: 'Last Updated Date', type: 'text', required: true },
        { name: 'content', label: 'Policy Content', type: 'rich-text', required: true },
      ],
    },
    footer: {
      title: 'Footer',
      fields: [
        { name: 'companyInfo', label: 'Company Information', type: 'rich-text', required: true },
        { name: 'links', label: 'Quick Links', type: 'rich-text', required: true },
        { name: 'socialLinks', label: 'Social Media Links', type: 'rich-text', required: true },
      ],
    },
  };

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    form.resetFields();
  };

  const renderTemplateFields = (fields: TemplateField[]) => {
    return fields.map(field => (
      <Form.Item
        key={field.name}
        name={field.name}
        label={field.label}
        rules={[{ required: field.required, message: `Please input ${field.label}!` }]}
      >
        {field.type === 'rich-text' ? (
          <ReactQuill theme="snow" style={{ height: '200px', marginBottom: '50px' }} />
        ) : field.type === 'textarea' ? (
          <TextArea rows={4} />
        ) : field.type === 'image' ? (
          <Input placeholder="Enter image URL" />
        ) : (
          <Input />
        )}
      </Form.Item>
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Landing Page Content Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create New Content
        </Button>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Main Sections" key="main">
            <Table columns={columns} dataSource={filterContentByType('main')} rowKey="id" />
          </TabPane>
          <TabPane tab="Legal Content" key="legal">
            <Table columns={columns} dataSource={filterContentByType('legal')} rowKey="id" />
          </TabPane>
          <TabPane tab="Footer Content" key="footer">
            <Table columns={columns} dataSource={filterContentByType('footer')} rowKey="id" />
          </TabPane>
        </Tabs>
      </Card>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${currentContent?.title}`}
        open={visible}
        onOk={handleSave}
        onCancel={() => setVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Section Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <ReactQuill theme="snow" style={{ height: '300px', marginBottom: '50px' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`Preview: ${currentContent?.title}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div
          dangerouslySetInnerHTML={{ __html: currentContent?.content || '' }}
          className="preview-content"
        />
      </Modal>

      {/* Add this new Create Modal */}
      <Modal
        title="Create New Content"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <Select
            style={{ width: '100%' }}
            placeholder="Select content template"
            onChange={handleTemplateSelect}
            value={selectedTemplate}
          >
            {Object.entries(contentTemplates).map(([key, template]) => (
              <Select.Option key={key} value={key}>
                {template.title}
              </Select.Option>
            ))}
          </Select>
        </div>

        {selectedTemplate && (
          <Form
            form={form}
            layout="vertical"
            onFinish={values => {
              // Handle form submission
              const newContent = {
                id: Date.now(),
                title: contentTemplates[selectedTemplate].title,
                content: JSON.stringify(values),
                type: selectedTemplate.includes('legal')
                  ? 'legal'
                  : selectedTemplate.includes('footer')
                    ? 'footer'
                    : 'main',
                lastUpdated: new Date().toISOString().split('T')[0],
              };
              setData([...data, newContent]);
              setCreateModalVisible(false);
              form.resetFields();
              message.success('Content created successfully');
            }}
          >
            {renderTemplateFields(contentTemplates[selectedTemplate].fields)}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
                <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ContentManagement;
