import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {CartContext} from '../context/CartContext';

const CartScreen = ({navigation}) => {
  const {cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice} =
    useContext(CartContext);

  // 옵션 값을 한글로 변환하는 헬퍼 함수 추가
  const getKoreanOption = (optionType, value) => {
    if (!value) return null; // 값이 없으면 null 반환

    switch (optionType) {
      case 'size':
        if (value === 'small') return '작은';
        if (value === 'medium') return '중간';
        if (value === 'large') return '큰';
        return value; // 위에 해당하지 않으면 원래 값 반환 (이미 한국어일 경우 등)
      case 'temperature':
        if (value === 'hot') return '뜨거운';
        if (value === 'iced') return '차가운';
        return value; // 위에 해당하지 않으면 원래 값 반환 (이미 한국어일 경우 등)
      default:
        return value;
    }
  };

  const removeItem = itemToRemove => {
    Alert.alert('삭제 확인', '이 항목을 장바구니에서 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => {
          removeFromCart(itemToRemove.id, itemToRemove.options);
        },
      },
    ]);
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity === 0) {
      // 수량이 0이 되면 삭제 확인
      Alert.alert(
        '항목 삭제',
        '수량이 0이 되면 장바구니에서 삭제됩니다. \n삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => {
              // 취소하면 수량을 1로 유지
              updateQuantity(item.id, item.options, 1);
            },
          },
          {
            text: '삭제',
            onPress: () => {
              removeFromCart(item.id, item.options);
            },
          },
        ],
      );
    } else {
      updateQuantity(item.id, item.options, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('알림', '장바구니가 비어있습니다.');
      return;
    }

    Alert.alert(
      '주문 확인',
      `총 ${getTotalPrice().toLocaleString()}원을 결제하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '결제하기',
          onPress: () => {
            // 결제 로직
            Alert.alert('주문 완료', '주문이 접수되었습니다!');
            clearCart(); // 장바구니 비우기
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  const renderCartItem = ({item}) => {
    // 옵션을 한글로 변환
    const displaySize = getKoreanOption('size', item.options.size);
    const displayTemperature = getKoreanOption('temperature', item.options.temperature);

    // 표시할 옵션 문자열 생성
    let optionsText = '';
    if (displaySize) {
      optionsText += `사이즈: ${displaySize}`;
    }
    if (displayTemperature) {
      if (optionsText.length > 0) {
        optionsText += `, `; // 이미 사이즈가 있으면 콤마 추가
      }
      optionsText += displayTemperature;
    }

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.category !== '디저트' && optionsText.length > 0 && (
            <Text style={styles.itemOptions}>{optionsText}</Text>
          )}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item, item.quantity - 1)}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.itemQuantity}>{item.quantity}개</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item, item.quantity + 1)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('MenuDetail', {
                fromCart: true,
                initialOptions: item.options, // 이 값은 여전히 원래 저장된 값을 넘겨줌 (영어 또는 한글)
                initialQuantity: item.quantity,
                item: item.menu,
              });
            }}
            style={styles.changeButton}>
            <Text style={styles.changeButtonText}>옵션 변경</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemPriceSection}>
          <Text style={styles.itemPrice}>
            {item.totalPrice.toLocaleString()}원
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item)}>
            <Text style={styles.removeButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>장바구니가 비어있습니다</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('MenuList')}>
            <Text style={styles.continueButtonText}>메뉴 보러가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => `${item.id}-${JSON.stringify(item.options)}`}
            contentContainerStyle={styles.cartList}
          />

          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>총 금액</Text>
              <Text style={styles.totalPrice}>
                {getTotalPrice().toLocaleString()}원
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>결제하기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cartList: {
    padding: 15,
    paddingTop: 10, // 상단 여백 추가
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  itemOptions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10,
  },
  itemPriceSection: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  removeButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 15,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
  },
  quantityButtonText: {
    fontSize: 15,
    color: 'black',
  },
  changeButton: {
    marginTop: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default CartScreen;