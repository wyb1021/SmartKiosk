// server/seed/seedMenu.js
import mongoose from 'mongoose';
import Menu from '../models/menu.models.js';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);
await Menu.deleteMany({});

/** 공통 편의 변수 */
const host = process.env.HOST || '172.16.166.104';   // PC LAN IP
const port = process.env.PORT || 4000;               // server/.env 와 동일
const img = f => `http://${host}:${port}/images/${f}`;

/** 메뉴 시드 */
await Menu.insertMany([
  /* ───────── Coffee ───────── */
  {
    name: '아메리카노 (Hot)',
    category: 'Coffee',
    price: 3500,
    imageUrl: img('americanohot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '카페 라떼 (Hot)',
    category: 'Coffee',
    price: 4200,
    imageUrl: img('caffelattehot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '카페 라떼 (Iced)',
    category: 'Coffee',
    price: 4500,
    imageUrl: img('caffelatteice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '카페 모카 (Hot)',
    category: 'Coffee',
    price: 4700,
    imageUrl: img('caffemochahot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '카페 모카 (Iced)',
    category: 'Coffee',
    price: 5000,
    imageUrl: img('caffemochaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '카라멜 마키아토 (Hot)',
    category: 'Coffee',
    price: 4800,
    imageUrl: img('caramelmacchiatohot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '카라멜 마키아토 (Iced)',
    category: 'Coffee',
    price: 5100,
    imageUrl: img('caramelmacchiatoice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  /* ───────── Tea / Latte ───────── */
  {                  // 블루베리스무디
    name: '블루베리 스무디',
    category: 'Smoothie',
    price: 5200,
    imageUrl: img('blueberrysmoothieice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {                  // 체리티
    name: '체리티',
    category: 'Tea',
    price: 3800,
    imageUrl: img('cherryteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {                  // 체리티
    name: '아이스티',
    category: 'Tea',
    price: 3500,
    imageUrl: img('icetea.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '키위 스무디',
    category: 'Smoothie',
    price: 5500,
    imageUrl: img('kiwismoothieice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '밀크티',
    category: 'Tea',
    price: 4300,
    imageUrl: img('milkteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '말차 라떼 (Hot)',
    category: 'Latte',
    price: 4600,
    imageUrl: img('matchalattehot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small','medium','large'],
  },
  {
    name: '말차 라떼 (Iced)',
    category: 'Latte',
    price: 4900,
    imageUrl: img('matchalatteice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small','medium','large'],
  },
  {
    name: '레몬 에이드',
    category: 'Ade',
    price: 5000,
    imageUrl: img('lemonadeice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '오렌지 스무디',
    category: 'Smoothie',
    price: 5400,
    imageUrl: img('orangesmoothieice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '페퍼민트 티 (Hot)',
    category: 'Tea',
    price: 3700,
    imageUrl: img('peppermintteahot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '페퍼민트 티 (Iced)',
    category: 'Tea',
    price: 3900,
    imageUrl: img('peppermintteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '루이보스 티 (Hot)',
    category: 'Tea',
    price: 3600,
    imageUrl: img('rooibosteahot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '루이보스 티 (Iced)',
    category: 'Tea',
    price: 3800,
    imageUrl: img('rooibosteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  /* ───────── 디저트 ───────── */
  {
    name: '치즈케이크',
    category: 'Dessert',
    price: 4800,
    imageUrl: img('cheesecake.jpg'),
    sizeOptions: ['piece'],
  },
  {
    name: '초코칩 쿠키',
    category: 'Dessert',
    price: 2500,
    imageUrl: img('chocolatechipcookie.jpg'),
    sizeOptions: ['piece'],
  },
  {
    name: '초콜릿 머핀',
    category: 'Dessert',
    price: 3000,
    imageUrl: img('chocolatemuffin.jpg'),
    sizeOptions: ['piece'],
  },
  {
    name: '크루아상',
    category: 'Dessert',
    price: 3200,
    imageUrl: img('croissant.jpg'),
    sizeOptions: ['piece'],
  },
  {
    name: '뺑 오 쇼콜라',
    category: 'Dessert',
    price: 3500,
    imageUrl: img('painauchocolat.jpg'),
    sizeOptions: ['piece'],
  },
  {
    name: '판나코타',
    category: 'Dessert',
    price: 4000,
    imageUrl: img('pannacotta.jpg'),
    sizeOptions: ['cup'],
  },
  {
    name: '푸딩',
    category: 'Dessert',
    price: 3500,
    imageUrl: img('pudding.jpg'),
    sizeOptions: ['cup'],
  },
  {
    name: '소금빵',
    category: 'Dessert',
    price: 2900,
    imageUrl: img('saltbread.jpg'),
    sizeOptions: ['piece'],
  },
]);

console.log('✓ Menu seeded');
process.exit(0);
