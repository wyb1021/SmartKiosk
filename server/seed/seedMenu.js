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
    name: '아메리카노 (Iced)',
    category: '커피',
    price: 3500,
    imageUrl: img('americanoice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['저가', '저칼로리', '잘 팔리는'],
    adminPriority: 1,   // 👑 최우선 노출
    popularity: 300,
  },
  {
    name: '아메리카노 (Hot)',
    category: '커피',
    price: 3500,
    imageUrl: img('americanohot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['저가','저칼로리', '잘 팔리는'],
    adminPriority: 2,
    popularity: 280,
  },
  {
    name: '카페 라떼 (Iced)',
    category: '커피',
    price: 4200,
    imageUrl: img('caffelatteice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어르신', '잘 팔리는'],
    adminPriority: 3,
    popularity: 220,
  },
  {
    name: '카페 라떼 (Hot)',
    category: '커피',
    price: 4200,
    imageUrl: img('caffelattehot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어르신', '잘 팔리는'],
    adminPriority: 4,
    popularity: 200,
  },
  {
    name: '카페 모카 (Iced)',
    category: '커피',
    price: 4700,
    imageUrl: img('caffemochaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어르신', '달콤'],
    adminPriority: null,
    popularity: 150,
  },
  {
    name: '카페 모카 (Hot)',
    category: '커피',
    price: 4700,
    imageUrl: img('caffemochahot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어르신', '달콤'],
    adminPriority: null,
    popularity: 120,
  },
  {
    name: '카라멜 마키아토 (Iced)',
    category: '커피',
    price: 5100,
    imageUrl: img('caramelmacchiatoice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['달콤'],
    adminPriority: null,
    popularity: 100,
  },
  {
    name: '카라멜 마키아토 (Hot)',
    category: '커피',
    price: 5100,
    imageUrl: img('caramelmacchiatohot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['달콤'],
    adminPriority: null,
    popularity: 80,
  },
  {
    name: '아인슈페너 (Iced)',
    category: '커피',
    price: 5500,
    imageUrl: img('caffeeinspannerice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['크림'],
    adminPriority: null,
    popularity: 115,
  },
  /* ───────── 스무디 & 에이드 ───────── */
  {
    name: '레몬 에이드',
    category: '에이드',
    price: 5000,
    imageUrl: img('lemonadeice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어린이', '저칼로리', '과일'],
    adminPriority: 5,
    popularity: 180,
  },
  {
    name: '블루베리 스무디',
    category: '스무디',
    price: 5200,
    imageUrl: img('blueberrysmoothieice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어린이', '달콤', '과일'],
    adminPriority: null,
    popularity: 140,
  },
  {
    name: '오렌지 스무디',
    category: '스무디',
    price: 5400,
    imageUrl: img('orangesmoothieice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어린이', '달콤', '과일'],
    adminPriority: null,
    popularity: 130,
  },
  {
    name: '키위 스무디',
    category: '스무디',
    price: 5500,
    imageUrl: img('kiwismoothieice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어린이', '과일'],
    adminPriority: null,
    popularity: 110,
  },
  /* ───────── 티 ───────── */
  {
    name: '밀크티',
    category: '티',
    price: 4300,
    imageUrl: img('milkteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어린이', '달콤'],
    adminPriority: 6,
    popularity: 160,
  },
  {
    name: '아이스티',
    category: '티',
    price: 3500,
    imageUrl: img('icetea.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['어린이', '달콤', '잘 팔리는', '저가'],
    adminPriority: null,
    popularity: 90,
  },
  {
    name: '체리티',
    category: '티',
    price: 3800,
    imageUrl: img('cherryteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['저가', '과일', '저칼로리'],
    adminPriority: null,
    popularity: 85,
  },
  {
    name: '루이보스 티 (Iced)',
    category: '티',
    price: 3800,
    imageUrl: img('rooibosteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['저가', '어르신'],
    adminPriority: null,
    popularity: 70,
  },
  {
    name: '루이보스 티 (Hot)',
    category: '티',
    price: 3600,
    imageUrl: img('rooibosteahot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['저가', '어르신'],
    adminPriority: null,
    popularity: 60,
  },
  {
    name: '페퍼민트 티 (Iced)',
    category: '티',
    price: 3700,
    imageUrl: img('peppermintteaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['저가', '어르신'],
    adminPriority: null,
    popularity: 55,
  },
  {
    name: '페퍼민트 티 (Hot)',
    category: '티',
    price: 3700,
    imageUrl: img('peppermintteahot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['저가', '어르신'],
    adminPriority: null,
    popularity: 45,
  },
  /* ───────── 라떼 (말차) ───────── */
  {
    name: '말차 라떼 (Iced)',
    category: '라떼',
    price: 4900,
    imageUrl: img('matchalatteice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['잘 팔리는'],
    adminPriority: null,
    popularity: 95,
  },
  {
    name: '말차 라떼 (Hot)',
    category: '라떼',
    price: 4900,
    imageUrl: img('matchalattehot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['잘 팔리는'],
    adminPriority: null,
    popularity: 80,
  },
  {
    name: '코코아 (Iced)',
    category: '라떼', // 새로운 카테고리 추가
    price: 4000,
    imageUrl: img('cocoaice.jpg'),
    temperatureOptions: ['iced'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['달콤', '어린이', '어르신'],
    adminPriority: null,
    popularity: 85,
  },
  {
    name: '코코아 (Hot)',
    category: '라떼', // 새로운 카테고리 추가
    price: 4000,
    imageUrl: img('cocoahot.jpg'),
    temperatureOptions: ['hot'],
    sizeOptions: ['small', 'medium', 'large'],
    tags: ['달콤', '어린이', '어르신'],
    adminPriority: null,
    popularity: 90,
  },
  /* ───────── 디저트 ───────── */
  {
    name: '소금빵',
    category: '디저트',
    price: 2900,
    imageUrl: img('saltbread.jpg'),
    sizeOptions: ['piece'],
    tags: ['잘 팔리는', '저가'],
    adminPriority: 7,
    popularity: 140,
  },
  {
    name: '크루아상',
    category: '디저트',
    price: 3200,
    imageUrl: img('croissant.jpg'),
    sizeOptions: ['piece'],
    tags: ['잘 팔리는', '저가', '어르신'],
    adminPriority: null,
    popularity: 130,
  },
  {
    name: '치즈케이크',
    category: '디저트',
    price: 4800,
    imageUrl: img('cheesecake.jpg'),
    sizeOptions: ['piece'],
    tags: ['달콤'],
    adminPriority: null,
    popularity: 125,
  },
  {
    name: '뺑 오 쇼콜라',
    category: '디저트',
    price: 3500,
    imageUrl: img('painauchocolat.jpg'),
    sizeOptions: ['piece'],
    tags: ['달콤'],
    adminPriority: null,
    popularity: 76,
  },
  {
    name: '판나코타',
    category: '디저트',
    price: 4000,
    imageUrl: img('pannacotta.jpg'),
    sizeOptions: ['cup'],
    tags: ['달콤', '과일'],
    adminPriority: null,
    popularity: 10,
  },
  {
    name: '푸딩',
    category: '디저트',
    price: 3500,
    imageUrl: img('pudding.jpg'),
    sizeOptions: ['cup'],
    tags: ['달콤', '어린이', '어르신'],
    adminPriority: null,
    popularity: 20,
  },
  {
    name: '초콜릿 칩 쿠키',
    category: '디저트',
    price: 2500,
    imageUrl: img('chocolatechipcookie.jpg'),
    sizeOptions: ['piece'],
    tags: ['달콤', '잘 팔리는', '저가', '어린이'],
    adminPriority: null,
    popularity: 90,
  },
  {
    name: '마카다미아 쿠키',
    category: '디저트',
    price: 2800,
    imageUrl: img('macadamiacookie.jpg'),
    sizeOptions: ['piece'],
    tags: ['달콤', '저가'],
    adminPriority: null,
    popularity: 70,
  },
  {
    name: '초콜릿 머핀',
    category: '디저트',
    price: 3800,
    imageUrl: img('chocolatemuffin.jpg'),
    sizeOptions: ['piece'],
    tags: ['달콤', '어린이', '어르신'],
    adminPriority: null,
    popularity: 65,
  },
]);

console.log('✓ Menu seeded');
process.exit(0);
