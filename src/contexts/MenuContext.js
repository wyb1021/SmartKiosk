import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchMenus } from '../api/menuApi';

const MenuContext = createContext();
export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);

  useEffect(() => { fetchMenus().then(setMenus); }, []);

  // 음성 텍스트에서 메뉴 이름 포함 여부로 추출
  const findMenuItem = (text) =>
    menus.find(m => text.includes(m.name.toLowerCase()));

  return(
    <MenuContext.Provider value={{ menus, findMenuItem }}>
      {children}
    </MenuContext.Provider>
  );
};