import { useState, useEffect } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';
import { api } from '@/lib/api';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const openNotificationsTab = () => {
    setIsOpen(true);
    fetchNotifications();
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
    <div className="relative">
      <div 
        className="cursor-pointer hover:bg-white/10 p-2 rounded-full transition-all duration-200 relative"
        onClick={openNotificationsTab}
      >
        <Bell className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-background" />
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Notifications</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-border flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 md:p-6 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                    <p className={`text-base ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                      {!n.read && (
                        <button onClick={() => markAsRead(n.id)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
