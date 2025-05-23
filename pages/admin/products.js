import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import QuillEditor from '../../components/QuillEditor';
import parse from 'html-react-parser';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    rating: '',
    category: '',
    isNew: false,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setProducts(data);
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
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        rating: parseFloat(form.rating),
      }),
    });
    fetchProducts();
    setForm({ name: '', description: '', price: '', image: null, rating: '', category: '', isNew: false });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    console.log(product);
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
      isNew: product.isNew,
    });
    setEditingId(product.id);
    setForm({
      ...form,
      description: product.description,
    })
  };

  const handleDelete = async (id) => {
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchProducts();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <QuillEditor
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Rating"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className="p-2 border rounded"
            step="0.1"
            min="0"
            max="5"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
            />
            <span className="ml-2">Is New</span>
          </label>
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white p-2 rounded">
          {editingId ? 'Update Product' : 'Add Product'}
        </button>
      </form>
      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded flex justify-between">
            <div>
              <h2 className="text-lg font-bold">{product.name}</h2>
              <div className="prose mb-2">{parse(product.description)}</div>
              <p>Price: ${product.price}</p>
              <p>Category: {product.category}</p>
              <p>Rating: {product.rating}</p>
              <p>{product.isNew ? 'New' : 'Not New'}</p>
              {product.image && (
                <img
                  src={`data:image/jpeg;base64,${product.image}`}
                  alt={product.name}
                  className="w-32 h-32 object-cover"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(product)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
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