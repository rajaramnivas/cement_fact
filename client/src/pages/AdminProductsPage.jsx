import React, { useEffect, useState } from 'react';
import api from '../api/client';

const initialForm = {
  name: '',
  category: 'cement',
  description: '',
  price: 0,
  stock: 0,
  unit: 'unit'
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

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

  function handleEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
      unit: product.unit
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function saveProduct(e) {
    e.preventDefault();
    setMessage('');
    try {
      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, form);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? data : p)));
      } else {
        const { data } = await api.post('/products', form);
        setProducts((prev) => [data, ...prev]);
      }
      resetForm();
      setMessage('Saved');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save product');
    }
  }

  async function archiveProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not archive product');
    }
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="heading">
          <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
          <button className="btn btn-secondary" onClick={resetForm}>
            Reset
          </button>
        </div>
        <form onSubmit={saveProduct}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="cement">Cement</option>
            <option value="steel">Steel</option>
            <option value="other">Other</option>
          </select>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            required
          />
          <input
            placeholder="Unit (e.g., bag, ton)"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <button className="btn" type="submit">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
        {message && <p style={{ color: '#f59e0b' }}>{message}</p>}
      </div>

      <div className="card">
        <div className="heading">
          <h2>Inventory</h2>
          <button className="btn btn-secondary" onClick={loadProducts} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price}</td>
                  <td>{p.stock}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => handleEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => archiveProduct(p._id)}>
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
