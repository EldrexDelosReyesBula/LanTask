const notifiedTasks = new Set<string>();

export const NotificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  scheduleNotification: (id: string, title: string, body: string) => {
    if (notifiedTasks.has(id)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'lantask-notification'
      });
      notifiedTasks.add(id);
    }
  },

  resetNotification: (id: string) => {
      notifiedTasks.delete(id);
  }
};
