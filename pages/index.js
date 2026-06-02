import { useState, useEffect } from 'react';
import { MENU, CATEGORIES, STAFF } from '../lib/menu';
import styles from '../styles/pos.module.css';

export default function POS() {
  const [activeCategory, setActiveCategory] = useState('cafe');
  const [cart, setCart] = useState([]);
  const [waiter, setWaiter] = useState('');
  const [shift, setShift] = useState('matin');
  const [currentShift, setCurrentShift] = useState(null);
  const [view, setView] = useState('login'); // login | pos | payment | report
  const [amountPaid, setAmountPaid] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchActiveShift();
  }, []);

  const fetchActiveShift = async () => {
    const res = await fetch('/api/shifts?active=1');
    const data = await res.json();
    if (data) {
      setCurrentShift(data);
      setWaiter(data.waiter);
      setShift(data.type);
      setView('pos');
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const openShift = async () => {
    if (!waiter) return;
    setLoading(true);
    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: shift, waiter, isOpen: true }),
    });
    const data = await res.json();
    setCurrentShift(data);
    setView('pos');
    setLoading(false);
    showNotification(`Shift ${shift} ouvert pour ${waiter}`);
  };

  const closeShift = async () => {
    if (!confirm('Fermer le shift et voir le rapport?')) return;
    setLoading(true);
    await fetch('/api/shifts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId: currentShift._id, type: shift }),
    });
    await loadReport();
    setView('report');
    setCurrentShift(null);
    setLoading(false);
  };

  const loadReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/shifts/report?shift=${shift}&date=${today}`);
    const data = await res.json();
    setReport(data);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item.quantity === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const change = amountPaid ? parseFloat(amountPaid) - total : 0;

  const confirmPayment = async () => {
    if (!amountPaid || parseFloat(amountPaid) < total) {
      showNotification('Montant insuffisant!');
      return;
    }
    setLoading(true);
    const order = {
      items: cart,
      total,
      amountPaid: parseFloat(amountPaid),
      change,
      waiter,
      shift,
    };
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const saved = await res.json();
    setLastOrder(saved);
    printTicket(saved);
    setCart([]);
    setAmountPaid('');
    setView('pos');
    setLoading(false);
    showNotification('Commande validée! ✓');
  };

  const printTicket = (order) => {
    const win = window.open('', '_blank', 'width=300,height=600');
    const date = new Date(order.createdAt).toLocaleString('fr-MA');
    win.document.write(`
      <html><head><style>
        body { font-family: monospace; font-size: 12px; width: 280px; margin: 0 auto; }
        h2 { text-align: center; font-size: 18px; margin: 5px 0; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; }
        .total { font-size: 15px; font-weight: bold; }
      </style></head><body>
        <h2>☕ CAFE TWELVE</h2>
        <p class="center">${date}</p>
        <p class="center">Serveur: ${order.waiter}</p>
        <div class="line"></div>
        ${order.items.map(i => `
          <div class="row"><span>${i.nameFr} x${i.quantity}</span><span>${i.price * i.quantity} DH</span></div>
        `).join('')}
        <div class="line"></div>
        <div class="row total"><span>TOTAL</span><span>${order.total} DH</span></div>
        <div class="row"><span>Payé</span><span>${order.amountPaid} DH</span></div>
        <div class="row"><span>Monnaie</span><span>${order.change} DH</span></div>
        <div class="line"></div>
        <p class="center">Merci de votre visite!</p>
        <p class="center">شكرا على زيارتكم</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const filteredMenu = MENU.filter(i => i.category === activeCategory);

  // LOGIN VIEW
  if (view === 'login') return (
    <div className={styles.login}>
      <div className={styles.loginCard}>
        <h1>☕ Cafe Twelve</h1>
        <p className={styles.subtitle}>كافيه تويلف</p>
        <div className={styles.field}>
          <label>Serveur / النادل</label>
          <select value={waiter} onChange={e => setWaiter(e.target.value)}>
            <option value="">-- Choisir --</option>
            {STAFF.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Shift</label>
          <div className={styles.shiftBtns}>
            <button className={shift === 'matin' ? styles.active : ''} onClick={() => setShift('matin')}>🌅 Matin</button>
            <button className={shift === 'soir' ? styles.active : ''} onClick={() => setShift('soir')}>🌙 Soir</button>
          </div>
        </div>
        <button className={styles.startBtn} onClick={openShift} disabled={!waiter || loading}>
          {loading ? 'Chargement...' : 'Ouvrir le shift'}
        </button>
      </div>
    </div>
  );

  // REPORT VIEW
  if (view === 'report') return (
    <div className={styles.report}>
      <div className={styles.reportCard}>
        <h1>📊 Rapport — Shift {shift}</h1>
        <p>{new Date().toLocaleDateString('fr-MA')}</p>
        {report && <>
          <div className={styles.reportStats}>
            <div className={styles.stat}><span>{report.totalOrders}</span><label>Commandes</label></div>
            <div className={styles.stat}><span>{report.totalSales} DH</span><label>Total Ventes</label></div>
          </div>
          <h3>Par serveur</h3>
          {Object.entries(report.byWaiter).map(([name, data]) => (
            <div key={name} className={styles.reportRow}>
              <span>{name}</span>
              <span>{data.orders} cmd — {data.total} DH</span>
            </div>
          ))}
          <h3>Articles vendus</h3>
          {Object.entries(report.itemCount).sort((a,b) => b[1].qty - a[1].qty).map(([name, data]) => (
            <div key={name} className={styles.reportRow}>
              <span>{name}</span>
              <span>x{data.qty} — {data.total} DH</span>
            </div>
          ))}
        </>}
        <button className={styles.startBtn} onClick={() => setView('login')}>Nouveau Shift</button>
      </div>
    </div>
  );

  // PAYMENT VIEW
  if (view === 'payment') return (
    <div className={styles.payment}>
      <div className={styles.paymentCard}>
        <h2>💰 Paiement</h2>
        <div className={styles.orderSummary}>
          {cart.map(item => (
            <div key={item.id} className={styles.payRow}>
              <span>{item.nameFr} x{item.quantity}</span>
              <span>{item.price * item.quantity} DH</span>
            </div>
          ))}
          <div className={styles.payTotal}>
            <span>TOTAL</span>
            <span>{total} DH</span>
          </div>
        </div>
        <div className={styles.field}>
          <label>Montant reçu (DH)</label>
          <input
            type="number"
            value={amountPaid}
            onChange={e => setAmountPaid(e.target.value)}
            placeholder="Ex: 50"
            autoFocus
          />
        </div>
        {amountPaid && parseFloat(amountPaid) >= total && (
          <div className={styles.changeBox}>
            Monnaie à rendre: <strong>{(parseFloat(amountPaid) - total).toFixed(2)} DH</strong>
          </div>
        )}
        <div className={styles.payBtns}>
          <button className={styles.cancelBtn} onClick={() => setView('pos')}>Retour</button>
          <button className={styles.confirmBtn} onClick={confirmPayment} disabled={loading || !amountPaid || parseFloat(amountPaid) < total}>
            {loading ? '...' : '✓ Valider & Imprimer'}
          </button>
        </div>
        {/* Quick amounts */}
        <div className={styles.quickAmounts}>
          {[10, 20, 50, 100, 200].map(amt => (
            <button key={amt} onClick={() => setAmountPaid(String(amt))}>{amt} DH</button>
          ))}
        </div>
      </div>
    </div>
  );

  // MAIN POS VIEW
  return (
    <div className={styles.pos}>
      {notification && <div className={styles.notification}>{notification}</div>}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>☕ Cafe Twelve</span>
          <span className={styles.shiftBadge}>{shift === 'matin' ? '🌅' : '🌙'} {waiter}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.time}>{new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}</span>
          <button className={styles.closeShiftBtn} onClick={closeShift}>Fermer Shift</button>
        </div>
      </header>

      <div className={styles.main}>
        {/* Left: Menu */}
        <div className={styles.menuSection}>
          {/* Categories */}
          <div className={styles.categories}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.catBtn} ${activeCategory === cat.id ? styles.catActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.nameFr}</span>
                <small>{cat.name}</small>
              </button>
            ))}
          </div>

          {/* Items */}
          <div className={styles.items}>
            {filteredMenu.map(item => (
              <button key={item.id} className={styles.itemBtn} onClick={() => addToCart(item)}>
                <span className={styles.itemName}>{item.nameFr}</span>
                <span className={styles.itemAr}>{item.name}</span>
                <span className={styles.itemPrice}>{item.price} DH</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className={styles.cartSection}>
          <div className={styles.cartHeader}>
            <h3>🧾 Commande</h3>
            {cart.length > 0 && <button className={styles.clearBtn} onClick={clearCart}>Vider</button>}
          </div>

          <div className={styles.cartItems}>
            {cart.length === 0 && (
              <div className={styles.emptyCart}>
                <p>Aucun article</p>
                <p>لا توجد طلبات</p>
              </div>
            )}
            {cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <span>{item.nameFr}</span>
                  <small>{item.name}</small>
                </div>
                <div className={styles.cartItemControls}>
                  <button onClick={() => removeFromCart(item.id)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>
                <span className={styles.cartItemPrice}>{item.price * item.quantity} DH</span>
              </div>
            ))}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>{total} DH</span>
            </div>
            <button
              className={styles.payBtn}
              disabled={cart.length === 0}
              onClick={() => setView('payment')}
            >
              💰 Payer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
