const BookAppointmentButton = ({ doctorId }) => {

  const handleBookAppointment = async () => {
    await fetch("http://localhost:5000/api/appointments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: doctorId,
        patientName: "Rahul",
        time: "10:30 AM"
      })
    });

    alert("Appointment Booked");
  };

  return (
    <button onClick={handleBookAppointment}>
      Book Appointment
    </button>
  );
};

export default BookAppointmentButton;
