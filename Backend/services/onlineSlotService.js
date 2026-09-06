const appointmentModel = require("../models/appointmentModel");
const { getUtcDayRange } = require("../utils/utcday");

const getDoctorOnlineSlots = async (doctor, date) => {
  const availability = doctor.onlineAvailability;

  if (
    !availability ||
    !availability.isAvailable ||
    !availability.from ||
    !availability.to
  ) {
    return [];
  }

  const [fromHour, fromMinute] = availability.from.split(":").map(Number);
  const [toHour, toMinute] = availability.to.split(":").map(Number);

  const fromMinutes = fromHour * 60 + fromMinute;
  const toMinutes = toHour * 60 + toMinute;

  const consultationDuration = availability.consultationDuration ?? 20;
  const bufferTime = availability.bufferTime ?? 10;

  const slotDuration = consultationDuration + bufferTime;

  // Selected date range
  const { start, end } = getUtcDayRange(date);

  // Already booked online appointments
  const bookedAppointments = await appointmentModel.find({
    doctor: doctor._id,
    appointmentType: "online",
    date: {
      $gte: start,
      $lte: end,
    },
    status: {
      $in: ["PENDING", "CONFIRMED", "CURRENT"],
    },
  }).select("date");

  const bookedTimes = new Set(
    bookedAppointments.map((appointment) => {
      const d = new Date(appointment.date);

      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");

      return `${hours}:${minutes}`;
    })
  );

  const slots = [];

  const selectedDate = new Date(date);

  // Today check
  const now = new Date();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slotDay = new Date(selectedDate);
  slotDay.setHours(0, 0, 0, 0);

  const isToday = slotDay.getTime() === today.getTime();

  for (
    let currentMinutes = fromMinutes;
    currentMinutes + slotDuration <= toMinutes;
    currentMinutes += slotDuration
  ) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;

    const time = `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;

    const slotDate = new Date(selectedDate);

    slotDate.setHours(hour, minute, 0, 0);

    const slotEnd = new Date(slotDate);

    slotEnd.setMinutes(
      slotEnd.getMinutes() + consultationDuration
    );

    // Past slot
    const isPast = isToday && slotDate <= now;

    // Booked slot
    const isBooked = bookedTimes.has(time);

    const available = !isPast && !isBooked;

    slots.push({
      time,
      start: slotDate,
      end: slotEnd,
      consultationDuration,
      bufferTime,
      booked: isBooked,
      past: isPast,
      available,
    });
  }

  return slots;
};

module.exports = {
  getDoctorOnlineSlots,
};