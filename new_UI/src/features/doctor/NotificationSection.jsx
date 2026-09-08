import React, { useEffect } from "react";
import { Bell, CalendarDays } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { markAllRead } from "../../redux/slices/notificationSlice";
import PageHeader from "../../components/layout/PageHeader";

/*
  Socket-fed notification list. Same slice, same markAllRead on mount, same
  fields rendered - only the presentation changed.
*/

const NotificationSection = () => {
  const dispatch = useDispatch();

  const notifications = useSelector((state) => state.notification.notifications);

  useEffect(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Doctor portal"
        title="Notifications"
        description="Appointments pushed to you over the live socket while this session is open."
      />

      <section className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-surface-container text-on-surface-variant">
              <Bell size={24} />
            </span>
            <h2 className="mt-4 font-display text-headline-sm text-on-surface">
              No notifications
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">You are all caught up.</p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="flex gap-4 border-b border-outline-variant/70 px-5 py-4 transition last:border-b-0 hover:bg-surface-container"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-secondary-container text-on-secondary-container">
                  <CalendarDays size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-body-md font-medium text-on-surface">
                      {notification.message}
                    </h3>

                    {notification.createdAt && (
                      <span className="flex-none text-body-sm text-on-surface-variant tabular">
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    A new appointment has been booked.
                  </p>

                  {notification.reason && (
                    <p className="mt-2 text-body-sm text-on-surface-variant">
                      Reason: {notification.reason}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default NotificationSection;
