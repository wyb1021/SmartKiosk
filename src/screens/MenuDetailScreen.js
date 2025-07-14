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
  const { item: paramItem, fromCart, id, initialOptions, initialQuantity } = route.params ?? {};
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, updateItemOptions } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState(null);

  const [originalOptions] = useState(initialOptions);

  /* 이미지 URL을 기반으로 Hot/Iced 이미지 URL을 파생하는 함수 (아이스티 예외 처리 포함) */
  const deriveImages = (rawImageUrl, temperatureOptions) => {
    let hotUrl = null;
    let icedUrl = null;

    if (!temperatureOptions || temperatureOptions.length === 0) {
      // 온도 옵션이 없는 경우 (예: 디저트). icedUrl에 원본 이미지를 할당하여 단일 이미지로 표시
      return { hotUrl: null, icedUrl: rawImageUrl };
    }

    const lastDotIndex = rawImageUrl.lastIndexOf('.');
    const baseUrlPath = rawImageUrl.substring(0, lastDotIndex !== -1 ? lastDotIndex : rawImageUrl.length);
    const ext = lastDotIndex !== -1 ? rawImageUrl.substring(lastDotIndex) : '';

    // 원본 URL에 'hot' 또는 'ice' 키워드가 이미 있는지 확인 (case-insensitive)
    const containsHotKeywordInUrl = /hot/i.test(baseUrlPath.toLowerCase()); // 파일명 부분만 검사
    const containsIceKeywordInUrl = /ice/i.test(baseUrlPath.toLowerCase()); // 파일명 부분만 검사

    // 'hot' 옵션 처리
    if (temperatureOptions.includes('hot')) {
      if (containsHotKeywordInUrl) {
        hotUrl = rawImageUrl; // 이미 'hot' 키워드가 있으면 원본 URL 사용
      } else if (containsIceKeywordInUrl) {
        hotUrl = baseUrlPath.replace(/ice/i, 'hot') + ext; // 'ice'가 있으면 'hot'으로 치환
      } else {
        hotUrl = baseUrlPath + 'hot' + ext; // 둘 다 없으면 'hot' 추가
      }
    }

    // 'iced' 옵션 처리
    if (temperatureOptions.includes('iced')) {
      if (containsIceKeywordInUrl) {
        icedUrl = rawImageUrl; // 이미 'ice' 키워드가 있으면 원본 URL 사용
      } else if (containsHotKeywordInUrl) {
        icedUrl = baseUrlPath.replace(/hot/i, 'ice') + ext; // 'hot'이 있으면 'ice'로 치환
      } else {
        icedUrl = baseUrlPath + 'ice' + ext; // 둘 다 없으면 'ice' 추가
      }
    }

    // 단일 온도 옵션에 대한 Fallback (ex: '아이스티'처럼 'ice'만 있는 경우)
    // 이 부분에서 rawImageUrl이 icetea.jpg 이고 temperatureOptions에 'iced'만 있을 때
    // icedUrl이 rawImageUrl이 되도록 보장합니다.
    if (temperatureOptions.length === 1) {
        if (temperatureOptions.includes('iced')) {
            icedUrl = icedUrl || rawImageUrl; // 만약 icedUrl이 여전히 null이면 rawImageUrl 사용
            hotUrl = null; // hot은 불필요하므로 null
        } else if (temperatureOptions.includes('hot')) {
            hotUrl = hotUrl || rawImageUrl; // hotUrl이 여전히 null이면 rawImageUrl 사용
            icedUrl = null; // iced는 불필요하므로 null
        }
    }

    // 최종적으로 hotUrl, icedUrl이 null이고 온도 옵션이 있는 경우 rawImageUrl 할당 (안전 장치)
    if (temperatureOptions.includes('hot') && !hotUrl) hotUrl = rawImageUrl;
    if (temperatureOptions.includes('iced') && !icedUrl) icedUrl = rawImageUrl;


    return { hotUrl, icedUrl };
  };

  /* ③ 데이터 로드 */
  useEffect(() => {
    const loadItemData = async () => {
      let currentItem = null;
      setLoading(true); // 데이터를 다시 로드하기 전에 로딩 상태 활성화

      if (paramItem) {
        currentItem = paramItem;
      } else if (id) {
        try {
          // fetchMenuById 호출 시 데이터가 유효한지 확인
          const fetchedData = await fetchMenuById(id);
          if (fetchedData && typeof fetchedData === 'object' && !Array.isArray(fetchedData)) { // 배열이 아닌 객체인지 명확히 확인
              currentItem = fetchedData;
          } else {
              console.error("Fetched data is invalid or not an object:", fetchedData);
              Alert.alert('오류', '메뉴 정보를 불러오는데 실패했습니다: 데이터 형식 오류.');
              setLoading(false);
              return;
          }
        } catch (err) {
          console.error('메뉴 상세 정보를 가져오는 데 실패했습니다:', err);
          Alert.alert('오류', '메뉴 정보를 불러오는데 실패했습니다.');
          setLoading(false);
          return;
        }
      }

      if (currentItem) {
        const cleanName = currentItem.baseName || currentItem.name.replace(/\s*\((iced|hot)\)\s*/i, '').trim();

        setItem({
          ...currentItem,
          name: cleanName,
          baseName: cleanName,
        });

        // 초기 옵션 설정 로직 (사이즈: 'medium' 우선, 온도: 'iced' 우선)
        let initialSize = null;
        let initialTemperature = null;

        if (currentItem.category === '디저트') {
          initialSize = currentItem.sizeOptions?.[0] || null;
        } else {
          if (currentItem.sizeOptions?.includes('medium')) {
            initialSize = 'medium'; // 'medium'이 있다면 'medium'을 기본으로
          } else if (currentItem.sizeOptions?.length > 0) {
            initialSize = currentItem.sizeOptions[0]; // 'medium'이 없으면 첫 번째 사용 가능한 사이즈
          } else {
            initialSize = null;
          }
        }

        if (currentItem.temperatureOptions?.length > 0) {
          if (currentItem.temperatureOptions.includes('iced')) {
            initialTemperature = 'iced';
          } else {
            initialTemperature = currentItem.temperatureOptions[0];
          }
        } else {
          initialTemperature = null;
        }

        if (fromCart && initialOptions) {
          setSelectedOptions(initialOptions);
          setQuantity(initialQuantity || 1);
        } else {
          setSelectedOptions({ size: initialSize, temperature: initialTemperature });
          setQuantity(1);
        }
      } else {
          // currentItem이 null인 경우 (데이터를 찾지 못했거나 로드 실패)
          Alert.alert('알림', '해당 메뉴를 찾을 수 없습니다.');
          navigation.goBack(); // 또는 다른 처리
      }
      setLoading(false);
    };

    loadItemData();
  }, [paramItem, id, fromCart, initialOptions, initialQuantity, navigation]); // navigation도 의존성 배열에 추가


  if (loading || !item || selectedOptions === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // deriveImages 함수 호출
  const { hotUrl, icedUrl } = deriveImages(item.imageUrl, item.temperatureOptions);

  /* ----- 가격 계산 & 장바구니 추가 ----- */
  const calculateAdjustedPrice = () => {
    let p = item.price;
    if (item.category !== '디저트' && item.sizeOptions?.length > 0) {
      if (selectedOptions.size === 'small') p -= 500;
      else if (selectedOptions.size === 'large') p += 500;
    }
    return p;
  };

  const handleAddToCart = () => {
    if (quantity === 0) {
      Alert.alert('알림', '수량을 1개 이상 선택해주세요.');
      return;
    }

    const adjusted = calculateAdjustedPrice();

    const cartItemOptions = {
        size: selectedOptions.size,
        temperature: selectedOptions.temperature,
    };

    if (fromCart) {
      updateItemOptions(
        item._id || item.id,
        originalOptions,
        cartItemOptions,
        quantity,
        adjusted,
        item.name,
        item
      );
      Alert.alert('장바구니', `${item.name}의 옵션이 변경되었습니다.`);
      navigation.goBack();
      return;
    }

    addToCart({
      id: item._id || item.id,
      name: item.baseName || item.name,
      category: item.category,
      price: adjusted,
      quantity,
      options: cartItemOptions,
      totalPrice: adjusted * quantity,
      imageUrl: item.imageUrl, // 원본 imageUrl 사용 (썸네일 등 사용시)
      menu: item,
    });
    Alert.alert('장바구니', `${item.name}이(가) 장바구니에 추가되었습니다.`);
    navigation.goBack();
  };

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
            {item.category !== '디저트' && item.temperatureOptions?.length > 0 ? (
              // 온도 옵션이 있는 경우 (커피, 스무디, 에이드, 티, 라떼)
              item.temperatureOptions.length === 2 ? (
                // Hot/Iced 모두 가능한 경우
                <View style={styles.imageRow}>
                  {hotUrl && item.temperatureOptions.includes('hot') && (
                    <Image
                      source={{ uri: hotUrl }}
                      style={[
                        styles.imageMulti,
                        selectedOptions.temperature !== 'hot' && styles.imageInactive,
                      ]}
                      resizeMode="contain"
                    />
                  )}
                  {icedUrl && item.temperatureOptions.includes('iced') && (
                    <Image
                      source={{ uri: icedUrl }}
                      style={[
                        styles.imageMulti,
                        selectedOptions.temperature !== 'iced' && styles.imageInactive,
                      ]}
                      resizeMode="contain"
                    />
                  )}
                </View>
              ) : (
                // 온도 옵션이 1개인 경우 (ex: iced만 가능, hot만 가능)
                <Image
                  source={{
                    uri: (item.temperatureOptions.includes('iced') && icedUrl) ||
                          (item.temperatureOptions.includes('hot') && hotUrl)
                  }}
                  style={styles.image}
                  resizeMode="contain"
                />
              )
            ) : (
              // 디저트 카테고리 또는 온도 옵션이 없는 메뉴
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

          {/* ─── 사이즈 옵션 (디저트가 아니고 sizeOptions가 있을 때만 표시) ─── */}
          {item.category !== '디저트' && item.sizeOptions?.length > 0 && (
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
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOptions.size === size && styles.selectedText,
                      ]}
                    >
                      {size === 'small' ? '작은' : size === 'medium' ? '중간' : size === 'large' ? '큰' : size}
                      {size === 'small' && ' (-500원)'}
                      {size === 'large' && ' (+500원)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ─── 온도 옵션 (디저트가 아니고 temperatureOptions가 있을 때만 표시) ─── */}
          {item.category !== '디저트' && item.temperatureOptions?.length > 0 && (
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
                onPress={() => setQuantity(Math.max(0, quantity - 1))}
                disabled={quantity === 0}>
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
    height: 56, // 스크린샷과 유사한 높이
    paddingHorizontal: 16, // 스크린샷과 유사한 좌우 패딩
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // 아이콘이 왼쪽 끝에 붙도록 마이너스 마진
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 40, // 뒤로가기 버튼과 동일한 공간 확보 (균형 맞춤)
  },

  /* 스크롤 영역 */
  scrollContainer: {
    flex: 1,
  },

  /* 이미지 컨테이너 & 이미지 */
  imageContainer: {
    width: screenWidth,
    height: screenWidth * 0.8, // 화면 너비의 80% 높이 유지
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7, // 이미지 위아래 여백 추가
  },
  image: { // 단일 이미지 (iced-only, hot-only, 디저트)에 사용 - 중앙에 배치될 것
    width: '100%', // 부모 컨테이너에 맞춰 꽉 채움
    height: '100%',
    resizeMode: 'contain', // 이미지가 잘리지 않고 비율 유지
  },
  imageRow: {         // 두 장 이상일 때 컨테이너
    flexDirection: 'row',
    justifyContent: 'space-around', // 중앙 정렬 및 여백 분배
    alignItems: 'center', // 세로 중앙 정렬
    width: '100%',
    height: '100%',
    paddingHorizontal: 8,
  },
  imageMulti: {         // 두 장 각각의 크기
    width: '48%', // 48%에서 약간 줄여서 간격 확보
    height: '98%', // 높이도 살짝 줄여서 여백
    borderRadius: 8,
    // 그림자 효과는 스크린샷에 없으므로 일단 제거 (필요시 추가)
  },
  imageInactive: {         // 선택되지 않은 이미지 스타일
    opacity: 0.3,
  },

  /* 컨텐츠 */
  content: {
    paddingHorizontal: 20, // 좌우 패딩
    paddingTop: 5, // 상단 패딩
    paddingBottom: 5, // 하단 패딩 (하단 버튼과 겹치지 않게)
    backgroundColor: '#fff', // 배경색
  },

  /* 메뉴 정보 */
  menuInfo: {
    marginBottom: 5,
    alignItems: 'center', // 텍스트 중앙 정렬
  },
  name: {
    fontSize: 26, // 스크린샷과 유사하게 조정
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5, // 마진 조정
  },
  category: {
    fontSize: 15, // 스크린샷과 유사하게 조정
    color: '#666',
    marginBottom: 6, // 마진 조정
  },
  price: {
    fontSize: 22, // 스크린샷과 유사하게 조정
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center', // 설명 텍스트도 중앙 정렬
  },

  /* 옵션 섹션 */
  optionSection: {
    marginBottom: 10,
    paddingBottom: 12, // 하단 패딩 추가
    borderBottomWidth: StyleSheet.hairlineWidth, // 얇은 선
    borderBottomColor: '#e0e0e0', // 선 색상
  },
  optionTitle: {
    fontSize: 17, // 스크린샷과 유사하게 조정
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // 버튼 사이의 간격 조정
  },
  optionButton: {
    paddingHorizontal: 12, // 좌우 패딩
    paddingVertical: 10, // 상하 패딩 (버튼 높이 조정)
    borderRadius: 20, // 둥근 정도 조정
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    // marginRight: 8, // gap으로 대체
    // marginBottom: 8, // gap으로 대체
    alignItems: 'center',
    justifyContent: 'center', // 텍스트 중앙 정렬
    minWidth: 90, // 최소 너비
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
    paddingBottom: 15, // 하단 패딩 추가
    borderBottomWidth: StyleSheet.hairlineWidth, // 얇은 선
    borderBottomColor: '#e0e0e0', // 선 색상
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 38, // 버튼 크기 조정
    height: 38, // 버튼 크기 조정
    borderRadius: 19, // 완전한 원형
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f8f8f8',
    opacity: 0.7, // 비활성화 시 투명도
  },
  quantityButtonText: {
    fontSize: 20, // 폰트 크기 조정
    fontWeight: 'bold',
    color: '#333',
  },
  quantityButtonTextDisabled: {
    color: '#ccc',
  },
  quantity: {
    fontSize: 18, // 폰트 크기 조정
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
    borderTopWidth: StyleSheet.hairlineWidth, // 얇은 선
    borderTopColor: '#e0e0e0', // 선 색상
    marginBottom: 20, // 하단 버튼과의 여백
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
    paddingHorizontal: 20, // 좌우 패딩
    paddingVertical: 15, // 상하 패딩
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10, // 스크린샷과 유사한 둥근 정도
    paddingVertical: 16, // 스크린샷과 유사한 높이
    alignItems: 'center',
    justifyContent: 'center',
    // 그림자 효과는 스크린샷에 없으므로 일단 제거 (필요시 추가)
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