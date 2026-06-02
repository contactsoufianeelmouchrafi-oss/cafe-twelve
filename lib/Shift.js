import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema({
  type: { type: String, enum: ['matin', 'soir'] },
  waiter: String,
  openedAt: { type: Date, default: Date.now },
  closedAt: Date,
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
});

export default mongoose.models.Shift || mongoose.model('Shift', ShiftSchema);
