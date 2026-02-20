import { useState } from 'react';
import api from '../api/axios';
import { useEffect } from 'react';
import socket from '../socket/socket';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {motion} from "framer-motion";
import { fetchTodayAppointments } from '../redux/doctor/doctorThunk';

const AllAppointments = ({appointments=[], onPatientClick})=>{
    const doctorId = "6980a3fa5aa1009b7c4beb0f";
  const dispatch = useDispatch();
  const navigate = useNavigate();
    const confirmAppointment = async(appointmentId)=>{
        try{
            await api.patch(`/appointments/${appointmentId}/confirm`);
            dispatch(fetchTodayAppointments());
        }catch(err){
            console.error(err);
            alert("Unable to confirm appointments");
        }
    }
        const completeAppointment = async (appointmentId) => {

            const confirm = window.confirm("Mark patient as completed?");

            if (!confirm) return;

            try {
                await api.patch(`/appointments/${appointmentId}/complete`);
                dispatch(fetchTodayAppointments());
            } catch (err) {
                console.error(err);
                alert("Unable to complete appointment");
            }
        };
    return(
    <div className="bg-gradient-to-br from-blue-900 via-blue-300 to-blue-500 rounded-2xl shadow-lg p-6 mb-6 max-w-8xl ml-10">
        <motion.h2
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-2xl font-bold mb-6 text-white flex items-center gap-3 relative"
            >
            {/* Animated Icon */}
            {/* <motion.span
                initial={{ rotate: -20, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
            >
                📅
            </motion.span> */}
{/* 
            Today's Appointments */}

            {/* Animated underline */}
            <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute left-0 -bottom-2 h-[3px] bg-blue-400 rounded-full"
            />
            </motion.h2>

        {appointments.length === 0?(
            <p className='text-gray-500 text-center py-10'>No appointments for today</p>
        ):(
        <motion.div
            className="space-y-5 mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                transition: {
                    staggerChildren: 0.08
                }
                }
            }}
            >
            {appointments.map((appt,index) => {
                console.log(appt);
                const statusColor =
                appt.status === "CONFIRMED"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-orange-100 text-orange-700 border border-orange-200";

                return (
                    <motion.div
                        key={appt.appointmentId + appt.status}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        whileHover={{ scale: 1.02 }}
                        className="flex justify-between items-center bg-white/30 backdrop-blur border border-blue-100 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all"
                    >
                    <div className="space-y-1">
                        <p className="font-semibold text-lg text-blue-900 cursor-pointer hover:text-blue-600 transition"
                            // onClick={()=> onPatientClick(appt.patient?._id)}
                            onClick={()=>navigate(`/doctor-dashboard/patient/${appt.patient?._id}`)}
                        >   
                            {appt.patient?.userId?.name || "Unknown Patient"}
                        </p>

                        <p className='flex items-center gap-3 mt-2'>
                            <span className="px-4 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full shadow-sm">
                            {appt.status === "CONFIRMED" && appt.token
                                ? `Token #${appt.token}`
                                : "Waiting for confirmation"}
                            </span>

                        </p>
                        <p className="text-sm text-gray-500">
                            Email:  {appt.patient?.userId?.email || "No email"}
                        </p>

                        <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                        >
                        {appt.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">

                        {appt.status !== "CONFIRMED" && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => confirmAppointment(appt.appointmentId)}
                                className="px-5 py-2 bg-gradient-to-r from-blue-800 to-blue-500 text-white rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all font-medium"
                                >
                                Confirm
                            </motion.button>
                        )}

                        {appt.status === "CONFIRMED" && (
                            <motion.label
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-3 cursor-pointer group"
                                >
                                <input
                                    type="checkbox"
                                    className="hidden peer"
                                    onChange={() => completeAppointment(appt.appointmentId)}
                                />

                                <div className="w-6 h-6 rounded-md border-2 border-blue-400 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition">
                                    <svg
                                    className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                    >
                                    <path d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                    Complete
                                </span>
                                </motion.label>
                        )}
                    </div>
                    </motion.div> 
                );
            })}
           </motion.div>
        )}
    </div>
    )
}
export default AllAppointments; 