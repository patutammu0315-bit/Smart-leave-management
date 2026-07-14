import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LogOut, PlusCircle, History, FileText, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [form, setForm] = useState({ leave_type: 'Sick Leave', from_date: '', to_date: '', reason: '' });
  const [isApplying, setIsApplying] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchData = () => {
    axios.get('http://localhost:5000/api/student/dashboard').then(res => setStats(res.data));
    axios.get('http://localhost:5000/api/student/history').then(res => setLeaves(res.data));
    axios.get('http://localhost:5000/api/student/notifications').then(res => setNotifications(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await axios.post('http://localhost:5000/api/student/apply', form);
      toast.success('Leave applied successfully!');
      fetchData();
      setForm({ leave_type: 'Sick Leave', from_date: '', to_date: '', reason: '' });
    } catch(err) {
      toast.error(err.response?.data?.error || "Failed to apply leave");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/leave/${id}/download-letter`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let fileName = `Leave_Approval_${id}.pdf`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download leave letter');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name} ({user.department} - {user.section})</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
              <Bell size={24} />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => {
                        if (!n.is_read) {
                          axios.post(`http://localhost:5000/api/student/notifications/${n.id}/read`).catch(console.error);
                          setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
                        }
                      }} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                        <p className={`text-sm ${!n.is_read ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{n.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={logout} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-semibold transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Leaves</h3>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
          <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Pending</h3>
          <p className="text-4xl font-black text-orange-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
          <h3 className="text-sm font-semibold text-green-500 uppercase tracking-wider">Approved</h3>
          <p className="text-4xl font-black text-green-600 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
          <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider">Rejected</h3>
          <p className="text-4xl font-black text-red-600 mt-2">{stats.rejected}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Application Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 self-start">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <PlusCircle className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Apply for Leave</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}>
                <option>Sick Leave</option>
                <option>Casual Leave</option>
                <option>Emergency Leave</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
                <input type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.from_date} onChange={e => setForm({...form, from_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                <input type="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.to_date} onChange={e => setForm({...form, to_date: e.target.value})} />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
              <textarea required rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Provide a brief reason..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}></textarea>
            </div>
            <button type="submit" disabled={isApplying} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
              {isApplying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Leave History */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <History className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">My Leave History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Dates</th>
                  <th className="pb-3 font-semibold">Reason</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-4 font-medium text-gray-800">{l.leave_type}</td>
                    <td className="py-4 text-gray-600 text-sm">{l.from_date} <br/><span className="text-gray-400">to</span> {l.to_date}</td>
                    <td className="py-4 text-gray-600 text-sm max-w-xs truncate" title={l.reason}>{l.reason}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        l.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        l.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {(l.status === 'Approved' || l.status === 'Rejected') ? (
                        <button onClick={() => handleDownload(l.id)} className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition">
                          <FileText size={16} /> Download Letter
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm font-medium italic">Processing...</span>
                      )}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">No leave history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
