import React, { useState } from "react";
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
        name: newMed.medicineId, // adjust if backend returns name separately
        price: newMed.price,
        stock: newMed.quantity,
        expiry: newMed.expiryDate.split("T")[0],
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          Pharmacy Dashboard
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Medicine
        </button>
      </div>

      {/* TABLE */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
              <tr>
                <th className="p-4">Medicine</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id} className="border-b">
                  <td className="p-4">{med.name}</td>
                  <td className="p-4">{med.price}</td>
                  <td className="p-4">{med.stock}</td>
                  <td className="p-4">{med.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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