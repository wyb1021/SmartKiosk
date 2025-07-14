import React, { useMemo, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { useMenu } from '../contexts/MenuContext';
import { CartContext } from '../context/CartContext';

const { width: screenWidth } = Dimensions.get('window');

// Quick 메뉴 정의 (고정된 옵션)
const QUICK_MENUS = [
  {
    id: 'quick-americano-iced',
    baseName: '아메리카노',
    name: '아메리카노',
    category: '커피',
    price: 3500,
    options: { size: '중간', temperature: 'iced' },
    quickLabel: '아이스 아메리카노'
  },
  {
    id: 'quick-latte-hot',
    baseName: '카페 라떼',
    name: '카페 라떼',
    category: '커피',
    price: 4500,
    options: { size: '중간', temperature: 'hot' },
    quickLabel: '따뜻한 라떼'
  },
  {
    id: 'quick-ade-iced',
    baseName: '레몬 에이드',
    name: '레몬 에이드',
    category: '에이드',
    price: 5000,
    options: { size: '중간', temperature: 'iced' },
    quickLabel: '레몬 에이드'
  },
];

export default function MenuListScreen() {
  const nav = useNavigation();
  const { menus } = useMenu();
  const { addToCart, clearCart } = useContext(CartContext);
  
  // Quick 메뉴 수량 상태 - 기본값 1로 초기화
  const [quickQuantities, setQuickQuantities] = useState(
    QUICK_MENUS.reduce((acc, menu) => {
      acc[menu.id] = 1;
      return acc;
    }, {})
  );

  /* ───────── 1) Hot / Iced 항목 병합 ───────── */
  const mergedMenus = useMemo(() => {
    const dict = {};

    menus.forEach(m => {
      // "아메리카노 (Hot)" → "아메리카노"
      const base = m.name.replace(/\s*\((Hot|Iced)\)$/i, '');
      const temps = m.temperatureOptions ?? [];
      if (!dict[base]) {
        dict[base] = {
          ...m,
          name: base, // 기준 이름으로 교체
          images: [m.imageUrl],
          temperatureOptions: [...temps],
        };
      } else {
        dict[base].images.push(m.imageUrl);
        dict[base].temperatureOptions = Array.from(
          new Set([...dict[base].temperatureOptions, ...temps]),
        );
      }
    });

    return Object.values(dict);
  }, [menus]);

  const sorted = useMemo(() => {
    const rank = m => (m.adminPriority ?? Infinity);      // null ⇒ 맨 뒤
    return [...mergedMenus].sort((a, b) => {
      const r = rank(a) - rank(b);                        // ① adminPriority
      if (r !== 0) return r;
      if (a.popularity !== b.popularity)                 // ② popularity (높을수록 위)
        return b.popularity - a.popularity;
      return a.name.localeCompare(b.name, 'ko');
    });
  }, [mergedMenus]);

  /* ───────── Quick 메뉴 준비 ───────── */
  const quickMenusWithImages = useMemo(() => {
    return QUICK_MENUS.map(quick => {
      const found = mergedMenus.find(m => m.name === quick.baseName);
      if (found) {
        return {
          ...quick,
          imageUrl: found.images?.[quick.options.temperature === 'iced' ? 0 : 1] || found.imageUrl,
          images: found.images,
          _id: found._id
        };
      }
      return quick;
    });
  }, [mergedMenus]);

  /* ───────── 카테고리 상태 ───────── */
  const [cat, setCat] = useState('Quick');
  const CAT_ORDER = ['전체', 'Quick', '커피', '티', '라떼', '에이드', '스무디', '디저트'];
  const cats = useMemo(
    () =>
      CAT_ORDER.filter(k => 
        k === '전체' || 
        k === 'Quick' || 
        mergedMenus.some(m => m.category === k)
      ),
    [mergedMenus],
  );
  const catRef = useRef(null);
  const onSelCat = (c, i) => {
    setCat(c);
    catRef.current?.scrollToIndex({ index: i, viewPosition: 0.5 });
  };

  const filteredMenus = 
    cat === '전체' ? sorted :
    cat === 'Quick' ? quickMenusWithImages :
    sorted.filter(m => m.category === cat);

  const data = useMemo(() => {
    if (cat === 'Quick') {
      // Quick 메뉴는 한 줄에 하나씩
      return filteredMenus.map((item, i) => ({
        id: `quick-${i}`,
        item,
        isQuick: true
      }));
    }
    
    // 일반 메뉴는 두 개씩
    const rows = [];
    for (let i = 0; i < filteredMenus.length; i += 2) {
      rows.push({
        id: `row-${i}`,
        left: filteredMenus[i],
        right: filteredMenus[i + 1] || null,
        isQuick: false
      });
    }
    return rows;
  }, [filteredMenus, cat]);

  /* ───────── Quick 메뉴 핸들러 ───────── */
  const getQuantity = (itemId) => quickQuantities[itemId] || 1;
  
  const updateQuantity = (itemId, delta) => {
    setQuickQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
    }));
  };

  const handleQuickAdd = (item) => {
    const quantity = getQuantity(item.id);

    Alert.alert(
      '장바구니 담기',
      `${item.quickLabel} ${quantity}개가 담겼습니다.\n바로 결제할까요?`,
      [
        {
          text: '결제하기',
          onPress: () => {
            // 장바구니에 추가
            addToCart({
              id: item._id || item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              quantity,
              options: item.options,
              totalPrice: item.price * quantity,
              images: item.images,
              imageUrl: item.imageUrl,
            });

            // 수량을 1로 초기화
            setQuickQuantities(prev => ({
              ...prev,
              [item.id]: 1
            }));
            
            // 바로 결제 진행
            Alert.alert(
              '결제 확인',
              `총 ${(item.price * quantity).toLocaleString()}원을 결제하시겠습니까?`,
              [
                {
                  text: '결제하기',
                  onPress: () => {
                    // 결제 완료 메시지
                    Alert.alert('주문 완료', '주문이 접수되었습니다!');
                    // 장바구니 비우기
                    clearCart();
                    // Home으로 이동
                    nav.navigate('Home');
                  }
                },
                {
                  text: ''
                },
                {
                  text: '취소',
                  onPress: () => {}
                },
              ]
            );
          }
        },
        {
          text: '장바구니 담기',
          onPress: () => {
            // 장바구니에 추가
            addToCart({
              id: item._id || item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              quantity,
              options: item.options,
              totalPrice: item.price * quantity,
              images: item.images,
              imageUrl: item.imageUrl,
            });

            // 수량을 1로 초기화
            setQuickQuantities(prev => ({
              ...prev,
              [item.id]: 1
            }));
            
            // 현재 화면에 머물기 (이동하지 않음)
          }
        },
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            // 아무것도 하지 않음
          }
        }
      ],
      { cancelable: false }
    );
  };

  /* ───────── 렌더러 ───────── */
  const renderChip = ({ item, index }) => {
    const sel = item === cat;
    return (
      <TouchableOpacity
        style={[ss.chip, sel && ss.chipSel]}
        onPress={() => onSelCat(item, index)}
      >
        <Text style={sel ? ss.chipTxtSel : ss.chipTxt}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const renderQuickCard = (item) => {
    const quantity = getQuantity(item.id);
    
    return (
      <View style={ss.quickCard}>
        <TouchableOpacity 
          style={ss.quickInfo}
          onPress={() => nav.navigate('MenuDetail', { 
            item: {
              ...item,
              _id: item._id || item.id
            },
            initialOptions: item.options 
          })}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={ss.quickImg}
            resizeMode="contain"
          />
          <View style={ss.quickDetails}>
            <Text style={ss.quickName}>{item.quickLabel}</Text>
            <Text style={ss.quickOptions}>
              {item.options.size}, {item.options.temperature === 'hot' ? '뜨거운' : '차가운'}
            </Text>
            <Text style={ss.quickPrice}>{item.price.toLocaleString()}원</Text>
          </View>
        </TouchableOpacity>
        
        <View style={ss.quickControls}>
          <View style={ss.quantityControls}>
            <TouchableOpacity
              style={ss.quantityButton}
              onPress={() => updateQuantity(item.id, -1)}
            >
              <Text style={ss.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={ss.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={ss.quantityButton}
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Text style={ss.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={ss.addButton}
            onPress={() => handleQuickAdd(item)}
          >
            <Text style={ss.addButtonText}>담기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSingleCard = item => {
    if (!item) return <View style={ss.cardEmpty} />;

    const imgs = item.images?.length ? item.images : [item.imageUrl];
    const icedOnly = item.temperatureOptions?.length === 1
                  && item.temperatureOptions[0] === 'iced';

    return (
      <TouchableOpacity
        style={ss.card}
        onPress={() => nav.navigate('MenuDetail', { item })}
      >
        <View style={imgs.length > 1 ? ss.imgRow : null}>
          {imgs.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={imgs.length > 1 ? ss.imgMulti : ss.img}
              resizeMode="contain"
            />
          ))}
        </View>
        <Text style={ss.name} numberOfLines={1}>
         {item.name}
         {icedOnly && (
          <Text style={ss.icedOnly}> (ICE)</Text>
         )}
        </Text>
        <Text style={ss.cat}>{item.category}</Text>
        <Text style={ss.price}>{item.price.toLocaleString()}원</Text>
      </TouchableOpacity>
    );
  };

  /* ───────── UI ───────── */
  return (
    <View style={ss.root}>
      {/* 상단 고정 영역 */}
      <View>
        {/* ─ Top bar ─ */}
        <View style={ss.topBar}>
          <TouchableOpacity onPress={nav.goBack}>
            <Icon name="arrow-back" size={26} />
          </TouchableOpacity>
          <Text style={ss.title}>메뉴</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* ─ Control row ─ */}
        <View style={ss.ctrl}>
          <TouchableOpacity style={ss.cart} onPress={() => nav.navigate('Cart')}>
            <Text style={ss.cartTxt}>장바구니</Text>
          </TouchableOpacity>
        </View>

        {/* ─ Category chips ─ */}
        <View style={ss.catContainer}>
          <FlatList
            ref={catRef}
            data={cats}
            horizontal
            keyExtractor={c => c}
            renderItem={renderChip}
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, i) => ({ length: 90, offset: 90 * i, index: i })}
            contentContainerStyle={ss.catRow}
          />
        </View>
      </View>

      {/* ─ 메뉴 카드 리스트 ─ */}
      <ScrollView
        style={ss.scrollView}
        contentContainerStyle={ss.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map(row => (
          row.isQuick ? (
            <View key={row.id}>
              {renderQuickCard(row.item)}
            </View>
          ) : (
            <View key={row.id} style={ss.row}>
              {renderSingleCard(row.left)}
              {renderSingleCard(row.right)}
            </View>
          )
        ))}
      </ScrollView>
    </View>
  );
}

/* ───────── StyleSheet ───────── */
const ss = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  /* top */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

  /* control */
  ctrl: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  cart: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cartTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* chips */
  catContainer: {
    height: 40,
    backgroundColor: '#fff',
  },
  catRow: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  chip: {
    width: 80,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  chipSel: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipTxt: {
    fontSize: 14,
    color: '#333',
  },
  chipTxtSel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },

  /* ScrollView */
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },

  /* rows */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  /* cards */
  card: {
    width: Math.floor((screenWidth - 32) / 2),
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  cardEmpty: {
    width: Math.floor((screenWidth - 32) / 2),
  },
  imgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  img: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  imgMulti: {
    width: '48%',
    height: 120,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#000',
  },
  cat: {
    fontSize: 13,
    color: '#666',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 2,
  },

  /* Quick 메뉴 스타일 */
  quickCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  quickImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  quickDetails: {
    flex: 1,
  },
  quickName: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  quickOptions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quickPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quickControls: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});