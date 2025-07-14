import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  /* ---------- 상품 추가 ---------- */
  const addToCart = (item) => {
    const entry = { ...item, menu: item.menu || { ...item } };
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.id === entry.id &&                // id는 Mongo _id (문자열)
          JSON.stringify(c.options) === JSON.stringify(entry.options)
      );

      if (idx > -1) {
        /* 이미 있으면 수량/가격만 갱신 */
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + entry.quantity,
          totalPrice: updated[idx].totalPrice + entry.totalPrice,
        };
        return updated;
      }
      /* 새 아이템 */
      return [...prev, entry];
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

  const updateItemOptions = (id, oldOptions, newOptions, quantity, price, name, menuObject) => {
    // 1) 기존 항목 제거
    removeFromCart(id, oldOptions);
    // 2) 새로운 옵션·수량으로 담기
    addToCart({
      id,
      name,
      menu: menuObject,
      price,       // 변경된 price(옵션 적용 후) 계산해서 넣어주세요
      options: newOptions,
      quantity,
      totalPrice: price * quantity,
    });
  };

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
        updateItemOptions,
        clearCart,
        getTotalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
};
