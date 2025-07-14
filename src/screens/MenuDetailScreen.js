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
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CartContext } from '../context/CartContext';
import { fetchMenuById } from '../api/menuApi';

const { width: screenWidth } = Dimensions.get('window');

const MenuDetailScreen = ({ route, navigation }) => {
  /* ① route 파라미터 분리 */
  const { item: paramItem, fromCart, id, initialOptions, initialQuantity } = route.params ?? {};
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, updateItemOptions } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState(null);

  /* ② 초기 옵션 저장 (fromCart일 때 필요) */
  const [originalOptions] = useState(initialOptions);

  /* ③ 데이터 로드 */
  useEffect(() => {
    // 1) paramItem 으로 바로 넘어온 경우
    if (paramItem) {
      // baseName이 있으면 사용, 없으면 name에서 (iced) 등을 제거
      const cleanName = paramItem.baseName || paramItem.name.replace(/\s*\((iced|hot)\)\s*/i, '').trim();
      
      setItem({
        ...paramItem,
        name: cleanName,
        baseName: cleanName,
        // images가 없거나 1개만 있는 경우 처리
        images: paramItem.images || [paramItem.imageUrl, paramItem.imageUrl]
      });
      
      // 장바구니에서 온 경우 initialOptions 사용, 아니면 기본값
      if (fromCart && initialOptions) {
        setSelectedOptions(initialOptions);
        setQuantity(initialQuantity || 1);
      } else {
        setSelectedOptions({ size: '중간', temperature: 'iced' });
        setQuantity(1);
      }
      setLoading(false);
      return;
    }

    // 2) id 로 fetch 해야 하는 경우
    if (id) {
      fetchMenuById(id)
        .then(m => {
          // fetch한 데이터도 동일하게 처리
          const cleanName = m.name.replace(/\s*\((iced|hot)\)\s*/i, '').trim();
          setItem({
            ...m,
            name: cleanName,
            baseName: cleanName
          });
          
          if (fromCart && initialOptions) {
            setSelectedOptions(initialOptions);
            setQuantity(initialQuantity || 1);
          } else {
            setSelectedOptions({ size: '중간', temperature: 'iced' });
            setQuantity(1);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [paramItem, id, fromCart, initialOptions, initialQuantity]);

  if (loading || !item || !selectedOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  const images = (
    Array.isArray(item.images) && item.images.length
      ? item.images
      : [ item.imageUrl ]
  ).filter((u) => typeof u === 'string' && u.length > 0);

  const hotImage = images.find((u) => u.toLowerCase().includes('hot'));
  const icedImage = images.find((u) => u.toLowerCase().includes('ice'));

  // safety fallback
  const finalHotImage = hotImage || images[0] || null;
  const finalIcedImage = icedImage || images[1] || images[0] || null;
  
  /* ----- 가격 계산 & 장바구니 추가 ----- */
  const calculateAdjustedPrice = () => {
    let p = item.price;
    if (selectedOptions.size === '작은') p -= 500;
    else if (selectedOptions.size === '큰') p += 500;
    return p;
  };

  const handleAddToCart = () => {
    // 수량이 0인 경우 처리
    if (quantity === 0) {
      Alert.alert('알림', '수량을 1개 이상 선택해주세요.');
      return;
    }

    const adjusted = calculateAdjustedPrice();
    
    if (fromCart) {
      // 장바구니에서 온 경우 - 기존 옵션 정보 사용
      updateItemOptions(
        item._id || item.id,  // id 처리
        originalOptions,      // 원래 옵션 (중요!)
        selectedOptions,      // 새로운 옵션
        quantity,
        adjusted,
        item.name,
        item
      );
      navigation.goBack();
      return;
    }
    
    // 일반적인 장바구니 추가
    addToCart({
      id: item._id || item.id,
      name: item.baseName || item.name,  // baseName 우선 사용
      category: item.category,
      price: adjusted,
      quantity,
      options: selectedOptions,
      totalPrice: adjusted * quantity,
      images: item.images,  // 이미지 정보도 저장
      imageUrl: item.imageUrl,
      menu: item,
    });
    Alert.alert('장바구니', `${item.name}이(가) 장바구니에 추가되었습니다.`);
    navigation.goBack();
  };
  const deriveImages = (url) => {
    let hot, iced;
    if (/ice/i.test(url)) {
      iced = url;
      hot = url.replace(/ice(\.\w+)$/i, 'hot$1');
    } else if (/hot/i.test(url)) {
      hot = url;
      iced = url.replace(/hot(\.\w+)$/i, 'ice$1');
    } else {
      hot = iced = url;
    }
    return [hot, iced];
  };

  const [hotUrl, icedUrl] = deriveImages(item.imageUrl);
  /* ----- 렌더 ----- */
  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>메뉴 상세</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.imageContainer}>
              {item.category !== '디저트' ? (
                <View style={styles.imageRow}>
                  <Image
                    source={{ uri: hotUrl }}
                    style={[
                      styles.imageMulti,
                      selectedOptions.temperature !== 'hot' && styles.imageInactive,
                    ]}
                    resizeMode="contain"
                  />
                  <Image
                    source={{ uri: icedUrl }}
                    style={[
                      styles.imageMulti,
                      selectedOptions.temperature !== 'iced' && styles.imageInactive,
                    ]}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
      </View>

        <View style={styles.content}>
          {/* 메뉴 정보 */}
          <View style={styles.menuInfo}>
            <Text style={styles.name}>{item.baseName || item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.price}>{calculateAdjustedPrice().toLocaleString()}원</Text>
          </View>

          {/* ─── 사이즈 옵션 (디저트면 숨김) ─── */}
          {item.category !== '디저트' && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>사이즈</Text>
              <View style={styles.optionButtons}>
                {['작은', '중간', '큰'].map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      selectedOptions.size === size && styles.selectedOption,
                    ]}
                    onPress={() =>
                      setSelectedOptions(prev => ({ ...prev, size }))
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOptions.size === size && styles.selectedText,
                      ]}
                    >
                      {size}
                      {size === '작은' && ' (-500원)'}
                      {size === '큰' && ' (+500원)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ─── 온도 옵션 (디저트면 숨김) ─── */}
          {item.category !== '디저트' && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>온도</Text>
              <View style={styles.optionButtons}>
                {['hot', 'iced'].map(temp => (
                  <TouchableOpacity
                    key={temp}
                    style={[
                      styles.optionButton,
                      selectedOptions.temperature === temp && styles.selectedOption,
                    ]}
                    onPress={() =>
                      setSelectedOptions(prev => ({ ...prev, temperature: temp }))
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOptions.temperature === temp && styles.selectedText,
                      ]}
                    >
                      {temp === 'hot' ? '뜨거운' : '차가운'}
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
                style={[styles.quantityButton, quantity === 0 && styles.quantityButtonDisabled]}
                onPress={() => setQuantity(Math.max(0, quantity - 1))}>
                <Text style={[styles.quantityButtonText, quantity === 0 && styles.quantityButtonTextDisabled]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.quantity, quantity === 0 && styles.quantityZero]}>{quantity}</Text>
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
            <Text style={[styles.totalPrice, quantity === 0 && styles.totalPriceZero]}>
              {(calculateAdjustedPrice() * quantity).toLocaleString()}원
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.addButton, quantity === 0 && styles.addButtonDisabled]} 
          onPress={handleAddToCart}
          disabled={quantity === 0}>
          <Text style={styles.addButtonText}>
            {fromCart ? '변경사항 저장' : (quantity === 0 ? '수량을 선택해주세요' : '장바구니에 담기')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  
  /* 헤더 */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },

  /* 스크롤 영역 */
  scrollContainer: {
    flex: 1,
  },
  
  /* 이미지 컨테이너 & 이미지 */
  imageContainer: {
    width: screenWidth,
    height: screenWidth * 0.8, // 화면 너비의 80% 높이
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageRow: {                // ← 두 장 이상일 때 컨테이너
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 8,
  },
  imageMulti: {              // ← 두 장 각각의 크기
    width: '48%',
    height: '100%',
    borderRadius: 8,
  },
  imageInactive: {           // ← 선택되지 않은 이미지 스타일
    opacity: 0.3,
  },

  /* 컨텐츠 */
  content: {
    padding: 20,
  },

  /* 메뉴 정보 */
  menuInfo: {
    marginBottom: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },

  /* 옵션 섹션 */
  optionSection: {
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  /* 수량 */
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f8f8f8',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityButtonTextDisabled: {
    color: '#ccc',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  quantityZero: {
    color: '#999',
  },

  /* 합계 */
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalPriceZero: {
    color: '#999',
  },

  /* 하단 버튼 */
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ddd',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MenuDetailScreen;