import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  CalendarDays,
  Pill,
  Shield,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

export const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    route: "/hospital-dashboard",
  },

  {
    id: "departments",
    icon: Building2,
    title: "Departments",
    route: "/hospital-dashboard/departments",
    children: [
      {
        title: "All Departments",
        route: "/hospital-dashboard/departments",
      },
      {
        title: "Add Department",
        route: "/hospital-dashboard/departments/add",
      },
      {
        title: "Department Performance",
        route: "/hospital-dashboard/departments/performance",
      },
    ],
  },

  {
    id: "doctors",
    icon: UserRound,
    title: "Doctors",
    route: "/hospital-dashboard/doctors",
    children: [
      {
        title: "All Doctors",
        route: "/hospital-dashboard/doctors",
      },
      {
        title: "Add Doctor",
        route: "/hospital-dashboard/doctors",
      },
      {
        title: "Doctor Availability",
        route: "/hospital-dashboard/doctors/availability",
      },
      {
        title: "Schedules",
        route: "/hospital-dashboard/doctors/schedules",
      },
      {
        title: "Performance",
        route: "/hospital-dashboard/doctors/performance",
      },
    ],
  },

  {
    id: "patients",
    icon: Users,
    title: "Patients",
    route: "/hospital-dashboard/patients",
    children: [
      {
        title: "All Patients",
        route: "/hospital-dashboard/patients",
      },
      {
        title: "Patient Registration",
        route: "/hospital-dashboard/patients/register",
      },
      {
        title: "Medical Records",
        route: "/hospital-dashboard/patients/records",
      },
      {
        title: "OPD Queue",
        route: "/hospital-dashboard/patients/opd-queue",
      },
    ],
  },

  {
    id: "appointments",
    icon: CalendarDays,
    title: "Appointments",
    route: "/hospital-dashboard/appointments",
    children: [
      {
        title: "Today's Appointments",
        route: "/hospital-dashboard/appointments/today",
      },
      {
        title: "Schedule Appointment",
        route: "/hospital-dashboard/appointments/schedule",
      },
      {
        title: "Appointment History",
        route: "/hospital-dashboard/appointments/history",
      },
      {
        title: "Cancelled Appointments",
        route: "/hospital-dashboard/appointments/cancelled",
      },
    ],
  },

  {
    id: "pharmacy",
    icon: Pill,
    title: "Pharmacy",
    route: "/hospital-dashboard/pharmacy",
    children: [
      {
        title: "Medicine Inventory",
        route: "/hospital-dashboard/pharmacy/inventory",
      },
      {
        title: "Low Stock Medicines",
        route: "/hospital-dashboard/pharmacy/low-stock",
      },
      {
        title: "Purchase Orders",
        route: "/hospital-dashboard/pharmacy/orders",
      },
      {
        title: "Suppliers",
        route: "/hospital-dashboard/pharmacy/suppliers",
      },
    ],
  },

  {
    id: "staff",
    icon: Shield,
    title: "Staff & Admin",
    route: "/hospital-dashboard/staff",
    children: [
      {
        title: "All Staff",
        route: "/hospital-dashboard/staff",
      },
      {
        title: "Add Staff",
        route: "/hospital-dashboard/staff/add",
      },
      {
        title: "Roles & Permissions",
        route: "/hospital-dashboard/staff/roles",
      },
      {
        title: "Admin Invitations",
        route: "/hospital-dashboard/staff/invitations",
      },
      {
        title: "Access Control",
        route: "/hospital-dashboard/staff/access-control",
      },
    ],
  },

  {
    id: "reports",
    icon: FileText,
    title: "Reports",
    route: "/hospital-dashboard/reports",
    children: [
      {
        title: "Patient Reports",
        route: "/hospital-dashboard/reports/patients",
      },
      {
        title: "Doctor Reports",
        route: "/hospital-dashboard/reports/doctors",
      },
      {
        title: "Revenue Reports",
        route: "/hospital-dashboard/reports/revenue",
      },
      {
        title: "Export Data",
        route: "/hospital-dashboard/reports/export",
      },
    ],
  },

  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics",
    route: "/hospital-dashboard/analytics",
    children: [
      {
        title: "Hospital Overview",
        route: "/hospital-dashboard/analytics/overview",
      },
      {
        title: "Department Analytics",
        route: "/hospital-dashboard/analytics/departments",
      },
      {
        title: "Doctor Analytics",
        route: "/hospital-dashboard/analytics/doctors",
      },
      {
        title: "Patient Analytics",
        route: "/hospital-dashboard/analytics/patients",
      },
    ],
  },

  {
    id: "settings",
    icon: Settings,
    title: "Settings",
    route: "/hospital-dashboard/settings",
    children: [
      {
        title: "Hospital Profile",
        route: "/hospital-dashboard/settings/profile",
      },
      {
        title: "Working Hours",
        route: "/hospital-dashboard/settings/hours",
      },
      {
        title: "Notification Settings",
        route: "/hospital-dashboard/settings/notifications",
      },
    ],
  },
];

export default menuItems;