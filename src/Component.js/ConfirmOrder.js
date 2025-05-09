import React from 'react';
import { Modal, Button, Divider } from 'antd';
import { mockPromotions } from '../data/promotions';

const ConfirmOrder = ({ visible, onConfirm, onCancel, orderData, removeItem }) => {
  const { customerInfo, cart, paymentMethod, cashGiven, change } = orderData;

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
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + calculateDiscountedPrice(item), 0);
  };
  const formatCurrency = (amount) => {
    return `${amount.toLocaleString('vi-VN')} VND`;
  };

  return (
    <Modal
      visible={visible}
      title='Xác nhận đơn hàng'
      onCancel={onCancel}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          Hủy
        </Button>,
        <Button key='confirm' type='primary' onClick={onConfirm}>
          Xác nhận
        </Button>,
      ]}
    >
      <h3>Thông tin khách hàng:</h3>
      <p>Tên: {customerInfo.name}</p>
      <p>Email: {customerInfo.email}</p>
      <p>Số điện thoại: {customerInfo.phone}</p>

      <Divider />

      <h3>Giỏ hàng:</h3>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        cart.map((item) => {
          const promo = mockPromotions.find((p) => p.code === item.promotionCode);
          return (
            <div
              key={item.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
            >
              <span>
                {item.name} x {item.quantity}
                {promo
                  ? ` (Giảm ${promo.type === 'percent' ? `${promo.value}%` : `${promo.value.toLocaleString()}₫`})`
                  : ''}
              </span>
              <span>{formatCurrency(calculateDiscountedPrice(item)) }</span>
              <Button type='link' danger onClick={() => removeItem(item.id)}>
                Xóa
              </Button>
            </div>
          );
        })
      )}

      <Divider />

      <h3>Tổng giá trị đơn hàng:</h3>
      <p>{formatCurrency(calculateTotal())}</p>

      <h3>Thông tin thanh toán:</h3>
      <p>Phương thức thanh toán: {paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'}</p>

      {paymentMethod === 'cash' && (
        <>
          <p>Số tiền khách đưa: {cashGiven?.toLocaleString()} VND</p>
          <p>Tiền thừa trả khách: {change > 0 && formatCurrency(change)}</p>
        </>
      )}
    </Modal>
  );
};

export default ConfirmOrder;
