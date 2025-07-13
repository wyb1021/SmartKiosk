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

  // ★ 변경된 부분: renderCartItem 함수를 CartScreen 컴포넌트 내부로 이동
  const renderCartItem = ({item}) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemOptions}>
          {item.options.size && `사이즈: ${item.options.size}`}
          {item.options.temperature && `, ${item.options.temperature}`}
        </Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              updateQuantity(
                item.id,
                item.options,
                Math.max(1, item.quantity - 1),
              )
            }>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}개</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              updateQuantity(item.id, item.options, item.quantity + 1)
            }>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
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

  // ★ 원래의 CartScreen 컴포넌트의 return 문
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>장바구니</Text>
      </View>

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
  header: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 15,
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
});

export default CartScreen;