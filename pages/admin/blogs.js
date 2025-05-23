import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import QuillEditor from '../../components/QuillEditor';
import parse from 'html-react-parser';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    image: null,
    category: '',
    author: '',
    date: '',
    readTime: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const res = await fetch('/api/blogs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setBlogs(data);
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
    const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...form,
        date: form.date || new Date().toISOString(),
        readTime: parseInt(form.readTime) || 5,
      }),
    });
    fetchBlogs();
    setForm({ title: '', excerpt: '', image: null, category: '', author: '', date: '', readTime: '' });
    setEditingId(null);
  };

  const handleEdit = (blog) => {
    console.log(blog)
    setForm({
      title: blog.title,
      image: blog.image,
      category: blog.category,
      author: blog.author,
      date: blog.date ? new Date(blog.date).toISOString().split('T')[0] : '',
      readTime: blog.readTime,
    });
    setEditingId(blog.id);
    setForm({
      ...form,
      excerpt: blog.excerpt,
    })
    console.log(form)
  };

  const handleDelete = async (id) => {
    await fetch(`/api/blogs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchBlogs();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Blogs</h1>
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
          <QuillEditor
            value={form.excerpt}
            onChange={(value) => setForm({ ...form, excerpt: value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            placeholder="Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Read Time"
            value={form.readTime}
            onChange={(e) => setForm({ ...form, readTime: e.target.value })}
            className="p-2 border rounded"
            min="1"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white p-2 rounded">
          {editingId ? 'Update Blog' : 'Add Blog'}
        </button>
      </form>
      <div className="grid grid-cols-1 gap-4">
        {blogs.map((blog) => (
          <div key={blog.id} className="p-4 border rounded flex justify-between">
            <div>
              <h2 className="text-lg font-bold">{blog.title}</h2>
              <div className="prose mb-2">{parse(blog.excerpt)}</div>
              <p>Category: {blog.category}</p>
              <p>Author: {blog.author}</p>
              <p>Date: {new Date(blog.date).toLocaleDateString()}</p>
              <p>Read Time: {blog.readTime} min</p>
              {blog.image && (
                <img
                  src={`data:image/jpeg;base64,${blog.image}`}
                  alt={blog.title}
                  className="w-32 h-32 object-cover"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(blog)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(blog.id)}
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