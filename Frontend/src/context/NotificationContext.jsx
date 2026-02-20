import { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (data) => {
    setNotifications((prev) => [data, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
