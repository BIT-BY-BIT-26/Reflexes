import React from 'react'
import DoctorCards from './DoctorCards'
import IntroSection from '../Hospitals/IntroSection'
import QueueList from './QueueList'
import CurrentPatient from './CurrentPatient'
import { useEffect } from 'react'
import { getConfirmedAppointments } from '../../api/backend'
import { useState } from 'react'

const DoctorHome = () => {
  const [appointments, setAppointments] = useState([]);

    const fetchQueue = async () => {
    try {
      const { data } = await getConfirmedAppointments();
      console.log(data);
      setAppointments(data.appointments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);
  return (
    <div className='text-white'>
      <IntroSection />
      <DoctorCards />
      <div className="flex h-screen mt-15 gap-20 justify-between w-full">
        <div className="flex-1 h-96 ">
          <CurrentPatient appointment={appointments[0]}/>
        </div>
        <div className="flex-1 h-96 ">
          <QueueList appointments={appointments.slice(1)} />
        </div>
      </div>
    </div>
  )
}

export default DoctorHome