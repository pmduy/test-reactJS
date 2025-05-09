import React from "react";
import { Modal, Button, Divider } from "antd";

const ConfirmOrder = ({ visible, onConfirm, onCancel, orderData, removeItem }) => {
  const { customerInfo, cart, paymentMethod, cashGiven , change} = orderData;

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateChange = () => {
    return paymentMethod === "cash" && cashGiven > calculateTotal()
      ? cashGiven - calculateTotal()
      : 0;
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString("vi-VN")} VND`;
  };


  return (
    <Modal
      visible={visible}
      title="Xác nhận đơn hàng"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="confirm" type="primary" onClick={onConfirm}>
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
        cart.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.name} x {item.quantity}</span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
            <Button
              type="link"
              danger
              onClick={() => removeItem(item.id)}
            >
              Xóa
            </Button>
          </div>
        ))
      )}

      <Divider />

      <h3>Tổng giá trị đơn hàng:</h3>
      <p>{formatCurrency(calculateTotal())}</p>

      <h3>Thông tin thanh toán:</h3>
      <p>Phương thức thanh toán: {paymentMethod === "cash" ? "Tiền mặt" : "Thẻ"}</p>

      {paymentMethod === "cash" && (
        <>
          <p>Số tiền khách đưa: {cashGiven?.toLocaleString()} VND</p>
          <p>
          Tiền thừa trả khách: { change >0 &&formatCurrency(change)}
          </p>
        </>
      )}
    </Modal>
  );
};

export default ConfirmOrder;
