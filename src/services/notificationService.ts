export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'event';
  read: boolean;
  link?: string;
}

type NotificationListener = (notifications: AppNotification[], latestNotification?: AppNotification) => void;

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: Set<NotificationListener> = new Set();

  constructor() {
    const saved = localStorage.getItem('eventra_notifications');
    if (saved) {
      try {
        this.notifications = JSON.parse(saved);
      } catch {
        this.notifications = [];
      }
    }

    if (this.notifications.length === 0) {
      // Default live operational notifications
      this.notifications = [
        {
          id: 'notif-1',
          title: 'New Student Registration',
          message: 'Srijita Ghosh (SAP 13103) registered for UPES AI Innovation Sprint & Hackathon 2026.',
          timestamp: '10 mins ago',
          type: 'success',
          read: false,
          link: '/admin/registrations',
        },
        {
          id: 'notif-2',
          title: 'OC Volunteer Application',
          message: 'New application received for Stage & Technical Operations from Rohan Verma.',
          timestamp: '45 mins ago',
          type: 'info',
          read: false,
          link: '/admin/teams',
        },
        {
          id: 'notif-3',
          title: 'Milestone Deadline Alert',
          message: 'Sound and lighting check for Main MAC Auditorium is due today at 18:00.',
          timestamp: '2 hours ago',
          type: 'warning',
          read: false,
          link: '/admin/tasks',
        },
        {
          id: 'notif-4',
          title: 'Budget Allocation Confirmed',
          message: 'Dean approval granted for TechFest UPES cultural stage production budget (₹4,50,000).',
          timestamp: 'Yesterday',
          type: 'event',
          read: true,
          link: '/admin/budget',
        },
      ];
      this.persist();
    }
  }

  private persist() {
    try {
      localStorage.setItem('eventra_notifications', JSON.stringify(this.notifications));
    } catch {
      // ignore
    }
  }

  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  notify(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      read: false,
    };

    this.notifications = [newNotif, ...this.notifications];
    this.persist();
    this.emit(newNotif);
    return newNotif;
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.persist();
    this.emit();
  }

  markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.persist();
    this.emit();
  }

  clearAll() {
    this.notifications = [];
    this.persist();
    this.emit();
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(latest?: AppNotification) {
    this.listeners.forEach((fn) => fn([...this.notifications], latest));
  }
}

export const notificationService = new NotificationService();
