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
} from 'antd';
import { useEffect, useState } from 'react';
import { useCreateTier, useUpdateTier, useDeleteTier } from '../../api/tierApi';
import dayjs from 'dayjs';

interface TierData {
  id?: string;
  name: string;
  tierType: 'MONTHLY' | 'YEARLY';
  originalPrice: number;
  discountAmount: number;
  discountType: 'PERCENT' | 'WHOLE_NUMBER';
  isActive: boolean;
  isRecommended?: boolean;
  monthlyEntries?: number;
  summary?: string;
  benefits?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  position?: number;
}

interface TierDrawerProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  editingId?: string | null;
  tierData?: TierData;
  setDrawerMode: (mode: 'create' | 'edit' | 'view') => void;
  onClose: () => void;
  loading?: boolean;
  activeCount?: number;
  maxActiveTiers?: number;
}

const TierDrawer: React.FC<TierDrawerProps> = ({
  open,
  mode,
  editingId,
  setDrawerMode,
  tierData,
  onClose,
  loading,
  activeCount = 0,
  maxActiveTiers = 3,
}) => {
  const [form] = Form.useForm();
  const { mutate: createTier, isPending: isCreating } = useCreateTier();
  const { mutate: updateTier, isPending: isUpdating } = useUpdateTier();
  const { mutate: deleteTier, isPending: isDeleting } = useDeleteTier();
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [currentDiscountType, setCurrentDiscountType] = useState<'PERCENT' | 'WHOLE_NUMBER'>(
    'PERCENT'
  );
  console.log(tierData);
  // Watch form fields
  const isActive = Form.useWatch('active', form);
  const originalPrice = Form.useWatch('originalPrice', form);
  const discountAmount = Form.useWatch('discountAmount', form);
  const discountType = Form.useWatch('discountType', form);

  // Watch active status and update recommended automatically
  Form.useWatch('active', form) === false &&
    form.getFieldValue('isRecommended') &&
    form.setFieldValue('isRecommended', false);

  // Effect for form reset and initial values
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
    if (open && mode !== 'create' && tierData) {
      form.setFieldsValue({
        ...tierData,
        benefits: tierData.benefits || [],
        active: tierData.isActive,
        isRecommended: tierData.isRecommended || false,
        position: tierData.position || null,
      });
    }
  }, [open, form, mode, tierData]);

  // Effect for calculating price based on tierData
  useEffect(() => {
    if (tierData?.originalPrice && tierData.discountAmount) {
      const price = Number(tierData.originalPrice);
      const discount = Number(tierData.discountAmount);

      if (tierData.discountType === 'PERCENT') {
        setCalculatedPrice(price * (1 - discount / 100));
      } else {
        setCalculatedPrice(price - discount);
      }
    } else {
      setCalculatedPrice(tierData?.originalPrice || null);
    }
  }, [tierData]);

  // Effect for calculating final price based on form values
  useEffect(() => {
    if (originalPrice && discountAmount) {
      const price = Number(originalPrice);
      const discount = Number(discountAmount);

      const finalPrice =
        discountType === 'PERCENT' ? price * (1 - discount / 100) : price - discount;

      form.setFieldValue('finalPrice', Number(finalPrice.toFixed(2)));
    } else {
      form.setFieldValue('finalPrice', originalPrice || null);
    }
  }, [originalPrice, discountAmount, discountType, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Filter out empty benefits
      const validBenefits =
        values.benefits?.filter((benefit: string) => benefit && benefit.trim() !== '') || [];

      const payload = {
        name: values.name,
        discountType: values.discountType,
        originalPrice: values.originalPrice,
        discountAmount: values.discountAmount || 0,
        tierType: values.tierType,
        monthlyEntries: values.monthlyEntries,
        isRecommended: values.isRecommended || false,
        ...(mode === 'edit' && {
          isActive: values.active,
          // Only include position if the tier is active
          ...(values.active && { position: values.position }),
        }),
        // Only include summary if it exists and isn't empty
        ...(values.summary?.trim() && { summary: values.summary.trim() }),
        // Always include benefits array
        benefits: validBenefits,
      };

      if (mode === 'create') {
        createTier(payload, {
          onSuccess: () => {
            message.success('Tier created successfully');
            onClose();
          },
          onError: error => {
            message.error('Failed to create tier: ' + error.message);
          },
        });
      } else if (mode === 'edit' && editingId) {
        updateTier(
          { id: editingId, payload },
          {
            onSuccess: () => {
              message.success('Tier updated successfully');
              onClose();
            },
            onError: error => {
              message.error('Failed to update tier: ' + error.message);
            },
          }
        );
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = () => {
    if (!tierData?.id) return;

    if (tierData.isActive) {
      message.error('Cannot delete an active tier. Please deactivate it first.');
      return;
    }

    Modal.confirm({
      title: 'Delete Tier',
      content: `Are you sure you want to delete the tier "${tierData.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'No, Cancel',
      onOk: () => {
        if (tierData.id) {
          deleteTier(tierData.id, {
            onSuccess: () => {
              message.success('Tier deleted successfully');
              onClose();
            },
            onError: error => {
              message.error('Failed to delete tier: ' + error.message);
            },
          });
        }
      },
    });
  };

  const renderViewMode = () => (
    <>
      <div className="mb-4 flex justify-end"></div>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Name">{tierData?.name}</Descriptions.Item>
        <Descriptions.Item label="Original Price">
          ${tierData?.originalPrice?.toFixed(2)}
        </Descriptions.Item>
        {tierData?.discountAmount && (
          <>
            <Descriptions.Item label="Discount">
              {tierData.discountAmount}
              {tierData.discountType === 'PERCENT' ? '%' : '$'}
            </Descriptions.Item>
            <Descriptions.Item label="Final Price">
              ${calculatedPrice?.toFixed(2) || tierData?.originalPrice?.toFixed(2) || '0.00'}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Summary">{tierData?.summary}</Descriptions.Item>
        <Descriptions.Item label="Benefits">
          <ul className="m-0 pl-4">
            {tierData?.benefits?.map((benefit, index) => <li key={index}>{benefit}</li>)}
          </ul>
        </Descriptions.Item>
        <Descriptions.Item label="Monthly Entries">{tierData?.monthlyEntries}</Descriptions.Item>
        <Descriptions.Item label="Type">
          {tierData?.tierType === 'MONTHLY' ? 'Monthly' : 'Annual'}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={tierData?.isActive ? 'green' : 'red'}>
            {tierData?.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Recommended">
          <Tag color={tierData?.isRecommended ? 'blue' : 'default'}>
            {tierData?.isRecommended ? 'Yes' : 'No'}
          </Tag>
        </Descriptions.Item>
        {/* <Descriptions.Item label="Created By">{tierData?.createdBy || 'N/A'}</Descriptions.Item> */}
        <Descriptions.Item label="Created At">
          {tierData?.createdAt ? dayjs(tierData.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {tierData?.updatedAt ? dayjs(tierData.updatedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </>
  );

  const renderEditMode = () => {
    return (
      <Form form={form} layout="vertical" name="tier_form">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter tier name' }]}
        >
          <Input placeholder="Enter tier name" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tierType"
              label="Tier Type"
              rules={[{ required: true, message: 'Please select tier type' }]}
            >
              <Select>
                <Select.Option value="MONTHLY">Monthly</Select.Option>
                <Select.Option value="YEARLY">Annual</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="monthlyEntries"
              label="Monthly Entries"
              rules={[{ required: true, message: 'Please enter monthly entries' }]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="Enter number of monthly entries"
              />
            </Form.Item>
          </Col>
        </Row>

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
            placeholder="Brief description of the tier (optional)"
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item label="Benefits" tooltip="Maximum 10 benefits allowed">
          <Form.List
            name="benefits"
            rules={[
              {
                validator: async (_, benefits) => {
                  if (benefits?.length > 10) {
                    return Promise.reject(new Error('Maximum 10 benefits allowed'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(field => (
                  <Form.Item required={false} key={field.key}>
                    <Space>
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            validator: async (_, value) => {
                              if (value && value.trim() === '') {
                                throw new Error('Benefit cannot be empty');
                              }
                            },
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          placeholder="Enter benefit (optional)"
                          style={{ width: '450px' }}
                          onChange={e => {
                            // Update the current field value
                            form.setFieldValue(['benefits', field.name], e.target.value);

                            // Check if there are any empty benefits
                            const benefits = form.getFieldValue('benefits');
                            const hasEmptyBenefit = benefits?.some(
                              (b: string) => b && b.trim() === ''
                            );

                            // Update the add button state through form data
                            form.setFieldValue('hasEmptyBenefit', hasEmptyBenefit);
                          }}
                        />
                      </Form.Item>
                      {fields.length > 0 && (
                        <MinusCircleOutlined onClick={() => remove(field.name)} />
                      )}
                    </Space>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    disabled={fields.length >= 10 || form.getFieldValue('hasEmptyBenefit')}
                    style={{ width: '81%' }}
                  >
                    Add Benefit
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        {mode === 'edit' && (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="active"
                label="Status"
                valuePropName="checked"
                help={
                  activeCount >= maxActiveTiers
                    ? `Maximum ${maxActiveTiers} active tiers allowed`
                    : undefined
                }
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  disabled={!editingId && activeCount >= maxActiveTiers}
                />
              </Form.Item>
            </Col>
            {isActive && (
              <>
                <Col span={8}>
                  <Form.Item
                    name="isRecommended"
                    label="Recommended"
                    valuePropName="checked"
                    tooltip="Mark this tier as recommended to highlight it to users"
                  >
                    <Switch checkedChildren="Yes" unCheckedChildren="No" disabled={!isActive} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="position"
                    label="Position"
                    rules={[
                      {
                        required: isActive,
                        message: 'Please select a position for the active tier',
                      },
                    ]}
                  >
                    <Radio.Group disabled={!isActive}>
                      <Radio.Button value={1}>Left</Radio.Button>
                      <Radio.Button value={2}>Middle</Radio.Button>
                      <Radio.Button value={3}>Right</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        )}
      </Form>
    );
  };

  return (
    <Drawer
      title={`${mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'View'} Tier`}
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
                disabled={tierData?.isActive || isDeleting}
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
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isCreating || isUpdating || loading}
                disabled={mode === 'create' && activeCount >= maxActiveTiers}
              >
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

export default TierDrawer;
