import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  nameFr: String,
  price: Number,
  quantity: Number,
});

const OrderSchema = new mongoose.Schema({
  items: [OrderItemSchema],
  total: Number,
  amountPaid: Number,
  change: Number,
  waiter: String,
  shift: { type: String, enum: ['matin', 'soir'] },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
