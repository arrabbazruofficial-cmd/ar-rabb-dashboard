import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count/');
      setUnreadCount(res.data.count);
    } catch (e) {
      // fail silently
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="cursor-pointer hover:bg-secondary/50 p-2 rounded-full transition-colors relative"
        onClick={toggleDropdown}
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-background" />
        )}
      </div>

      {isOpen && (
        <div className="absolute bottom-full mb-2 -right-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-lg z-50 flex flex-col">
          <div className="p-3 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="divide-y divide-border flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-3 text-sm transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                  <p className={`${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
