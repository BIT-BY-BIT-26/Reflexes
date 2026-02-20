import React from 'react'
import { useNavigate } from 'react-router-dom'

const ProfilePopUp = ({doctor,closePopup}) => {
    const navigate = useNavigate();
  return (
    <div>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[380px] relative">

            <h2 className="text-xl font-semibold mb-2">
              ⚠️ Complete Your Profile
            </h2>

            <p className="text-gray-600 text-sm mb-4">
              Your profile is {doctor?.profileCompletion}% complete.  
              Finish your profile to start managing your OPD queue.
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-teal-600 h-2 rounded"
                style={{ width: `${doctor?.profileCompletion}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {doctor?.profileCompletion}% completed
            </p>

            <button
              onClick={() => navigate("/doctor/complete-profile")}
              className="mt-5 w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700"
            >
              Complete Profile →
            </button>

            {/* Close (optional) */}
              <button
                onClick={closePopup}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
                >
                ✕
                </button>
                
          </div>
        </div>
    </div>
  )
}

export default ProfilePopUp