import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { useMenu } from '../contexts/MenuContext';
import { useVoice } from '../contexts/VoiceContext';

const { width: screenWidth } = Dimensions.get('window');

export default function MenuListScreen() {
  const nav = useNavigation();
  const { menus } = useMenu();
  const { isListening, startListening, stopListening } = useVoice();

  /* ───────── 1) Hot / Iced 항목 병합 ───────── */
  const mergedMenus = useMemo(() => {
    const dict = {};

    menus.forEach(m => {
      // "아메리카노 (Hot)" → "아메리카노"
      const base = m.name.replace(/\s*\((Hot|Iced)\)$/i, '');

      if (!dict[base]) {
        dict[base] = {
          ...m,
          name: base, // 기준 이름으로 교체
          images: [m.imageUrl],
          temperatureOptions: [...m.temperatureOptions],
        };
      } else {
        dict[base].images.push(m.imageUrl);
        dict[base].temperatureOptions = Array.from(
          new Set([...dict[base].temperatureOptions, ...m.temperatureOptions]),
        );
      }
    });

    return Object.values(dict);
  }, [menus]);

  /* ───────── 카테고리 상태 ───────── */
  const [cat, setCat] = useState('All');
  const cats = useMemo(
    () => ['All', ...new Set(mergedMenus.map(m => m.category))],
    [mergedMenus],
  );
  const catRef = useRef(null);
  const onSelCat = (c, i) => {
    setCat(c);
    catRef.current?.scrollToIndex({ index: i, viewPosition: 0.5 });
  };

  /* ───────── 필터링된 메뉴를 2개씩 묶어서 행으로 ───────── */
  const filteredMenus =
    cat === 'All' ? mergedMenus : mergedMenus.filter(m => m.category === cat);

  const data = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredMenus.length; i += 2) {
      rows.push({
        id: `row-${i}`,
        left: filteredMenus[i],
        right: filteredMenus[i + 1] || null,
      });
    }
    return rows;
  }, [filteredMenus]);

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
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[ss.mic, isListening && ss.micRec]}
            onPress={isListening ? stopListening : startListening}
          >
            <Icon name={isListening ? 'mic' : 'mic-none'} size={22} color="#fff" />
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
          <View key={row.id} style={ss.row}>
            {renderSingleCard(row.left)}
            {renderSingleCard(row.right)}
          </View>
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
  mic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micRec: {
    backgroundColor: '#f44336',
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
});
