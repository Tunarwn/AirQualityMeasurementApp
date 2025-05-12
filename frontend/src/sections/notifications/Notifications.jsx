import React, { useState, useEffect } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log("🔄 SSE bağlantısı kuruluyor...");
    
    const eventSource = new EventSource('/backend/api/anomalies/stream/');
  
    eventSource.onmessage = (event) => {
      console.log("📨 SSE mesajı alındı:", event.data);
      
      if (event.data.trim()) {
        try {
          const anomalyData = JSON.parse(event.data);
          console.log("📊 Parse edilen veri:", anomalyData);
  
          const newNotification = {
            id: Date.now(),
            latitude: anomalyData.latitude,
            longitude: anomalyData.longitude,
            parameters: anomalyData.parameters,
            parameterCount: anomalyData.parameters.length,
            read: false,
            timestamp: anomalyData.detected_at
          };
  
          setNotifications(prev => {
            const isDuplicate = prev.some(
              notif => 
                notif.latitude === newNotification.latitude && 
                notif.longitude === newNotification.longitude &&
                (new Date(notif.timestamp).getTime() > Date.now() - 60000)
            );
  
            if (!isDuplicate) {
              setUnreadCount(count => count + 1);
              return [newNotification, ...prev];
            }
            return prev;
          });
        } catch (error) {
          console.error("❌ JSON parse hatası:", error, "Ham veri:", event.data);
        }
      }
    };
  
    eventSource.onerror = (error) => {
      console.error("❌ SSE bağlantı hatası:", error);
    };
  
    return () => {
      console.log("🔌 SSE bağlantısı kapatılıyor...");
      eventSource.close();
    };
  }, []);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getParameterIcon = (parameter) => {
    const icons = {
      'pm25': '💨',
      'pm10': '🌫️',
      'no2': '🏭',
      'so2': '⚠️',
      'o3': '☁️'
    };
    return icons[parameter] || '📊';
  };

  return (
    <div className="notifications-wrapper">
      <button 
        className="notifications-trigger" 
        onClick={toggleNotifications}
      >
        <div className="bell-container">
          <svg className="bell-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
          </svg>
          <span>Bildirimler</span>
        </div>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Son Bildirimler</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all"
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
              >
                Temizle
              </button>
            )}
          </div>
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                    Bildirim bulunmuyor
                    </div>
                ) : (
                    notifications.map(notification => (
                    <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                        <div className="notification-content">
                        <div className="notification-location">
                            Konum: {notification.latitude.toFixed(4)}, {notification.longitude.toFixed(4)}
                        </div>
                        <div className="notification-parameters">
                            {notification.parameters.map((param, index) => (
                            <div key={index} className="parameter-item">
                                <span className="parameter-name">
                                {param.parameter.toUpperCase()}:
                                </span>
                                <span className="parameter-value">
                                {param.value.toFixed(2)}
                                </span>
                                <span className="parameter-reason">
                                ({param.reason})
                                </span>
                            </div>
                            ))}
                        </div>
                        <div className="notification-time">
                            {new Date(notification.timestamp).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                            })}
                        </div>
                        </div>
                    </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;