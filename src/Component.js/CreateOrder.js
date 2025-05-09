import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button, Select, Card, Table, Typography, Radio, InputNumber, Space, Form, notification } from 'antd';
import { mockProducts } from '../data/products';
import { mockPromotions } from '../data/promotions';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ConfirmOrder from './ConfirmOrder';
const { Option } = Select;
const { Title, Text } = Typography;

const customerSchema = z.object({
  name: z.string().nonempty('Vui lòng nhập tên khách hàng'),
  email: z.string().email('Email không hợp lệ'),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .nonempty('Vui lòng nhập số điện thoại'),
});
const CreateOrder = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema), // Dùng zod để validate
    defaultValues: {
      name: '', // Đặt giá trị mặc định là rỗng
      email: '',
      phone: '',
    },
  });
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cashGiven, setCashGiven] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onAddProduct = (productId) => {
    const product = mockProducts.find((p) => p.id === productId);
    const alreadyInCart = cart.find((item) => item.id === productId);
    if (alreadyInCart) return;

    setCart([
      ...cart,
      {
        ...product,
        quantity: 1,
        promotionCode: null,
        customPrice: product.price,
      },
    ]);
  };

  const handleQuantityChange = (id, value) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: value } : item)));
  };

  const handlePriceChange = (id, value) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, customPrice: value } : item)));
  };

  const handlePromotionChange = (id, value) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, promotionCode: value } : item)));
  };

  const handleRemoveProduct = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateDiscountedPrice = (item) => {
    const promo = mockPromotions.find((p) => p.code === item.promotionCode);
    let price = item.customPrice * item.quantity;

    if (promo) {
      if (promo.type === 'percent') {
        return price - (price * promo.value) / 100;
      } else if (promo.type === 'direct') {
        return Math.max(0, price - promo.value);
      }
    }

    return price;
  };
  const handleConfirm = () => {
    notification.success({
      message: 'Thanh toán thành công',
      description: 'Đơn hàng đã được tạo thành công.',
      duration: 2, // tự tắt sau 2s
    });

    reset();
    setCart([]);
    setCashGiven(0);
    setPaymentMethod('cash');
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const totalAmount = cart.reduce((sum, item) => sum + calculateDiscountedPrice(item), 0);

  const change = paymentMethod === 'cash' && cashGiven > totalAmount ? cashGiven - totalAmount : 0;

  const onSubmit = (data) => {
    const customerInfo = getValues();
    const order = {
      customerInfo,
      cart,
      paymentMethod,
      cashGiven: paymentMethod === 'cash' ? cashGiven : null,
      total: totalAmount,
      change,
    };
    setIsModalVisible(true);
  };
  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'customPrice',
      render: (price, record) => (
        <InputNumber min={0} value={price} onChange={(val) => handlePriceChange(record.id, val)} />
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      render: (qty, record) => (
        <InputNumber min={1} value={qty} onChange={(val) => handleQuantityChange(record.id, val)} />
      ),
    },
    {
      title: 'Khuyến mãi',
      dataIndex: 'promotionCode',
      render: (code, record) => (
        <Select
          placeholder='Chọn mã'
          value={code}
          allowClear
          onChange={(val) => handlePromotionChange(record.id, val)}
          style={{ width: 150 }}
        >
          {mockPromotions.map((promo) => (
            <Option key={promo.code} value={promo.code}>
              {promo.code} ({promo.type === 'percent' ? `${promo.value}%` : `${promo.value.toLocaleString()}₫`})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Thành tiền',
      render: (_, record) => `${calculateDiscountedPrice(record).toLocaleString()}₫`,
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button danger onClick={() => handleRemoveProduct(record.id)}>
          Xóa
        </Button>
      ),
    },
  ];
  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;

    // Cập nhật giá trị của trường tương ứng
    setValue(fieldName, value);

    // Xóa lỗi khi giá trị đúng
    if (value) {
      clearErrors(fieldName);
    }
  };

  const isCartEmpty = cart.length === 0;

  return (
    <Card title={<Title level={4}>Tạo đơn hàng</Title>} style={{ maxWidth: 1000, margin: 'auto' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Form.Item validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
            <Input
              placeholder='Tên khách hàng'
              value={getValues('name')}
              onChange={(e) => handleInputChange(e, 'name')}
            />
          </Form.Item>

          <Form.Item validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
            <Input
              placeholder='Email khách hàng'
              value={getValues('email')}
              onChange={(e) => handleInputChange(e, 'email')}
            />
          </Form.Item>

          <Form.Item validateStatus={errors.phone ? 'error' : ''} help={errors.phone?.message}>
            <Input
              placeholder='Số điện thoại khách hàng'
              value={getValues('phone')}
              onChange={(e) => handleInputChange(e, 'phone')}
            />
          </Form.Item>

          <Select placeholder='Thêm sản phẩm vào giỏ' onSelect={onAddProduct} style={{ width: '100%' }}>
            {mockProducts.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name} - {product.price.toLocaleString()}₫
              </Option>
            ))}
          </Select>

          <Table dataSource={cart} columns={columns} rowKey='id' pagination={false} bordered />

          <Card>
            <Title level={5}>Tổng tiền: {totalAmount.toLocaleString()}₫</Title>

            <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
              <Radio value='cash'>Thanh toán tiền mặt</Radio>
              <Radio value='card'>Thanh toán thẻ</Radio>
            </Radio.Group>

            {paymentMethod === 'cash' && (
              <div style={{ marginTop: 10 }}>
                <InputNumber
                  placeholder='Tiền khách đưa'
                  min={0}
                  onChange={setCashGiven}
                  value={cashGiven || ''}
                  style={{ width: 200 }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                />
                {change > 0 && <Text style={{ marginLeft: 16 }}>Tiền thừa trả khách: {change.toLocaleString()}₫</Text>}
              </div>
            )}
          </Card>

          <Button type='primary' htmlType='submit' disabled={isCartEmpty}>
            Thanh toán
          </Button>
        </Space>
      </form>

      <ConfirmOrder
        visible={isModalVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        orderData={{
          customerInfo: getValues(),
          cart,
          paymentMethod,
          cashGiven,
          totalAmount: totalAmount,
          change,
        }}
        removeItem={handleRemoveProduct}
      />
    </Card>
  );
};

export default CreateOrder;
