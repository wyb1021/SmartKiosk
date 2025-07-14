import mongoose from 'mongoose';
const { Schema } = mongoose;

/* 주문 항목 구조 */
const orderItemSchema = new Schema({
  menuId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  qty:     { type: Number, required: true },
  price:   { type: Number, required: true },   // 단가(옵션 적용가)
});

/* 주문 본문 */
const orderSchema = new Schema(
  {
    items:       [orderItemSchema],
    totalPrice:  Number,
    orderedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model('Order', orderSchema);
