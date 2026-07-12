import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count/');
        setUnreadCount(res.data.count);
      } catch (e) {
        // fail silently
      }
    };
    fetchUnread();
    
    // Poll every minute
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative cursor-pointer hover:bg-secondary/50 p-2 rounded-full transition-colors">
      <Bell className="w-5 h-5 text-muted-foreground" />
      {unreadCount > 0 && (
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-background" />
      )}
    </div>
  );
}
