import { useNavigate } from "react-router-dom";

export default function StatsCard({ title, count, icon: Icon, route }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 text-white p-5 rounded-xl shadow-md flex justify-between items-center hover:bg-slate-700 transition">
      
      {/* Left content */}
      <div>
        <p className="text-sm text-slate-400 uppercase tracking-wide">
          {title}
        </p>

        <h2 className="text-2xl font-bold mt-1">
          {count}
        </h2>

        <button
          onClick={() => navigate(route)}
          className="text-blue-400 text-sm mt-2 hover:underline"
        >
          View All →
        </button>
      </div>

      {/* Icon */}
      <div className="text-slate-400">
        <Icon size={35} />
      </div>
    </div>
  );
}