import React, { useEffect, useState } from 'react';
import Layout from '../../components/layouts/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
// UserProfileData zde není přímo potřeba, definujeme AdminUser explicitně
import { UserProfileData } from '../../types/user';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: string;
  subscriptions: { plan_id: string }[] | null;
}

const AdminUsersPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        const data = await response.json();
        alert(`Chyba při změně role: ${data.error}`);
      }
    } catch (err) {
      alert('Došlo k chybě při komunikaci se serverem.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Opravdu si přejete smazat tohoto uživatele? Tato akce je nevratná.')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          const data = await response.json();
          alert(`Chyba při mazání uživatele: ${data.error}`);
        }
      } catch (err) {
        alert('Došlo k chybě při komunikaci se serverem.');
      }
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (status === 'authenticated') {
        // Ověření na klientovi pro UI, skutečné zabezpečení je v API
        // Zde bychom mohli zkontrolovat session.user.email proti ADMIN_EMAIL, pokud bychom ho měli k dispozici na klientovi
        // Pro jednoduchost zatím spoléháme na API route, že vrátí 403 pokud uživatel není admin

        try {
          const response = await fetch('/api/admin/users');
          if (response.status === 403) {
            setError('Nemáte oprávnění pro přístup k této stránce.');
            setIsLoading(false);
            // Možné přesměrování: router.push('/');
            return;
          }
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Nepodařilo se načíst uživatele.');
          }
          const data = await response.json();
          setUsers(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (status !== 'loading') {
      fetchUsers();
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return <Layout title="Admin | Uživatelé"><p className="text-center p-8">Načítání...</p></Layout>;
  }

  if (!session) {
    // Mělo by být ošetřeno přesměrováním na login, pokud by se sem uživatel dostal
    if (typeof window !== 'undefined') {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.pathname)}`);
    }
    return <Layout title="Admin | Uživatelé"><p className="text-center p-8">Přístup odepřen.</p></Layout>;
  }
  
  if (error) {
    return <Layout title="Admin | Uživatelé"><p className="text-center p-8 text-red-500">{error}</p></Layout>;
  }

  return (
    <Layout title="Admin | Přehled uživatelů" description="Správa registrovaných uživatelů.">
      <section className="bg-gradient-to-r from-slate-600 via-gray-500 to-slate-400 dark:from-slate-700 dark:via-gray-600 dark:to-slate-500 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Administrace - Uživatelé</h1>
          <p className="text-lg md:text-xl opacity-90">Přehled registrovaných uživatelů.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Seznam uživatelů ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avatar</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jméno</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plán</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registrován</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Akce</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => {
                  const plan = user.subscriptions && user.subscriptions.length > 0 ? user.subscriptions[0].plan_id : 'free';
                  return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.avatar_url ? (
                        <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt={user.name || 'Avatar'} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        plan === 'premium' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(user.created_at).toLocaleDateString('cs-CZ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Smazat</button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsersPage;
