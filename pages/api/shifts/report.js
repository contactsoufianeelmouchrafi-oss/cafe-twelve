import { connectDB } from '../../../lib/mongodb';
import Order from '../../../lib/Order';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    const { shift, date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    let query = { createdAt: { $gte: start, $lte: end } };
    if (shift) query.shift = shift;

    const orders = await Order.find(query);
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    // Sales by waiter
    const byWaiter = {};
    orders.forEach(o => {
      if (!byWaiter[o.waiter]) byWaiter[o.waiter] = { total: 0, orders: 0 };
      byWaiter[o.waiter].total += o.total;
      byWaiter[o.waiter].orders += 1;
    });

    // Top items
    const itemCount = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!itemCount[item.nameFr]) itemCount[item.nameFr] = { qty: 0, total: 0 };
        itemCount[item.nameFr].qty += item.quantity;
        itemCount[item.nameFr].total += item.price * item.quantity;
      });
    });

    return res.status(200).json({ totalSales, totalOrders, byWaiter, itemCount, orders });
  }

  res.status(405).end();
}
