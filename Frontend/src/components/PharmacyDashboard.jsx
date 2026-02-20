// import React, { useState } from "react";
// import AddMedicineModal from "../pharmacyComponents/addMedicine";

// const PharmacyDashboard = () => {
//   const [showModal, setShowModal] = useState(false);

//   const [medicines, setMedicines] = useState([
//     {
//       id: 1,
//       name: "Paracetamol 500mg",
//       price: 20,
//       stock: 120,
//       expiry: "2026-05-12",
//     },
//   ]);

//   const handleMedicineAdded = (newMed) => {
//     setMedicines((prev) => [
//       ...prev,
//       {
//         id: newMed._id,
//         name: newMed.medicineId, // adjust if backend returns name separately
//         price: newMed.price,
//         stock: newMed.quantity,
//         expiry: newMed.expiryDate.split("T")[0],
//       },
//     ]);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">

//       {/* NAVBAR */}
//       <div className="bg-white shadow-md p-4 flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-blue-600">
//           Pharmacy Dashboard
//         </h1>

//         <button
//           onClick={() => setShowModal(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           + Add Medicine
//         </button>
//       </div>

//       {/* TABLE */}
//       <div className="p-6">
//         <div className="bg-white rounded-xl shadow overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
//               <tr>
//                 <th className="p-4">Medicine</th>
//                 <th className="p-4">Price</th>
//                 <th className="p-4">Stock</th>
//                 <th className="p-4">Expiry</th>
//               </tr>
//             </thead>
//             <tbody>
//               {medicines.map((med) => (
//                 <tr key={med.id} className="border-b">
//                   <td className="p-4">{med.name}</td>
//                   <td className="p-4">{med.price}</td>
//                   <td className="p-4">{med.stock}</td>
//                   <td className="p-4">{med.expiry}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* MODAL */}
//       {showModal && (
//         <AddMedicineModal
//           closeModal={() => setShowModal(false)}
//           onMedicineAdded={handleMedicineAdded}
//         />
//       )}
//     </div>
//   );
// };

// export default PharmacyDashboard;

import React, { useState } from "react";
import { motion } from "framer-motion";
import AddMedicineModal from "../pharmacyComponents/addMedicine";

const PharmacyDashboard = () => {
  const [showModal, setShowModal] = useState(false);

  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "Paracetamol 500mg",
      price: 20,
      stock: 120,
      expiry: "2026-05-12",
    },
  ]);

  const handleMedicineAdded = (newMed) => {
    setMedicines((prev) => [
      ...prev,
      {
        id: newMed._id,
        name: newMed.medicineId,
        price: newMed.price,
        stock: newMed.quantity,
        expiry: newMed.expiryDate.split("T")[0],
      },
    ]);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">

      {/* NAVBAR */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white shadow-lg px-10 py-5 flex justify-between items-center"
      >
        <h1 className="text-3xl w-full font-bold text-blue-700 tracking-wide">
          Pharmacy Dashboard
        </h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          + Add Medicine
        </motion.button>
      </motion.div>

      {/* TABLE SECTION */}
      <div className="w-full px-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <table className="w-full text-left">
            <thead className="bg-blue-600 text-white uppercase text-sm tracking-wider">
              <tr>
                <th className="p-5">Medicine</th>
                <th className="p-5">Price (₹)</th>
                <th className="p-5">Stock</th>
                <th className="p-5">Expiry</th>
              </tr>
            </thead>

            <tbody>
              {medicines.map((med, index) => (
                <motion.tr
                  key={med.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    backgroundColor: "#f1f5ff",
                  }}
                  className="border-b transition"
                >
                  <td className="p-5 font-medium text-gray-700">
                    {med.name}
                  </td>
                  <td className="p-5 text-gray-600">{med.price}</td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        med.stock < 20
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {med.stock}
                    </span>
                  </td>
                  <td className="p-5 text-gray-600">{med.expiry}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* MODAL */}
      {showModal && (
        <AddMedicineModal
          closeModal={() => setShowModal(false)}
          onMedicineAdded={handleMedicineAdded}
        />
      )}
    </div>
  );
};

export default PharmacyDashboard;