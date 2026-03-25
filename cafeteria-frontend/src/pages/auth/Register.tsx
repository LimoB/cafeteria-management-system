import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { registerUser } from '../../api/auth';
import { resetAuth } from '../../app/slices/authSlice';
import { 
  Loader2, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  BookOpen, 
  Phone, 
  School, 
  GraduationCap, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '', 
    email: '',
    phone: '',
    registerNumber: '',
    department: '',
    graduationYear: new Date().getFullYear() + 4,
    password: '',
    confirmPassword: '',
  });

  const { name, username, email, phone, registerNumber, department, graduationYear, password, confirmPassword } = formData;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/home');
    return () => { dispatch(resetAuth()); };
  }, [user, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Password Match Validation
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    // 2. M-Pesa Phone Validation (Must start with 254)
    if (!phone.startsWith('254') || phone.length !== 12) {
      return toast.error("Phone must be in format 254XXXXXXXXX");
    }

    try {
      const response = await registerUser({
        name, 
        username, 
        email, 
        phone, 
        registerNumber, 
        department, 
        graduationYear: Number(graduationYear), 
        password
      });
      
      if (response.success) {
        toast.success("Account created! Please sign in.");
        navigate('/auth/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Details might be in use.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-3xl w-full space-y-8 p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600 mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
            Create <span className="text-red-600">Account</span>
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Join the Laikipia Smart Canteen
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            
            {/* Column 1: Personal & Academic Info */}
            <div className="space-y-5">
              <InputField label="Full Name" name="name" icon={<User size={18}/>} value={name} onChange={onChange} placeholder="Boaz Kipchirchir" />
              <InputField label="Reg Number" name="registerNumber" icon={<BookOpen size={18}/>} value={registerNumber} onChange={onChange} placeholder="SC/ICT/22/12" />
              <InputField label="Department" name="department" icon={<School size={18}/>} value={department} onChange={onChange} placeholder="Computer Science" />
              <InputField label="Graduation Year" name="graduationYear" type="number" icon={<GraduationCap size={18}/>} value={graduationYear} onChange={onChange} />
            </div>

            {/* Column 2: Contact & Security */}
            <div className="space-y-5">
              <InputField label="Username" name="username" icon={<User size={18}/>} value={username} onChange={onChange} placeholder="boaz_limo" />
              <InputField label="Email Address" name="email" type="email" icon={<Mail size={18}/>} value={email} onChange={onChange} placeholder="student@ac.ke" />
              <InputField label="M-Pesa Phone (254...)" name="phone" icon={<Phone size={18}/>} value={phone} onChange={onChange} placeholder="254712345678" />
              <InputField label="Password" name="password" type="password" icon={<Lock size={18}/>} value={password} onChange={onChange} placeholder="••••••••" />
            </div>
          </div>
          
          <div className="pt-2">
            <InputField label="Confirm Secure Password" name="confirmPassword" type="password" icon={<CheckCircle2 size={18}/>} value={confirmPassword} onChange={onChange} placeholder="••••••••" />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-5 bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-600 transition-all flex justify-center items-center gap-3 shadow-xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Create Student Account <ChevronRight size={18} /></>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-gray-50">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-tight">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-red-600 font-black hover:underline underline-offset-4 decoration-2">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

interface InputProps {
  label: string;
  icon: React.ReactNode;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const InputField = ({ label, icon, ...props }: InputProps) => (
  <div className="space-y-1 group">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 transition-colors group-focus-within:text-red-600">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors">
        {icon}
      </span>
      <input 
        {...props} 
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-red-600 focus:bg-white text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium" 
        required 
      />
    </div>
  </div>
);

export default Register;