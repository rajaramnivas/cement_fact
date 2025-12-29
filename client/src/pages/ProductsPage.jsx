import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();

  async function loadProducts() {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      setMessage('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function placeQuickOrder(productId) {
    setPlacing(true);
    setMessage('');
    try {
      await api.post('/orders', { items: [{ productId, quantity: 1 }] });
      setMessage('Order placed');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="heading">
        <div>
          <h2>Products</h2>
          <p>Browse available cement and steel items.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadProducts} disabled={loading}>
          Refresh
        </button>
      </div>

      {message && <div className="card">{message}</div>}

      {loading ? (
        <div className="card">Loading products…</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {products.map((p) => (
            <div className="card" key={p._id}>
              <div className="heading">
                <h3>{p.name}</h3>
                <span className="badge">{p.category}</span>
              </div>
              <p>{p.description || 'No description'}</p>
              <p>Price: ${p.price}</p>
              <p>Stock: {p.stock}</p>
              {isAuthenticated ? (
                <button
                  className="btn"
                  onClick={() => placeQuickOrder(p._id)}
                  disabled={placing || p.stock < 1}
                >
                  {p.stock < 1 ? 'Out of stock' : placing ? 'Working…' : 'Quick order x1'}
                </button>
              ) : (
                <p style={{ color: '#f59e0b' }}>Login to place orders</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
