import React from "react";

const PharmacyDashboard = () => {
  const medicines = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      price: 20,
      stock: 120,
      expiry: "2026-05-12",
    },
    {
      id: 2,
      name: "Azithromycin 250mg",
      price: 85,
      stock: 15,
      expiry: "2025-09-10",
    },
    {
      id: 3,
      name: "Vitamin C Tablets",
      price: 60,
      stock: 8,
      expiry: "2025-04-02",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          Pharmacy Dashboard
        </h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Add Medicine
        </button>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Total Medicines</h2>
            <p className="text-2xl font-bold mt-2">120</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Low Stock</h2>
            <p className="text-2xl font-bold text-red-500 mt-2">8</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Expiring Soon</h2>
            <p className="text-2xl font-bold text-yellow-500 mt-2">5</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Orders Today</h2>
            <p className="text-2xl font-bold text-green-500 mt-2">12</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search medicine..."
            className="w-full md:w-1/3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Medicine Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
              <tr>
                <th className="p-4">Medicine</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{med.name}</td>
                  <td className="p-4">{med.price}</td>
                  <td className="p-4">{med.stock}</td>
                  <td className="p-4">{med.expiry}</td>
                  <td className="p-4">
                    {med.stock < 10 ? (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                        Low Stock
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                        Available
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
