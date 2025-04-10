import { MinusCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  message,
  Modal,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { tiersList } from '../../services/mockData';

const { Text } = Typography;

interface PackageData {
  id?: string;
  name: string;

  price: number;
  discount: number;
  isActive: boolean;
  giveawayEntries?: number;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PackageDrawerProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  editingId?: string | null;
  packageData?: PackageData;
  setDrawerMode: (mode: 'create' | 'edit' | 'view') => void;
  onClose: () => void;
  loading?: boolean;
  activeCount?: number;
  maxActivePackages?: number;
  onSubmit: (values: any) => void;
  onDelete?: (id: string) => void;
}

const PackageDrawer: React.FC<PackageDrawerProps> = ({
  open,
  mode,
  editingId,
  setDrawerMode,
  packageData,
  onClose,
  loading,
  activeCount = 0,
  maxActivePackages = 5,
  onSubmit,
  onDelete,
}) => {
  const [form] = Form.useForm();
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // Watch form fields
  const isActive = Form.useWatch('active', form);
  const price = Form.useWatch('price', form);
  const discount = Form.useWatch('discount', form);

  // Effect for form reset and initial values
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
    if (open && mode !== 'create' && packageData) {
      form.setFieldsValue({
        ...packageData,
        active: packageData.isActive,
        position: packageData.position || null,
      });
    }
  }, [open, form, mode, packageData]);

  // Effect for calculating final price
  useEffect(() => {
    if (price && discount) {
      const finalPrice = price * (1 - discount / 100);
      setCalculatedPrice(finalPrice);
    } else {
      setCalculatedPrice(price || null);
    }
  }, [price, discount]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,

        price: values.price,
        discount: values.discount || 0,
        giveawayEntries: values.giveawayEntries,
        ...(mode === 'edit' && {
          isActive: values.active,
          // Only include position if the package is active
          ...(values.active && { position: values.position }),
        }),
      };

      onSubmit(payload);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = () => {
    if (!packageData?.id) return;

    if (packageData.isActive) {
      message.error('Cannot delete an active package. Please deactivate it first.');
      return;
    }

    Modal.confirm({
      title: 'Delete Package',
      content: `Are you sure you want to delete the package "${packageData.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'No, Cancel',
      onOk: () => {
        if (packageData.id && onDelete) {
          onDelete(packageData.id);
        }
      },
    });
  };

  const renderViewMode = () => (
    <>
      <div className="mb-4 flex justify-end"></div>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Name">{packageData?.name}</Descriptions.Item>

        <Descriptions.Item label="Original Price">
          ${packageData?.price?.toFixed(2)}
        </Descriptions.Item>
        {packageData?.discount > 0 && (
          <>
            <Descriptions.Item label="Discount">{packageData.discount}%</Descriptions.Item>
            <Descriptions.Item label="Final Price">
              ${calculatedPrice?.toFixed(2) || packageData?.price?.toFixed(2)}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Giveaway Entries">
          {packageData?.giveawayEntries}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={packageData?.isActive ? 'green' : 'red'}>
            {packageData?.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {packageData?.createdAt
            ? dayjs(packageData.createdAt).format('YYYY-MM-DD HH:mm:ss')
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {packageData?.updatedAt
            ? dayjs(packageData.updatedAt).format('YYYY-MM-DD HH:mm:ss')
            : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </>
  );

  const renderEditMode = () => {
    return (
      <Form form={form} layout="vertical" name="package_form">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter package name' }]}
        >
          <Input placeholder="Enter package name" />
        </Form.Item>

        <Form.Item
          name="giveawayEntries"
          label="Giveaway Entries"
          rules={[{ required: true, message: 'Please enter giveaway entries' }]}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            placeholder="Enter number of giveaway entries"
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Original Price"
          rules={[{ required: true, message: 'Please enter original price' }]}
        >
          <InputNumber
            prefix="$"
            min={0}
            precision={2}
            style={{ width: '100%' }}
            placeholder="Enter original price"
          />
        </Form.Item>

        <Form.Item name="discount" label="Discount Amount">
          <InputNumber
            min={0}
            max={100}
            precision={1}
            style={{ width: '100%' }}
            placeholder="Enter percentage"
            suffix="%"
          />
        </Form.Item>

        <Form.Item name="finalPrice" label="Final Price">
          <InputNumber
            prefix="$"
            precision={2}
            style={{ width: '100%' }}
            disabled
            className="bg-gray-50"
          />
        </Form.Item>

        <Form.Item name="summary" label="Summary">
          <Input.TextArea
            rows={2}
            placeholder="Brief description of the package (optional)"
            maxLength={100}
            showCount
          />
        </Form.Item>

        {mode === 'edit' && (
          <>
            <Form.Item
              name="active"
              label="Status"
              valuePropName="checked"
              help={
                activeCount >= maxActivePackages
                  ? `Maximum ${maxActivePackages} active packages allowed`
                  : undefined
              }
            >
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                disabled={!editingId && activeCount >= maxActivePackages}
              />
            </Form.Item>

            {isActive && (
              <Form.Item
                name="position"
                label="Position"
                rules={[
                  {
                    required: isActive,
                    message: 'Please select a position for the active package',
                  },
                ]}
              >
                <Radio.Group disabled={!isActive}>
                  {[1, 2, 3, 4, 5].map(pos => (
                    <Radio.Button key={pos} value={pos}>
                      Position {pos}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            )}
          </>
        )}
      </Form>
    );
  };

  return (
    <Drawer
      title={`${mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'View'} Package`}
      width={720}
      onClose={onClose}
      open={open}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      extra={
        <Space>
          {mode === 'view' ? (
            <>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                disabled={packageData?.isActive}
              >
                Delete
              </Button>
              <Button type="primary" icon={<EditOutlined />} onClick={() => setDrawerMode('edit')}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                {mode === 'create' ? 'Create' : 'Save'}
              </Button>
            </>
          )}
        </Space>
      }
    >
      {mode === 'view' ? renderViewMode() : renderEditMode()}
    </Drawer>
  );
};

export default PackageDrawer;
