import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchData = () => {
    axios.get('http://localhost:5000/api/mentor/dashboard').then(res => setStats(res.data));
    axios.get('http://localhost:5000/api/mentor/leaves').then(res => setLeaves(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    const remarks = prompt("Enter remarks (optional):");
    try {
      await axios.post(`http://localhost:5000/api/mentor/leave/${id}/${action}`, { remarks });
      toast.success(`Leave ${action}d successfully`);
      fetchData();
    } catch(err) {
      toast.error("Failed to process leave");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mentor Dashboard</h1>
          <p className="text-gray-500 mt-1">Reviewing requests for {user.department} - Section {user.section}</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-semibold transition">
          <LogOut size={18} /> Logout
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between">
          <div><h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Pending Action</h3><p className="text-4xl font-black text-orange-600 mt-2">{stats.pending}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
          <div><h3 className="text-sm font-bold text-green-500 uppercase tracking-wider">Approved</h3><p className="text-4xl font-black text-green-600 mt-2">{stats.approved}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between">
          <div><h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Rejected</h3><p className="text-4xl font-black text-red-600 mt-2">{stats.rejected}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Student Leave Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="pb-3 font-semibold">Student Name</th>
                <th className="pb-3 font-semibold">Leave Type</th>
                <th className="pb-3 font-semibold">Dates</th>
                <th className="pb-3 font-semibold">Reason</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="py-4 font-bold text-gray-800">{l.student.name}</td>
                  <td className="py-4 font-medium text-gray-600">{l.leave_type}</td>
                  <td className="py-4 text-gray-600 text-sm">{l.from_date} <span className="text-gray-400 px-1">to</span> {l.to_date}</td>
                  <td className="py-4 text-gray-600 text-sm max-w-[200px] truncate" title={l.reason}>{l.reason}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      l.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      l.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-4 text-right flex justify-end gap-2">
                    {l.status === 'Pending' ? (
                      <>
                        <button onClick={() => handleAction(l.id, 'approve')} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition">
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button onClick={() => handleAction(l.id, 'reject')} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition">
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">Actioned</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No leave requests found for your section.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
