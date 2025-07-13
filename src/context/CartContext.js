import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  /* ---------- 상품 추가 ---------- */
  const addToCart = (item) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.id === item.id &&                // id는 Mongo _id (문자열)
          JSON.stringify(c.options) === JSON.stringify(item.options)
      );

      if (idx > -1) {
        /* 이미 있으면 수량/가격만 갱신 */
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + item.quantity,
          totalPrice: updated[idx].totalPrice + item.totalPrice,
        };
        return updated;
      }
      /* 새 아이템 */
      return [...prev, item];
    });
  };

  /* ---------- 삭제 ---------- */
  const removeFromCart = (id, options) =>
    setCartItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.id === id &&
            JSON.stringify(i.options) === JSON.stringify(options)
          )
      )
    );

  /* ---------- 수량 변경 ---------- */
  const updateQuantity = (id, options, newQty) =>
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && JSON.stringify(i.options) === JSON.stringify(options)
          ? { ...i, quantity: newQty, totalPrice: (i.price || 0) * newQty }
          : i
      )
    );

  /* ---------- 기타 ---------- */
  const clearCart = () => setCartItems([]);
  const getTotalPrice = () =>
    cartItems.reduce((sum, i) => sum + i.totalPrice, 0);

  return(
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
};
