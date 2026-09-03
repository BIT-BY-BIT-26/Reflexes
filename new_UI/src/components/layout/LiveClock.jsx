import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

/*
  Live date + clock, carried over from the old IntroSection banner: the same
  one-second interval and the same en-GB date formatting.
*/

const LiveClock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [dateInfo, setDateInfo] = useState({ date: "", day: "" });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date();

    setDateInfo({
      date: today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      day: today.toLocaleDateString("en-GB", { weekday: "long" }),
    });
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-card border border-outline-variant bg-surface-lowest px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-container/20 text-primary">
        <CalendarDays size={18} />
      </span>
      <span>
        <span className="block text-body-md text-on-surface">
          {dateInfo.day}, {dateInfo.date}
        </span>
        <span className="block text-body-sm text-on-surface-variant tabular">{time}</span>
      </span>
    </div>
  );
};

export default LiveClock;
