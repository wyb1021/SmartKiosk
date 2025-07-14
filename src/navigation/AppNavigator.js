import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MenuListScreen from '../screens/MenuListScreen';
import MenuDetailScreen from '../screens/MenuDetailScreen';
import CartScreen from '../screens/CartScreen';
import RecommendationListScreen from '../screens/RecommendationListScreen'

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '홈' }}
      />
      <Stack.Screen
        name="MenuList"
        component={MenuListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MenuDetail"
        component={MenuDetailScreen}
        options={{ headerShown: false }} // 이 부분을 추가하여 MenuDetailScreen의 기본 헤더를 숨깁니다.
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: '장바구니' }}
      />
      <Stack.Screen
        name="RecommendationList"
        component={RecommendationListScreen}
      />
    </Stack.Navigator>
  );
}