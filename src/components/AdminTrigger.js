'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTrigger() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + L or Cmd + L
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        router.push('/admin/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
