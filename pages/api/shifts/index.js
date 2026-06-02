import { connectDB } from '../../../lib/mongodb';
import Shift from '../../../lib/Shift';
import Order from '../../../lib/Order';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    // Open a new shift
    try {
      // Close any open shifts first
      await Shift.updateMany({ isOpen: true }, { isOpen: false, closedAt: new Date() });
      const shift = await Shift.create(req.body);
      return res.status(201).json(shift);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    const { active } = req.query;
    if (active) {
      const shift = await Shift.findOne({ isOpen: true });
      return res.status(200).json(shift);
    }
    const shifts = await Shift.find().sort({ openedAt: -1 }).limit(20);
    return res.status(200).json(shifts);
  }

  if (req.method === 'PUT') {
    // Close shift and calculate totals
    try {
      const { shiftId, type } = req.body;
      const orders = await Order.find({ shift: type, createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
      const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
      const shift = await Shift.findByIdAndUpdate(shiftId, {
        isOpen: false,
        closedAt: new Date(),
        totalSales,
        totalOrders: orders.length,
      }, { new: true });
      return res.status(200).json(shift);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}
