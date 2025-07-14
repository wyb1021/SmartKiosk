import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext'; // CartContext 임포트
import { useMenu } from '../contexts/MenuContext'; // useMenu 임포트 (전체 메뉴 데이터 필요)
import { handleVoiceCommand } from '../services/voiceCommand'; // 만약 voiceCommand.js로 저장하셨다면 이 경로 사용

const HomeScreen = () => {
  const navigation = useNavigation();
  const { cartItems, addToCart, updateItemOptions, removeItem, clearCart } = useContext(CartContext);
  const { menus } = useMenu(); // 모든 메뉴 데이터를 가져옵니다.

  // 음성 명령을 처리하는 함수
  const onVoiceCommand = async (voiceInput) => {
    // voiceCommand.js의 handleVoiceCommand 함수 호출
    await handleVoiceCommand(
      voiceInput,
      cartItems,
      menus,
      { addToCart, updateItemOptions, removeItem, clearCart } // CartContext 함수들을 객체로 전달
    );
  };

  return (
    <View style={styles.container}>
      {/* 이미지 추가 */}
      <Image
        source={require('../assets/geminikiosk.png')} // 이미지 파일 경로에 맞게 수정
        style={styles.heroImage} // 스타일 추가
        resizeMode="contain" // 이미지 비율 유지
      />

      <Text style={styles.title}>이지 키오스크</Text>
      <Text style={styles.subtitle}>음성과 터치로 주문하세요</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MenuList')} // 네비게이션 추가
      >
        <Text style={styles.buttonText}>주문 시작</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  // 새로 추가할 이미지 스타일
  heroImage: {
    width: 400, // 이미지 너비 조절
    height: 400, // 이미지 높이 조절
    marginBottom: 30, // 텍스트와의 간격
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;