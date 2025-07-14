import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, default: 'Beverage' },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },

    sizeOptions:       [String],    // ['small','medium','large']
    temperatureOptions:[String],    // ['hot','iced']
    adminPriority: { type: Number, default: null }, // null = 미설정
    popularity:    { type: Number, default: 0     }, // 주문건수
  },
  { timestamps: true }
);
menuSchema.index({ adminPriority: 1, popularity: -1 });

export default mongoose.model('Menu', menuSchema);