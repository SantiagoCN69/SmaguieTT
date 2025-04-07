const lastNotificationIds = new Set(); 

self.addEventListener("install", () => {

});

self.addEventListener("activate", () => {

});

self.addEventListener("push", (event) => {
  if (!event.data) {

    return;
  }

  const payload = event.data.json();
  console.log("📩 Notificación en background recibida:", payload);

  const { title, body, icon, click_action, notification_id } = payload.notification || payload.data || {};


  if (notification_id && lastNotificationIds.has(notification_id)) {

    return;
  }
  

  if (notification_id) {
    lastNotificationIds.add(notification_id);
    setTimeout(() => lastNotificationIds.delete(notification_id), 30000); 
  }

  const notificationOptions = {
    body: body || "Sin contenido",
    icon: icon || "/default-icon.png",
    data: { click_action },
  };

  event.waitUntil(self.registration.showNotification(title || "Notificación", notificationOptions));
});


self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const clickAction = event.notification.data?.click_action;

  if (clickAction) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (const client of clientList) {
          if (client.url === clickAction && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }
      })
    );
  }
});


