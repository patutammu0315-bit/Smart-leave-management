import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Users, GraduationCap, FileCheck2, LayoutDashboard, UserPlus, FileSpreadsheet, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, totalMentors: 0, pendingLeaves: 0, approvedLeaves: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form states
  const [mentorData, setMentorData] = useState({ name: '', email: '', password: '', phone: '', designation: '', department: '', section: '' });
  const [studentData, setStudentData] = useState({ name: '', email: '', student_id: '', password: '', department: '', section: '' });

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDashboardStats = () => {
    axios.get('http://localhost:5000/api/admin/dashboard', axiosConfig)
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/mentors', mentorData, axiosConfig);
      toast.success('Mentor created successfully!');
      setMentorData({ name: '', email: '', password: '', phone: '', designation: '', department: '', section: '' });
      fetchDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create mentor');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/students', studentData, axiosConfig);
      toast.success('Student created successfully!');
      setStudentData({ name: '', email: '', student_id: '', password: '', department: '', section: '' });
      fetchDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create student');
    }
  };

  const navClass = (tab) => `flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
           <img src="/ifet-logo.jpeg" alt="IFET" className="w-10 h-10 bg-white rounded p-1 object-contain"/>
           <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left ${navClass('dashboard')}`}><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => setActiveTab('mentors')} className={`w-full text-left ${navClass('mentors')}`}><Users size={20}/> Manage Mentors</button>
          <button onClick={() => setActiveTab('students')} className={`w-full text-left ${navClass('students')}`}><GraduationCap size={20}/> Manage Students</button>
          <button onClick={() => setActiveTab('reports')} className={`w-full text-left ${navClass('reports')}`}><FileSpreadsheet size={20}/> Reports & Exports</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-border-light">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary capitalize">{activeTab === 'dashboard' ? 'Dashboard Overview' : `Manage ${activeTab}`}</h1>
            <p className="text-text-secondary mt-1">{activeTab === 'dashboard' ? 'System wide analytics' : `Create and configure ${activeTab}`}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-semibold transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
        
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light hover:border-primary transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Students</h3>
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><GraduationCap size={20}/></div>
              </div>
              <p className="text-4xl font-black text-text-primary">{stats.totalStudents}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light hover:border-primary transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Mentors</h3>
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><Users size={20}/></div>
              </div>
              <p className="text-4xl font-black text-text-primary">{stats.totalMentors}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:border-orange-400 transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Pending Leaves</h3>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FileCheck2 size={20}/></div>
              </div>
              <p className="text-4xl font-black text-orange-600">{stats.pendingLeaves}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 hover:border-green-400 transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider">Approved Leaves</h3>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><FileCheck2 size={20}/></div>
              </div>
              <p className="text-4xl font-black text-green-600">{stats.approvedLeaves}</p>
            </div>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light max-w-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-light">
              <UserPlus className="text-primary w-6 h-6" />
              <h2 className="text-xl font-bold text-text-primary">Create New Mentor</h2>
            </div>
            <form onSubmit={handleCreateMentor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={mentorData.name} onChange={e => setMentorData({...mentorData, name: e.target.value})} />
                <input type="email" placeholder="Email Address" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={mentorData.email} onChange={e => setMentorData({...mentorData, email: e.target.value})} />
                <input type="password" placeholder="Password" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={mentorData.password} onChange={e => setMentorData({...mentorData, password: e.target.value})} />
                <input type="text" placeholder="Phone Number" className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={mentorData.phone} onChange={e => setMentorData({...mentorData, phone: e.target.value})} />
                <input type="text" placeholder="Designation (e.g. Professor)" className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={mentorData.designation} onChange={e => setMentorData({...mentorData, designation: e.target.value})} />
                <select required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white" value={mentorData.department} onChange={e => setMentorData({...mentorData, department: e.target.value})}>
                  <option value="" disabled>Select Department</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="AI&DS">AI&DS</option>
                </select>
                <input type="text" placeholder="Section (e.g. A, B)" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={mentorData.section} onChange={e => setMentorData({...mentorData, section: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition shadow-lg mt-4 cursor-pointer">
                Register Mentor
              </button>
            </form>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light max-w-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-light">
              <UserPlus className="text-primary w-6 h-6" />
              <h2 className="text-xl font-bold text-text-primary">Create New Student</h2>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={studentData.name} onChange={e => setStudentData({...studentData, name: e.target.value})} />
                <input type="email" placeholder="Email Address" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} />
                <input type="text" placeholder="Student ID / Roll No" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={studentData.student_id} onChange={e => setStudentData({...studentData, student_id: e.target.value})} />
                <input type="password" placeholder="Password" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={studentData.password} onChange={e => setStudentData({...studentData, password: e.target.value})} />
                <select required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white" value={studentData.department} onChange={e => setStudentData({...studentData, department: e.target.value})}>
                  <option value="" disabled>Select Department</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="AI&DS">AI&DS</option>
                </select>
                <input type="text" placeholder="Section (e.g. A, B)" required className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary outline-none" value={studentData.section} onChange={e => setStudentData({...studentData, section: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition shadow-lg mt-4 cursor-pointer">
                Register Student
              </button>
            </form>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-light max-w-4xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-primary w-6 h-6" />
                <h2 className="text-xl font-bold text-text-primary">Leave Reports</h2>
              </div>
              <a href="http://localhost:5000/api/admin/reports/export" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold transition">
                <Download size={18} /> Export to CSV
              </a>
            </div>
            <p className="text-gray-600">Download a complete CSV report of all leave requests, including reference numbers, student details, and approval statuses.</p>
          </div>
        )}
      </main>
    </div>
  );
}
