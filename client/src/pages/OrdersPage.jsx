import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext';

const statusOptions = ['pending', 'processing', 'completed', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  async function loadOrders() {
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      setMessage('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id, status) {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update status');
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="heading">
        <div>
          <h2>Orders</h2>
          <p>{user?.role === 'admin' ? 'All orders' : 'Your recent orders'}.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadOrders} disabled={loading}>
          Refresh
        </button>
      </div>

      {message && <div className="card">{message}</div>}

      {loading ? (
        <div className="card">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="card">No orders yet.</div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          {orders.map((order) => (
            <div className="card" key={order._id}>
              <div className="heading">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className={`status-pill ${order.status}`}>{order.status}</div>
              </div>
              <p>Total: ${order.total}</p>
              <div className="grid" style={{ gap: 6 }}>
                {order.items.map((item, idx) => (
                  <div key={`${order._id}-${idx}`} className="badge">
                    <span>{item.product?.name || 'Product'}</span>
                    <span>x{item.quantity}</span>
                    <span>${item.priceAtPurchase}</span>
                  </div>
                ))}
              </div>
              {user?.role === 'admin' && (
                <div style={{ marginTop: 12 }}>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
