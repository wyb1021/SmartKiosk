import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { fetchMenuById } from '../api/menuApi';        // ★ DB 개별 조회

const MenuDetailScreen = ({ route, navigation }) => {
  /* ① route 파라미터 분리 */
  const { item: paramItem, id } = route.params ?? {};
  const [item, setItem] = useState(paramItem);        // 파라미터가 있으면 바로 사용
  const [loading, setLoading] = useState(!paramItem); // 없으면 로딩 시작

  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState(null);

  /* ② id만 넘어온 경우 DB 호출 */
  useEffect(() => {
    if (!paramItem && id) {
      fetchMenuById(id)
        .then(m => {
          setItem(m);
          // 옵션 초기화
          const initialSize =
            m.sizeOptions?.includes('medium') ? 'medium' : m.sizeOptions?.[0];
          const initialTemp = m.temperatureOptions?.[0];
          setSelectedOptions({ size: initialSize, temperature: initialTemp });
        })
        .finally(() => setLoading(false));
    } else if (paramItem) {
      const initialSize =
        paramItem.sizeOptions?.includes('medium')
          ? 'medium'
          : paramItem.sizeOptions?.[0];
      const initialTemp = paramItem.temperatureOptions?.[0];
      setSelectedOptions({ size: initialSize, temperature: initialTemp });
    }
  }, []);

  if (loading || !item || !selectedOptions) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );                                // ✅ 또는 return null;
  }

  /* ----- 가격 계산 & 장바구니 추가 ----- */
  const calculateAdjustedPrice = () => {
    let p = item.price;
    if (selectedOptions.size === 'small') p -= 500;
    else if (selectedOptions.size === 'large') p += 500;
    return p;
  };

  const handleAddToCart = () => {
    const adjusted = calculateAdjustedPrice();
    addToCart({
      id: item._id,                      // ★ Mongo _id
      name: item.name,
      price: adjusted,
      quantity,
      options: selectedOptions,
      totalPrice: adjusted * quantity,
    });
    Alert.alert('장바구니', `${item.name}이(가) 장바구니에 추가되었습니다.`);
    navigation.navigate('MenuList');
  };

  /* ----- 렌더 ----- */
  return(
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{calculateAdjustedPrice().toLocaleString()}원</Text>

        {/* 사이즈 옵션 */}
        {item.sizeOptions?.length > 0 && (
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>사이즈</Text>
            <View style={styles.optionButtons}>
              {item.sizeOptions.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    selectedOptions.size === size && styles.selectedOption,
                  ]}
                  onPress={() =>
                    setSelectedOptions(prev => ({ ...prev, size }))
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions.size === size && styles.selectedText,
                    ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 온도 옵션 */}
        {item.temperatureOptions?.length > 0 && (
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>온도</Text>
            <View style={styles.optionButtons}>
              {item.temperatureOptions.map(temp => (
                <TouchableOpacity
                  key={temp}
                  style={[
                    styles.optionButton,
                    selectedOptions.temperature === temp && styles.selectedOption,
                  ]}
                  onPress={() =>
                    setSelectedOptions(prev => ({ ...prev, temperature: temp }))
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions.temperature === temp && styles.selectedText,
                    ]}>
                    {temp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 수량 */}
        <View style={styles.quantitySection}>
          <Text style={styles.optionTitle}>수량</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 합계 */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>합계</Text>
          <Text style={styles.totalPrice}>
            {(calculateAdjustedPrice() * quantity).toLocaleString()}원
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>장바구니에 담기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/* ---- 기존 스타일 그대로 ---- */
const styles = StyleSheet.create({
  /* ... (생략, 이전 코드와 동일) ... */
});

export default MenuDetailScreen;

