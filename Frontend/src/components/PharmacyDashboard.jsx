import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AddMedicineModal from "../pharmacyComponents/addMedicine";
import api from "../api/axios";

const PharmacyDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [medicines, setMedicines] = useState([]);

  // ✅ FETCH ALL MEDICINES
  const fetchMedicines = async () => {
    try {
      const res = await api.get("/pharmacy/allmedicine");
      setMedicines(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ LOAD ON PAGE OPEN
  useEffect(() => {
    fetchMedicines();
  }, []);

  // ✅ AFTER ADD
  const handleMedicineAdded = (newMed) => {
    setMedicines((prev) => [newMed, ...prev]);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">

      {/* NAVBAR */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-white shadow-lg px-10 py-5 flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-blue-700">
          Pharmacy Dashboard
        </h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-blue-700"
        >
          + Add Medicine
        </motion.button>
      </motion.div>

      {/* TABLE */}
      <div className="w-full px-10 py-8 text-black">
        <motion.div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">

          <table className="w-full text-left">
            <thead className="bg-blue-600 text-white uppercase text-sm">
              <tr>
                <th className="p-5">Medicine</th>
                <th className="p-5">Brand</th>
                <th className="p-5">Price</th>
                <th className="p-5">Stock</th>
                <th className="p-5">Expiry</th>
              </tr>
            </thead>

            <tbody>
              {medicines.map((med) => (
                <tr key={med._id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-5 font-medium capitalize">
  {med.medicineId?.name || "N/A"}
</td>

<td className="p-5">
  {med.medicineId?.brand || "N/A"}
</td>
                  <td className="p-5">₹{med.price}</td>

                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        med.quantity < 20
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {med.quantity}
                    </span>
                  </td>

                  <td className="p-5">
                    {med.expiryDate?.split("T")[0]}
                  </td>
                </tr>
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