import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";

/*
  Weekly OPD availability editor.

  Fetch and save still go straight through axios to http://localhost:3000 with a
  hand-attached token rather than axiosInstance - left exactly as it was. The
  validation (every available day needs both times, end after start), the toast
  messages and the 1s delayed navigation are unchanged too.
*/

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const OpdSchedule = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState(
    DAYS.map((day) => ({
      day,
      from: "",
      to: "",
      isAvailable: false,
    }))
  );

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:3000/api/admin/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.doctor.opdSchedule?.length) {
        setSchedule(res.data.doctor.opdSchedule);
      }
    } catch (err) {
      toast.error("Unable to load OPD schedule");
    }
  };

  const handleAvailability = (index) => {
    const temp = [...schedule];

    temp[index].isAvailable = !temp[index].isAvailable;

    if (!temp[index].isAvailable) {
      temp[index].from = "";
      temp[index].to = "";
    }

    setSchedule(temp);
  };

  const handleTime = (index, field, value) => {
    const temp = [...schedule];
    temp[index][field] = value;
    setSchedule(temp);
  };

  const saveSchedule = async () => {
    for (let item of schedule) {
      if (item.isAvailable) {
        if (!item.from || !item.to) {
          return toast.error(`${item.day}: Please select timings`);
        }

        if (item.from >= item.to) {
          return toast.error(`${item.day}: End time must be after start time`);
        }
      }
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `http://localhost:3000/api/opd-schedule/${doctorId}`,
        {
          opdSchedule: schedule,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);
     setTimeout(() => {
        navigate("/hospital-dashboard/doctors");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const availableCount = schedule.filter((item) => item.isAvailable).length;

  const timeField =
    "rounded-control border border-outline-variant bg-surface-container px-3 py-2 text-body-md text-on-surface tabular outline-none transition focus:border-primary disabled:opacity-40";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Hospital admin"
        title="OPD Schedule"
        description="Configure this doctor's weekly availability. Patients can only book on days marked available."
      >
        <div className="rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
          <span className="block text-label-caps uppercase text-on-surface-variant">
            Days available
          </span>
          <span className="block font-display text-headline-sm text-on-surface tabular">
            {availableCount} / 7
          </span>
        </div>
      </PageHeader>

      <section className="overflow-hidden rounded-card border border-outline-variant bg-surface-lowest">
        <div className="hidden grid-cols-12 gap-4 border-b border-outline-variant bg-surface-container px-5 py-2 text-label-caps uppercase text-on-surface-variant sm:grid">
          <span className="col-span-3">Day</span>
          <span className="col-span-3">Availability</span>
          <span className="col-span-3">Opens</span>
          <span className="col-span-3">Closes</span>
        </div>

        <ul>
          {schedule.map((item, index) => (
            <li
              key={item.day}
              className="grid grid-cols-2 items-center gap-4 border-b border-outline-variant/70 px-5 py-3 last:border-b-0 sm:grid-cols-12"
            >
              <span className="text-body-md font-medium text-on-surface sm:col-span-3">
                {item.day}
              </span>

              <label className="flex cursor-pointer items-center gap-2 text-body-md text-on-surface-variant sm:col-span-3">
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  onChange={() => handleAvailability(index)}
                  className="h-4 w-4 accent-[var(--md-primary)]"
                />
                {item.isAvailable ? "Available" : "Unavailable"}
              </label>

              <input
                type="time"
                value={item.from}
                disabled={!item.isAvailable}
                onChange={(e) => handleTime(index, "from", e.target.value)}
                className={`${timeField} sm:col-span-3`}
              />

              <input
                type="time"
                value={item.to}
                disabled={!item.isAvailable}
                onChange={(e) => handleTime(index, "to", e.target.value)}
                className={`${timeField} sm:col-span-3`}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-end">
        <button
          onClick={saveSchedule}
          disabled={loading}
          className="rounded-control bg-primary px-6 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </div>
  );
};

export default OpdSchedule;
