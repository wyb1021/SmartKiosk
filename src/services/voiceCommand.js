// src/services/voiceCommandProcessor.js (또는 voiceCommand.js)

import { Alert } from 'react-native';
import { processVoiceCommand } from './openaiService'; // openAillm 함수 경로

/**
 * 음성 명령을 처리하고 장바구니 상태를 업데이트하는 서비스 함수.
 * 이 함수는 UI 컴포넌트(예: HomeScreen)에서 호출됩니다.
 *
 * @param {string} voiceInput 사용자의 음성 입력
 * @param {Array} cartItems 현재 장바구니 항목 배열
 * @param {Array} menus 전체 메뉴 데이터 배열
 * @param {Object} cartContextFunctions CartContext에서 제공하는 함수들 (addToCart, updateItemOptions, removeItem, clearCart)
 */
export const handleVoiceCommand = async (voiceInput, cartItems, menus, cartContextFunctions) => {
  const { addToCart, updateItemOptions, removeItem, clearCart } = cartContextFunctions;

  // 1. OpenAI LLM 호출하여 명령 파싱
  const command = await processVoiceCommand(voiceInput, cartItems, menus);

  let responseMessage = command.response; // LLM이 제공한 응답 메시지

  // 2. 파싱된 명령에 따라 장바구니 로직 실행
  switch (command.action) {
    case 'add':
      if (command.items && command.items.length > 0) {
        command.items.forEach(item => {
          const foundMenu = menus.find(m => m.name === item.menuName);
          if (!foundMenu) {
            responseMessage = `죄송합니다. "${item.menuName}" 메뉴를 찾을 수 없습니다.`;
            Alert.alert("메뉴 오류", responseMessage);
            return;
          }

          // LLM이 추론한 옵션 또는 기본값 적용
          // 메뉴에 유효한 옵션이 없다면 null 처리
          const finalOptions = {
              temperature: item.temperature || (foundMenu.temperatureOptions?.includes('iced') ? 'iced' : foundMenu.temperatureOptions?.[0] || null),
              size: item.size || (foundMenu.sizeOptions?.includes('medium') ? 'medium' : foundMenu.sizeOptions?.[0] || null),
          };

          // 디저트 카테고리인 경우 온도/사이즈 옵션 강제로 null
          if (foundMenu.category === '디저트') {
              finalOptions.temperature = null;
              finalOptions.size = null;
          }

          addToCart({
            id: foundMenu._id || foundMenu.id,
            name: foundMenu.name,
            category: foundMenu.category,
            price: foundMenu.price,
            quantity: item.quantity || 1,
            options: finalOptions,
            totalPrice: foundMenu.price * (item.quantity || 1),
            imageUrl: foundMenu.imageUrl,
            menu: foundMenu, // 메뉴 객체 전체를 저장하여 상세 정보 접근 (필요시)
          });
        });
        Alert.alert("장바구니", responseMessage);
      }
      break;

    case 'update':
      if (command.items && command.items.length > 0) {
        command.items.forEach(updateReq => {
          const itemToUpdateIndex = cartItems.findIndex(
            ci =>
              ci.name === updateReq.menuName &&
              JSON.stringify(ci.options) === JSON.stringify(updateReq.originalOptions) // 기존 옵션으로 찾기
          );

          if (itemToUpdateIndex > -1) {
            const currentItem = cartItems[itemToUpdateIndex];
            const updatedOptions = {
              temperature: updateReq.temperature !== undefined ? updateReq.temperature : currentItem.options.temperature,
              size: updateReq.size !== undefined ? updateReq.size : currentItem.options.size,
            };
            const updatedQuantity = updateReq.quantity !== undefined ? updateReq.quantity : currentItem.quantity;

            // updateItemOptions 함수는 장바구니 아이템의 ID와 기존 옵션, 그리고 새 옵션과 수량을 인자로 받을 것입니다.
            // CartContext의 updateItemOptions 구현에 따라 인자를 조정하세요.
            updateItemOptions(
              currentItem.id,
              currentItem.options, // 기존 옵션으로 특정 항목 식별
              updatedOptions,      // 변경될 옵션
              updatedQuantity,
              currentItem.price,   // 가격은 변경되지 않거나, 옵션에 따라 다시 계산 필요
              currentItem.name,
              currentItem.menu
            );
            Alert.alert("장바구니 업데이트", responseMessage);
          } else {
            responseMessage = `장바구니에서 ${updateReq.menuName} 항목을 찾을 수 없습니다.`;
            Alert.alert("장바구니 업데이트 오류", responseMessage);
          }
        });
      }
      break;

    case 'remove':
      if (command.items && command.items.length > 0) {
        command.items.forEach(removeItemReq => {
          const itemToRemoveIndex = cartItems.findIndex(
            ci => ci.name === removeItemReq.menuName &&
                  (removeItemReq.options ? JSON.stringify(ci.options) === JSON.stringify(removeItemReq.options) : true)
          );
          if (itemToRemoveIndex > -1) {
              removeItem(cartItems[itemToRemoveIndex].id, cartItems[itemToRemoveIndex].options);
              Alert.alert("장바구니", responseMessage);
          } else {
              responseMessage = `장바구니에서 ${removeItemReq.menuName} 항목을 찾을 수 없습니다.`;
              Alert.alert("장바구니 오류", responseMessage);
          }
        });
      } else { // 모든 항목 제거 요청
          clearCart();
          Alert.alert("장바구니", "장바구니의 모든 항목을 비웠습니다.");
      }
      break;

    case 'query':
      Alert.alert("정보 조회", responseMessage);
      // 여기에 장바구니 내용 상세 보기 등의 로직 추가
      break;

    case 'recommend':
      Alert.alert("메뉴 추천", responseMessage);
      // 여기에 메뉴 추천 목록으로 이동하거나 보여주는 로직 추가
      break;

    case 'error':
    default:
      Alert.alert("오류", responseMessage || command.errorDetails || "명령을 이해하지 못했습니다.");
      break;
  }
};