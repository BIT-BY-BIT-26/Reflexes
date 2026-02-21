import React, { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import LiveCall from './LiveCall';
const Dashboard = () => {
    const [data,setData] = useState(null);
    const [room, setRoom] = useState(null);
    const [waiting, setWaiting] = useState(false);
    const [stream,setStream] = useState();
    const myVideo = useRef();
    const [selectedUser, setSelectedUser] = useState(null);
    const [callRejectedPopUp,setCallRejectedPopUp]=useState(false);
    const [caller,setCaller] = useState(null);
    const [callAccepted,setCallAccepted]= useState(false);
    
    const getTodayOnlineAppointments = async()=>{
        try{
            const res = await api.get('/appointments/online');
            setData(res.data);
        }catch (error) {
        console.error("Error fetching appointments", error);
        }
    }

    useEffect(()=>{
        getTodayOnlineAppointments();
    },[]);
    //start call
    const startConsultation = async(patient)=>{
        try{
            const res = await api.post('/consulation/start-online',{
                appointmentId:patient.appointmentId,
                patientId: patient.patient._id
            })
            setRoom(res.data);
            setWaiting(true);
        }catch(error){
            console.error("Error starting consultation", error);
        }
    }
    if(!data) return <p className='ml-20 p-6'>Loading...</p>
    if(waiting && room){
        return <LiveCall room={room} />;
    }

  return (
    <div className="ml-20 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Today's Online Patients
      </h1>
      <div className="mb-6 p-4 bg-gray-100 rounded text-black">
        <p><strong>Department:</strong> {data.doctor.department.name}</p>
        <p><strong>Hospital:</strong> {data.doctor.hospital.name}</p>
        <p><strong>Total Patients:</strong> {data.total}</p>
      </div>
      {data.patients.length === 0 ? (<p>No patient in queue</p>):(
        <div className='space-y-4 text-black'>
            {data.patients.map((p)=>(
                <div key={p.appointmentId}
                    className='p-4 bg-white shadow rounded-lg border'
                >
                <p><strong>Token:</strong> {p.token}</p>
                <p><strong>Name:</strong> {p.patient.userId?.name}</p>
                <p><strong>Email:</strong> {p.patient.userId?.email}</p>
                <p><strong>Status:</strong> {p.status}</p>
                <p>
                    <strong>Booked At:</strong>{" "}
                    {new Date(p.bookedAt).toLocaleTimeString()}
                </p>

                {p.status === "PENDING" && (
                    <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded"
                            onClick={()=> startConsultation(p)}
                    >
                        Start Call
                    </button>
                )}
                </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard