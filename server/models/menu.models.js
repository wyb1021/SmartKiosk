import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, default: 'Beverage' },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },

    sizeOptions:       [String],    // ['small','medium','large']
    temperatureOptions:[String],    // ['hot','iced']
  },
  { timestamps: true }
);

export default mongoose.model('Menu', menuSchema);