import {
  LayoutDashboard,
  Building2,
  Users,
  ListOrdered,
  Activity,
  Eye,
  Plus
} from "lucide-react";
import { useState } from "react";
import { logout } from "../api/backend";
import Profile from "../components/Hospitals/Profile";

/* ------------------ Main Component ------------------ */

export default function HospitalDashboard() {
  const [open, setOpen] = useState(false);
  const [openDept, setOpenDept] = useState(false);
  const [page,setPage] = useState("dashboard");
  return (
    <div className="h-screen w-screen bg-black">
      <h1 className="text-white text-4xl">hospital </h1>
        <Profile />
    </div>
  );
}
