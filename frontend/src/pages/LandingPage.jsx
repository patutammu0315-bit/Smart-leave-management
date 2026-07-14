import { Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 relative">
      
      {/* College Logo - Top Left */}
      <div className="absolute top-6 left-6">
        <img 
          src="/ifet-banner-logo.png" 
          alt="IFET College Logo" 
          className="h-16 object-contain"
        />
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12 mt-16">
        <h1 className="text-5xl font-extrabold text-text-primary tracking-tight mb-4">Smart Leave Management</h1>
        <p className="text-lg text-text-secondary">Please select your portal to continue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {/* Student Portal */}
        <Link to="/login/student" className="group transform hover:-translate-y-2 transition duration-300">
          <div className="bg-white rounded-2xl shadow-lg border border-border-light p-8 flex flex-col items-center hover:shadow-2xl hover:border-primary transition-colors">
            <div className="bg-primary/10 p-4 rounded-full mb-6 group-hover:scale-110 transition duration-300">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-primary-dark">Student Portal</h2>
            <p className="text-center text-text-secondary">Apply for leaves and view your application status</p>
          </div>
        </Link>

        {/* Mentor Portal */}
        <Link to="/login/mentor" className="group transform hover:-translate-y-2 transition duration-300">
          <div className="bg-white rounded-2xl shadow-lg border border-border-light p-8 flex flex-col items-center hover:shadow-2xl hover:border-primary transition-colors">
            <div className="bg-primary/10 p-4 rounded-full mb-6 group-hover:scale-110 transition duration-300">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-primary-dark">Mentor Portal</h2>
            <p className="text-center text-text-secondary">Review, approve or reject student leave requests</p>
          </div>
        </Link>

        {/* Admin Portal */}
        <Link to="/login/admin" className="group transform hover:-translate-y-2 transition duration-300">
          <div className="bg-white rounded-2xl shadow-lg border border-border-light p-8 flex flex-col items-center hover:shadow-2xl hover:border-primary transition-colors">
            <div className="bg-primary/10 p-4 rounded-full mb-6 group-hover:scale-110 transition duration-300">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-primary-dark">Admin Portal</h2>
            <p className="text-center text-text-secondary">Manage users, departments, and system analytics</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
