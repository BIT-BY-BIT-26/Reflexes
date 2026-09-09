import React, { useEffect } from "react";
import {
  Bell,
  CalendarDays,
  Siren,
  UserCheck,
  UserMinus,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { markAllRead } from "../redux/slices/notificationSlice";

/*
  Shared by the doctor tree (/doctor-dashboard/notifications) and the admin
  tree (/hospital-dashboard/notifications). The two roles receive completely
  different events, so nothing here may assume an appointment - the copy and
  the icon come from the notification's own `type`.
*/

const TYPES = {
  NEW_APPOINTMENT: {
    icon: CalendarDays,
    description: "A new appointment has been booked.",
    tone: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-500/20",
  },
  EMERGENCY_CREATED: {
    icon: Siren,
    description: "A patient has requested an ambulance.",
    tone: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-500/20",
  },
  EMERGENCY_CANCELLED: {
    icon: XCircle,
    description: "An emergency request was cancelled.",
    tone: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-500/20",
  },
  DOCTOR_ONLINE: {
    icon: UserCheck,
    description: "A doctor just came online.",
    tone: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
  },
  DOCTOR_OFFLINE: {
    icon: UserMinus,
    description: "A doctor went offline.",
    tone: "text-gray-500 dark:text-slate-400",
    bg: "bg-gray-100 dark:bg-slate-800",
  },
};

/* Anything unrecognised still renders rather than blowing up the list. */
const FALLBACK = {
  icon: Bell,
  description: "",
  tone: "text-blue-600 dark:text-blue-400",
  bg: "bg-blue-100 dark:bg-blue-500/20",
};

const NotificationSection = () => {

  const dispatch = useDispatch();

  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  useEffect(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">

          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <Bell
              size={24}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h1>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Stay updated with your latest notifications
            </p>
          </div>

        </div>

        {/* Notification List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">

          {notifications.length === 0 ? (

            <div className="p-10 text-center">

              <Bell
                size={40}
                className="mx-auto mb-3 text-gray-400"
              />

              <h2 className="text-lg font-medium text-gray-700 dark:text-white">
                No notifications
              </h2>

              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                You are all caught up.
              </p>

            </div>

          ) : (

            notifications.map((notification) => {

              const config = TYPES[notification.type] || FALLBACK;
              const Icon = config.icon;

              // Per-notification detail wins over the generic per-type line.
              const description =
                notification.description || config.description;

              return (

                <div
                  key={notification.id}
                  className="flex gap-4 p-5 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}
                  >

                    <Icon
                      size={21}
                      className={config.tone}
                    />

                  </div>

                  {/* Content */}
                  <div className="flex-1">

                    <div className="flex justify-between gap-4">

                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {notification.message}
                      </h3>

                      {notification.createdAt && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(
                            notification.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      )}

                    </div>

                    {description && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {description}
                      </p>
                    )}

                    {notification.reason && (
                      <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                        Reason: {notification.reason}
                      </p>
                    )}

                  </div>

                </div>

              );

            })

          )}

        </div>

      </div>

    </div>
  );
};

export default NotificationSection;
