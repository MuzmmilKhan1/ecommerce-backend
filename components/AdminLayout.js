'use client'
import { useRouter } from 'next/navigation'; // ✅ FIXED
import { useEffect, useState } from 'react';
import Link from 'next/link';
import '../app/globals.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login'); // ✅ No change here
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="space-x-4">
            <Link href="/admin/products">Products</Link>
            <Link href="/admin/categories">Categories</Link>
            <Link href="/admin/blogs">Blogs</Link>
            <Link href="/admin/orders">Orders</Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/admin/login');
              }}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
