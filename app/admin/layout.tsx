import { redirect } from 'next/navigation';
import { getCurrentUser, getAdminUser } from '@/lib/auth';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth kontrolu
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const adminUser = await getAdminUser(user.id);
  if (!adminUser) {
    redirect('/login?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Sidebar */}
      <AdminSidebar admin={adminUser} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader admin={adminUser} />

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}