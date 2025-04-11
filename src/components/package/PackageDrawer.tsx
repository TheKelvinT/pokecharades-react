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
  discountType: 'PERCENT' | 'WHOLE_NUMBER';
  isActive: boolean;
  isRecommended: boolean;
  giveawayEntries?: number;
  fullAccessDays: number;
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
  const [currentDiscountType, setCurrentDiscountType] = useState<'PERCENT' | 'WHOLE_NUMBER'>(
    'PERCENT'
  );

  // Watch form fields
  const isActive = Form.useWatch('active', form);
  const originalPrice = Form.useWatch('originalPrice', form);
  const discountAmount = Form.useWatch('discountAmount', form);
  const discountType = Form.useWatch('discountType', form);

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

  // Effect for calculating price based on packageData
  useEffect(() => {
    if (packageData?.originalPrice && packageData.discountAmount) {
      const price = Number(packageData.originalPrice);
      const discount = Number(packageData.discountAmount);

      let finalPrice;
      if (packageData.discountType === 'PERCENT') {
        finalPrice = price * (1 - discount / 100);
      } else {
        finalPrice = price - discount;
      }

      // Apply 10% markup
      finalPrice = finalPrice * 1.1;
      setCalculatedPrice(finalPrice);
    } else {
      setCalculatedPrice(packageData?.originalPrice ? packageData.originalPrice * 1.1 : null);
    }
  }, [packageData]);

  // Effect for calculating final price based on form values
  useEffect(() => {
    if (originalPrice) {
      let finalPrice = originalPrice;
      if (discountAmount) {
        if (discountType === 'PERCENT') {
          finalPrice = originalPrice * (1 - discountAmount / 100);
        } else {
          finalPrice = originalPrice - discountAmount;
        }
      }

      // Apply 10% markup
      finalPrice = finalPrice * 1.1;
      form.setFieldValue('finalPrice', Number(finalPrice.toFixed(2)));
    } else {
      form.setFieldValue('finalPrice', null);
    }
  }, [originalPrice, discountAmount, discountType, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        originalPrice: values.originalPrice,
        discountType: values.discountType,
        discountAmount: values.discountAmount ? values.discountAmount : 0,
        summary: values.summary,
        giveawayEntries: values.giveawayEntries,
        fullAccessDays: values.fullAccessDays,
        ...(mode === 'edit' && {
          isActive: values.active,
          isRecommended: values.active ? values.isRecommended : false,
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
        <Descriptions.Item label="Full Access Granted">
          {packageData?.fullAccessDays} days
        </Descriptions.Item>
        <Descriptions.Item label="Original Price">
          ${packageData?.price?.toFixed(2)}
        </Descriptions.Item>
        {packageData?.discount > 0 && (
          <>
            <Descriptions.Item label="Discount">
              {packageData.discount}
              {packageData.discountType === 'PERCENT' ? '%' : '$'}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Final Price">
          $
          {(
            (packageData?.price || 0) *
            (1 -
              ((packageData?.discountType === 'PERCENT'
                ? packageData?.discount / 100
                : packageData?.discount / packageData?.price) || 0)) *
            1.1
          ).toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="Giveaway Entries">
          {packageData?.giveawayEntries}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Space>
            <Tag color={packageData?.isActive ? 'green' : 'red'}>
              {packageData?.isActive ? 'Active' : 'Inactive'}
            </Tag>
            {packageData?.isActive && packageData?.isRecommended && (
              <Tag color="blue">Recommended</Tag>
            )}
          </Space>
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
      <Form
        form={form}
        layout="vertical"
        name="package_form"
        initialValues={{ discountType: 'PERCENT' }}
      >
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
          name="fullAccessDays"
          label="Full Access Granted (Days)"
          rules={[{ required: true, message: 'Please enter number of days for full access' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter number of days" />
        </Form.Item>

        <Form.Item
          name="originalPrice"
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

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="discountType" label="Discount Type" initialValue="PERCENT">
              <Select
                onChange={(value: 'PERCENT' | 'WHOLE_NUMBER') => {
                  setCurrentDiscountType(value);
                  form.setFieldValue('discountAmount', null);
                }}
              >
                <Select.Option value="PERCENT">Percentage (%)</Select.Option>
                <Select.Option value="WHOLE_NUMBER">Fixed Amount ($)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="discountAmount"
              label="Discount Amount"
              rules={[
                {
                  validator: async (_, value) => {
                    if (value) {
                      if (currentDiscountType === 'PERCENT' && (value < 1 || value > 100)) {
                        throw new Error('Percentage must be between 1 and 100');
                      }
                      if (currentDiscountType === 'WHOLE_NUMBER' && value < 0) {
                        throw new Error('Amount must be positive');
                      }
                      if (
                        currentDiscountType === 'WHOLE_NUMBER' &&
                        originalPrice &&
                        value > originalPrice
                      ) {
                        throw new Error('Discount cannot exceed original price');
                      }
                    }
                  },
                },
              ]}
            >
              <InputNumber
                min={currentDiscountType === 'PERCENT' ? 1 : 0}
                max={currentDiscountType === 'PERCENT' ? 100 : undefined}
                precision={currentDiscountType === 'PERCENT' ? 0 : 2}
                style={{ width: '100%' }}
                prefix={currentDiscountType === 'WHOLE_NUMBER' ? '$' : undefined}
                suffix={currentDiscountType === 'PERCENT' ? '%' : undefined}
                placeholder={`Enter ${currentDiscountType === 'PERCENT' ? 'percentage' : 'amount'}`}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="finalPrice" label="Final Price">
              <InputNumber
                prefix="$"
                precision={2}
                style={{ width: '100%' }}
                disabled
                className="bg-gray-50"
              />
            </Form.Item>
          </Col>
        </Row>

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
            <Row gutter={16}>
              <Col span={12}>
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
                    onChange={checked => {
                      if (!checked) {
                        form.setFieldValue('isRecommended', false);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              {isActive && (
                <Col span={12}>
                  <Form.Item
                    name="isRecommended"
                    label="Recommended"
                    valuePropName="checked"
                    tooltip="Mark this package as recommended to highlight it to users"
                  >
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                  </Form.Item>
                </Col>
              )}
            </Row>

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
