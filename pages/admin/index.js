import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-4">Welcome to the Admin Dashboard</h1>
      <p>Use the navigation to manage products, categories, and blogs.</p>
    </AdminLayout>
  );
}