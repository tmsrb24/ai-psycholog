import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AdminIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return null; // Tato stránka nic nezobrazuje, pouze přesměrovává
};

export default AdminIndexPage;
