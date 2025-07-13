import mongoose from 'mongoose';
import Menu from '../models/menu.models.js';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);

await Menu.deleteMany({});

await Menu.insertMany([
  {
    name: '아메리카노',
    category: 'Coffee',
    price: 3500,
    imageUrl: 'https://picsum.photos/seed/americano/300',
    temperatureOptions: ['hot', 'iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '카페라떼',
    category: 'Coffee',
    price: 4200,
    imageUrl: 'https://picsum.photos/seed/latte/300',
    temperatureOptions: ['hot', 'iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
  {
    name: '대추차',
    category: 'Tea',
    price: 3800,
    imageUrl: 'https://picsum.photos/seed/jujube/300',
    temperatureOptions: ['hot'],
    sizeOptions: ['medium'],
  },
  {
    name: '고구마라떼',
    category: 'Latte',
    price: 4500,
    imageUrl: 'https://picsum.photos/seed/sweetpotato/300',
    temperatureOptions: ['hot', 'iced'],
    sizeOptions: ['small', 'medium', 'large'],
  },
]);

console.log('✓ Menu seeded');
process.exit(0);