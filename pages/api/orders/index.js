import { connectDB } from '../../../lib/mongodb';
import Order from '../../../lib/Order';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const order = await Order.create(req.body);
      return res.status(201).json(order);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    const { shift, date } = req.query;
    let query = {};
    if (shift) query.shift = shift;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  }

  res.status(405).end();
}
