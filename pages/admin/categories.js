import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', image: null });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setCategories(data);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result.split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(form),
    });
    fetchCategories();
    setForm({ title: '', description: '', image: null });
    setEditingId(null);
  };

  const handleEdit = (category) => {
    setForm({
      title: category.title,
      description: category.description,
      image: category.image,
    });
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchCategories();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="p-2 border rounded"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white p-2 rounded">
          {editingId ? 'Update Category' : 'Add Category'}
        </button>
      </form>
      <div className="grid grid-cols-1 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="p-4 border rounded flex justify-between">
            <div>
              <h2 className="text-lg font-bold">{category.title}</h2>
              <p>{category.description}</p>
              {category.image && (
                <img
                  src={`data:image/jpeg;base64,${category.image}`}
                  alt={category.title}
                  className="w-32 h-32 object-cover"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}