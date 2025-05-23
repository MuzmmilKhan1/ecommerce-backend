import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'returned'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [form, setForm] = useState({ userEmail: '', totalAmount: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setOrders(data);
    const initialStatuses = {};
    data.forEach(order => {
      initialStatuses[order.id] = order.status;
    });
    setSelectedStatuses(initialStatuses);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatuses(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const handleUpdateStatus = async (orderId) => {
    const newStatus = selectedStatuses[orderId];
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  };

  const handleEdit = (order) => {
    setForm({
      userEmail: order.user.email,
      totalAmount: order.totalAmount,
    });
    setSelectedStatuses(prev => ({ ...prev, [order.id]: order.status }));
    setEditingId(order.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    await fetch(`/api/orders/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        userEmail: form.userEmail,
        totalAmount: parseFloat(form.totalAmount),
        status: selectedStatuses[editingId],
      }),
    });
    fetchOrders();
    setForm({ userEmail: '', totalAmount: '' });
    setEditingId(null);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
      {editingId && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="User Email"
              value={form.userEmail}
              onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Total Amount"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <select
              value={selectedStatuses[editingId]}
              onChange={(e) => handleStatusChange(editingId, e.target.value)}
              className="p-2 border rounded"
            >
              {allowedStatuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-4 bg-blue-600 text-white p-2 rounded">
            Update Order
          </button>
        </form>
      )}
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">User Email</th>
              <th className="py-2 px-4 border-b">Total Amount</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td className="border px-4 py-2">{order.id}</td>
                <td className="border px-4 py-2">{order.user.email}</td>
                <td className="border px-4 py-2">${order.totalAmount}</td>
                <td className="border px-4 py-2">
                  <select
                    value={selectedStatuses[order.id]}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    {allowedStatuses.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(order)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}