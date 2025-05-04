import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // import CSS for Toastify

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resUsers = await axios.get("https://creatordashboardbackend-7px3.onrender.com/api/user/users", {
        headers: { authorization: `Bearer ${token}` },
      });
      const resReports = await axios.get("https://creatordashboardbackend-7px3.onrender.com/api/user/reports", {
        headers: { authorization: `Bearer ${token}` },
      });
      console.log(resReports);
      setUsers(resUsers.data);
      setReports(resReports.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error("Admin fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditUpdate = async (userId, newCredits) => {
    if (!newCredits) return;
    try {
      await axios.put(
        `https://creatordashboardbackend-7px3.onrender.com/api/user/update-credits/${userId}`,
        { credits: newCredits },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      toast.success("Credits updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    } catch (err) {
      console.error("Failed to update credits:", err);
      toast.error("Failed to update credits. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    }
  };

  const handleCreditsChange = (e, userId) => {
    const updatedUsers = users.map((user) =>
      user._id === userId ? { ...user, newCredits: e.target.value } : user
    );
    setUsers(updatedUsers);
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Dashboard</h1>

      {/* USERS TABLE */}
      <section className="mb-10">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Update Credits</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="p-4">{user.username}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.role}</td>
                    <td className="p-4 text-center">{user.credits}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="New credits"
                          className="border px-3 py-1 w-24 rounded-md"
                          onChange={(e) => handleCreditsChange(e, user._id)}
                        />
                        <button
                          onClick={() => handleCreditUpdate(user._id, user.newCredits)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* REPORTS TABLE */}
      <section>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Reported Posts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="p-4">Post ID</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Reported By</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center p-4 text-gray-500">
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map((r, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-4">{r.postId}</td>
                      <td className="p-4">{r.reason}</td>
                      <td className="p-4">{r.reportedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
