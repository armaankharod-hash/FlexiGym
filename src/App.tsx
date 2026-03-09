import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Dumbbell, 
  LayoutDashboard, 
  UserPlus, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Settings, 
  ShieldCheck,
  Menu,
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  Briefcase,
  ChevronRight,
  Search,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Context & Auth ---
const AuthContext = createContext<any>(null);

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: any) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm",
        variants[variant as keyof typeof variants],
        sizes[size as keyof typeof sizes],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input 
      className={cn(
        "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
        error && "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
      )}
      {...props}
    />
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-bottom border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// --- Pages ---

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate(data.user.role === 'super_admin' ? '/admin' : '/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">FlexiGym SaaS</h1>
          <p className="text-slate-500 mt-2">Manage your fitness empire with ease</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@gym.com"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
        <p className="text-center text-slate-400 text-sm mt-8">
          Contact platform administrator for account access.
        </p>
      </motion.div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = user?.role === 'super_admin' ? [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Manage Gyms', icon: ShieldCheck, path: '/admin/gyms' },
  ] : [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Members', icon: Users, path: '/members' },
    { label: 'Trainers', icon: Briefcase, path: '/trainers' },
    { label: 'Plans', icon: CreditCard, path: '/plans' },
    { label: 'Attendance', icon: Calendar, path: '/attendance' },
    { label: 'Trainer Attendance', icon: UserCheck, path: '/trainer-attendance' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">FlexiGym</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.gymName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-lg">FlexiGym</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-4 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-lg">{item.label}</span>
                  </Link>
                ))}
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-4 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium text-lg mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Admin Pages ---

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setStats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500">Welcome back, Super Admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Gyms</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalGyms}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Gyms</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeGyms}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
        <Link to="/admin/gyms">
          <Button variant="ghost" size="sm">View All Gyms <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </Link>
      </div>
    </div>
  );
};

const AdminGyms = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGym, setNewGym] = useState({ name: '', email: '', password: '' });
  const { token } = useAuth();

  const fetchGyms = () => {
    fetch('/api/admin/gyms', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setGyms);
  };

  useEffect(fetchGyms, []);

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/gyms', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newGym),
    });
    if (res.ok) {
      setIsModalOpen(false);
      setNewGym({ name: '', email: '', password: '' });
      fetchGyms();
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    await fetch(`/api/admin/gyms/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ active: !currentStatus }),
    });
    fetchGyms();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Gyms</h1>
          <p className="text-slate-500">Create and manage client gym accounts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Add New Gym
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Gym Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Owner Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gyms.map((gym) => (
                <tr key={gym.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{gym.name}</div>
                    <div className="text-xs text-slate-400">ID: {gym.id}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{gym.owner_email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      gym.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {gym.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => toggleStatus(gym.id, gym.active)}
                      >
                        {gym.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Gym">
        <form onSubmit={handleCreateGym} className="space-y-4">
          <Input 
            label="Gym Name" 
            value={newGym.name} 
            onChange={(e: any) => setNewGym({ ...newGym, name: e.target.value })} 
            required 
          />
          <Input 
            label="Owner Email" 
            type="email" 
            value={newGym.email} 
            onChange={(e: any) => setNewGym({ ...newGym, email: e.target.value })} 
            required 
          />
          <Input 
            label="Initial Password" 
            type="password" 
            value={newGym.password} 
            onChange={(e: any) => setNewGym({ ...newGym, password: e.target.value })} 
            required 
          />
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- Gym Owner Pages ---

const GymDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const { token, user } = useAuth();

  const fetchStats = () => {
    fetch(`/api/gym/stats?t=${Date.now()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setStats);
  };

  useEffect(fetchStats, []);

  if (!stats) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user.gymName} Dashboard</h1>
          <p className="text-slate-500">Here's what's happening today at your gym.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-slate-900">{format(new Date(), 'EEEE, MMMM do')}</p>
          <p className="text-xs text-slate-500">Manage your members and growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Active Members', value: stats.activeMembers, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: "Today's Attendance", value: stats.todayAttendance, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Trainers', value: stats.totalTrainers, icon: UserCheck, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Membership Expiry Alerts</h3>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase">Next 7 Days</span>
          </div>
          <div className="space-y-4">
            {stats.expiringMembersList?.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No memberships expiring soon.</p>
            ) : (
              <div className="space-y-3">
                {stats.expiringMembersList?.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-rose-600 font-medium">Expires: {m.expiry_date}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const message = encodeURIComponent(`Hi ${m.name}, your membership is expiring on ${m.expiry_date}. Please renew soon!`);
                        window.open(`https://wa.me/${m.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
                      }}
                      className="p-2 bg-white text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-50 transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Notifications</h3>
          </div>
          <div className="space-y-4">
            {stats.recentNotifications?.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No recent notifications.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentNotifications?.map((n: any) => (
                  <div key={n.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{n.member_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{n.type} reminder logged</p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {format(new Date(n.sent_at), 'MMM d, HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link to="/members">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2">
                <UserPlus className="w-6 h-6" />
                Add Member
              </Button>
            </Link>
            <Link to="/plans">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2">
                <CreditCard className="w-6 h-6" />
                Manage Plans
              </Button>
            </Link>
            <Link to="/attendance">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2">
                <Calendar className="w-6 h-6" />
                Mark Attendance
              </Button>
            </Link>
            <Link to="/trainers">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2">
                <Briefcase className="w-6 h-6" />
                Manage Trainers
              </Button>
            </Link>
            <Link to="/trainer-attendance">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2">
                <UserCheck className="w-6 h-6" />
                Trainer Attendance
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

const TrainersPage = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [salaries, setSalaries] = useState<any[]>([]);
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Floor Trainer',
    salary: '',
    join_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Active'
  });
  const [salaryFormData, setSalaryFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Paid',
    notes: ''
  });

  const fetchTrainers = async () => {
    const res = await fetch('/api/gym/trainers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setTrainers(data);
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingTrainer ? `/api/gym/trainers/${editingTrainer.id}` : '/api/gym/trainers';
    const method = editingTrainer ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchTrainers();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this trainer?')) return;
    try {
      const res = await fetch(`/api/gym/trainers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTrainers();
      } else {
        const data = await res.json();
        alert(`Failed to delete trainer: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete trainer due to a network error.');
    }
  };

  const openSalaryModal = async (trainer: any) => {
    setSelectedTrainer(trainer);
    setSalaryFormData({
      amount: trainer.salary.toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Paid',
      notes: ''
    });
    const res = await fetch(`/api/gym/trainers/${trainer.id}/salaries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setSalaries(data);
    setIsSalaryModalOpen(true);
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/gym/trainers/${selectedTrainer.id}/salaries`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(salaryFormData),
    });
    if (res.ok) {
      const updatedRes = await fetch(`/api/gym/trainers/${selectedTrainer.id}/salaries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await updatedRes.json();
      setSalaries(data);
      setSalaryFormData({ ...salaryFormData, notes: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trainer Management</h1>
          <p className="text-slate-500">Manage your gym's training staff</p>
        </div>
        <Button onClick={() => { setEditingTrainer(null); setFormData({ name: '', phone: '', role: 'Floor Trainer', salary: '', join_date: format(new Date(), 'yyyy-MM-dd'), status: 'Active' }); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" /> Add Trainer
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Trainer</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Salary</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainers.map((trainer) => (
                <tr key={trainer.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{trainer.name}</div>
                    <div className="text-xs text-slate-500">{trainer.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{trainer.role}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">₹{trainer.salary}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      trainer.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {trainer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openSalaryModal(trainer)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Salary Tracking"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setEditingTrainer(trainer); setFormData(trainer); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(trainer.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="tel" required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Floor Trainer">Floor Trainer</option>
                <option value="Personal Trainer">Personal Trainer</option>
                <option value="Coach">Coach</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Salary</label>
              <input 
                type="number" required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
              <input 
                type="date" required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full py-3 mt-4">
            {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
          </Button>
        </form>
      </Modal>

      <Modal 
        isOpen={isSalaryModalOpen} 
        onClose={() => setIsSalaryModalOpen(false)} 
        title={`Salary Tracking: ${selectedTrainer?.name}`}
      >
        <div className="space-y-6">
          <form onSubmit={handleSalarySubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Amount</label>
                <input 
                  type="number" required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  value={salaryFormData.amount}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                <input 
                  type="date" required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  value={salaryFormData.date}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  value={salaryFormData.status}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, status: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  placeholder="Optional notes..."
                  value={salaryFormData.notes}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" className="w-full py-2 text-sm">
              Record Payment
            </Button>
          </form>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 px-1">Payment History</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {salaries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No payment records found.</p>
              ) : (
                salaries.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-900">₹{s.amount}</p>
                      <p className="text-[10px] text-slate-500">{format(parseISO(s.date), 'MMMM d, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        s.status === 'Paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {s.status}
                      </span>
                      {s.notes && <p className="text-[10px] text-slate-400 mt-1">{s.notes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const TrainerAttendancePage = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryTrainer, setSummaryTrainer] = useState<any>(null);
  const [trainerAttendanceHistory, setTrainerAttendanceHistory] = useState<any[]>([]);
  const { token } = useAuth();

  const fetchData = async () => {
    const [trainersRes, attendanceRes] = await Promise.all([
      fetch('/api/gym/trainers', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`/api/gym/trainers/attendance?date=${date}`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    const trainersData = await trainersRes.json();
    const attendanceData = await attendanceRes.json();
    setTrainers(trainersData.filter((t: any) => t.status === 'Active'));
    setAttendance(attendanceData);
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  const markAttendance = async (trainerId: number, status: 'Present' | 'Absent', notes: string = '') => {
    const res = await fetch('/api/gym/trainers/attendance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ trainer_id: trainerId, date, status, notes }),
    });
    if (res.ok) fetchData();
  };

  const openSummary = async (trainer: any) => {
    setSummaryTrainer(trainer);
    const res = await fetch(`/api/gym/trainers/attendance?trainer_id=${trainer.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setTrainerAttendanceHistory(data);
    setIsSummaryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trainer Attendance</h1>
          <p className="text-slate-500">Track daily attendance for your staff</p>
        </div>
        <input 
          type="date" 
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Trainer</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Notes</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainers.map((trainer) => {
                const record = attendance.find(a => a.trainer_id === trainer.id);
                return (
                  <tr key={trainer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{trainer.name}</div>
                      <div className="text-xs text-slate-500">{trainer.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      {record ? (
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          record.status === 'Present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {record.status}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Marked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {record?.notes || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => markAttendance(trainer.id, 'Present')}
                          className={cn(
                            "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                            record?.status === 'Present' ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          )}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => markAttendance(trainer.id, 'Absent')}
                          className={cn(
                            "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                            record?.status === 'Absent' ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                          )}
                        >
                          Absent
                        </button>
                        <button 
                          onClick={() => openSummary(trainer)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Attendance History"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isSummaryModalOpen} 
        onClose={() => setIsSummaryModalOpen(false)} 
        title={`Attendance History: ${summaryTrainer?.name}`}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Total Present</p>
              <p className="text-2xl font-bold text-emerald-700">
                {trainerAttendanceHistory.filter(a => a.status === 'Present').length}
              </p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Total Absent</p>
              <p className="text-2xl font-bold text-rose-700">
                {trainerAttendanceHistory.filter(a => a.status === 'Absent').length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 px-1">Recent History</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {trainerAttendanceHistory.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{format(parseISO(a.date), 'MMMM d, yyyy')}</p>
                    {a.notes && <p className="text-[10px] text-slate-400">{a.notes}</p>}
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    a.status === 'Present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const PlansPage = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const { token } = useAuth();
  const [formData, setFormData] = useState({ name: '', price: '', duration_days: '' });

  const fetchPlans = () => {
    fetch('/api/gym/plans', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setPlans);
  };

  useEffect(fetchPlans, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPlan ? `/api/gym/plans/${editingPlan.id}` : '/api/gym/plans';
    const method = editingPlan ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      setIsModalOpen(false);
      setEditingPlan(null);
      setFormData({ name: '', price: '', duration_days: '' });
      fetchPlans();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    const res = await fetch(`/api/gym/plans/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Membership Plans</h1>
          <p className="text-slate-500">Manage the plans available for your members.</p>
        </div>
        <Button onClick={() => { setEditingPlan(null); setFormData({ name: '', price: '', duration_days: '' }); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" /> Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm">{plan.duration_days} Days</p>
              </div>
              <div className="text-xl font-bold text-indigo-600">₹{plan.price}</div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                variant="secondary" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  setEditingPlan(plan);
                  setFormData({ name: plan.name, price: plan.price.toString(), duration_days: plan.duration_days.toString() });
                  setIsModalOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => handleDelete(plan.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-400">No membership plans created yet.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPlan ? "Edit Plan" : "Add New Plan"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Plan Name" 
            placeholder="e.g. 1 Month Starter"
            value={formData.name} 
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Price (₹)" 
              type="number"
              value={formData.price} 
              onChange={(e: any) => setFormData({ ...formData, price: e.target.value })} 
              required 
            />
            <Input 
              label="Duration (Days)" 
              type="number"
              value={formData.duration_days} 
              onChange={(e: any) => setFormData({ ...formData, duration_days: e.target.value })} 
              required 
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editingPlan ? 'Save Changes' : 'Create Plan'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const MembersPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [paymentMember, setPaymentMember] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { token, user } = useAuth();
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    join_date: format(new Date(), 'yyyy-MM-dd'),
    membership_type: 'Monthly',
    expiry_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    payment_status: 'unpaid'
  });

  const fetchMembers = () => {
    fetch('/api/gym/members', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setMembers);
  };

  const fetchPlans = () => {
    fetch('/api/gym/plans', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setPlans);
  };

  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, []);

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id.toString() === planId);
    if (plan) {
      const joinDate = parseISO(formData.join_date);
      const expiryDate = addDays(joinDate, plan.duration_days);
      setFormData({
        ...formData,
        membership_type: plan.name,
        expiry_date: format(expiryDate, 'yyyy-MM-dd')
      });
    }
  };

  const handleJoinDateChange = (newDate: string) => {
    const joinDate = parseISO(newDate);
    // If a plan was already selected, recalculate expiry
    const currentPlan = plans.find(p => p.name === formData.membership_type);
    if (currentPlan) {
      const expiryDate = addDays(joinDate, currentPlan.duration_days);
      setFormData({
        ...formData,
        join_date: newDate,
        expiry_date: format(expiryDate, 'yyyy-MM-dd')
      });
    } else {
      setFormData({ ...formData, join_date: newDate });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingMember ? `/api/gym/members/${editingMember.id}` : '/api/gym/members';
    const method = editingMember ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({
        name: '',
        phone: '',
        join_date: format(new Date(), 'yyyy-MM-dd'),
        membership_type: 'Monthly',
        expiry_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        payment_status: 'unpaid'
      });
      fetchMembers();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch(`/api/gym/members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMembers();
      } else {
        const data = await res.json();
        alert(`Failed to delete member: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete member due to a network error.');
    }
  };

  const sendReminder = async (memberId: number, type: 'whatsapp') => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setSendingId(`${memberId}-${type}`);
    try {
      // Record in dashboard
      await fetch(`/api/gym/members/${memberId}/send-reminder`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type }),
      });

      // Open WhatsApp
      const message = encodeURIComponent(`Hi ${member.name}, this is a reminder regarding your membership expiring on ${member.expiry_date}.`);
      const whatsappUrl = `https://wa.me/${member.phone.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Failed to send reminder:', error);
    } finally {
      setSendingId(null);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Management</h1>
          <p className="text-slate-500">View and manage your gym members</p>
        </div>
        <Button onClick={() => { setEditingMember(null); setIsModalOpen(true); }}>
          <UserPlus className="w-5 h-5 mr-2" /> Add Member
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="pl-3">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Member</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Plan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Expiry</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Payment</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const isExpired = isBefore(parseISO(member.expiry_date), new Date());
                const isExpiringSoon = !isExpired && isBefore(parseISO(member.expiry_date), addDays(new Date(), 7));
                
                return (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{member.membership_type}</div>
                      <div className="text-xs text-slate-400">Joined: {member.join_date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "text-sm font-medium flex items-center gap-1.5",
                        isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-slate-700"
                      )}>
                        {isExpired && <AlertTriangle className="w-4 h-4" />}
                        {isExpiringSoon && <Clock className="w-4 h-4" />}
                        {member.expiry_date}
                      </div>
                      {isExpired && <div className="text-[10px] text-rose-500 font-bold uppercase">Expired</div>}
                      {isExpiringSoon && <div className="text-[10px] text-amber-500 font-bold uppercase">Expiring Soon</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        member.payment_status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {member.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => sendReminder(member.id, 'whatsapp')}
                          disabled={sendingId === `${member.id}-whatsapp`}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            sendingId === `${member.id}-whatsapp` 
                              ? "text-slate-300 bg-slate-50 cursor-not-allowed" 
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          )}
                          title="Send WhatsApp Reminder"
                        >
                          <MessageSquare className={cn("w-4 h-4", sendingId === `${member.id}-whatsapp` && "animate-pulse")} />
                        </button>
                        <button 
                          onClick={() => setPaymentMember(member)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Payment History"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingMember(member);
                            setFormData({
                              name: member.name,
                              phone: member.phone,
                              join_date: member.join_date,
                              membership_type: member.membership_type,
                              expiry_date: member.expiry_date,
                              payment_status: member.payment_status
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMember ? "Edit Member" : "Add New Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            value={formData.name} 
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} 
            required 
          />
          <Input 
            label="Phone Number" 
            value={formData.phone} 
            onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Join Date" 
              type="date"
              value={formData.join_date} 
              onChange={(e: any) => handleJoinDateChange(e.target.value)} 
              required 
            />
            <Input 
              label="Expiry Date" 
              type="date"
              value={formData.expiry_date} 
              onChange={(e: any) => setFormData({ ...formData, expiry_date: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Select Membership Plan</label>
            <select 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              onChange={(e) => handlePlanChange(e.target.value)}
              value={plans.find(p => p.name === formData.membership_type)?.id || ""}
            >
              <option value="" disabled>Choose a plan to auto-calculate expiry</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name} (₹{plan.price} - {plan.duration_days} Days)</option>
              ))}
              <option value="custom">Custom / Manual</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Plan Name" 
              value={formData.membership_type} 
              onChange={(e: any) => setFormData({ ...formData, membership_type: e.target.value })} 
              required 
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Payment Status</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editingMember ? 'Save Changes' : 'Add Member'}</Button>
          </div>
        </form>
      </Modal>
      <PaymentModal 
        isOpen={!!paymentMember} 
        onClose={() => setPaymentMember(null)} 
        member={paymentMember} 
        token={token!} 
        onPaymentAdded={fetchMembers}
      />
    </div>
  );
};

const AttendancePage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { token } = useAuth();

  const fetchData = async () => {
    const [mRes, hRes] = await Promise.all([
      fetch('/api/gym/members', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/gym/attendance', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    setMembers(await mRes.json());
    setHistory(await hRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const markAttendance = async (memberId: number) => {
    const res = await fetch('/api/gym/attendance', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ member_id: memberId, date: format(new Date(), 'yyyy-MM-dd') }),
    });
    if (res.ok) {
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendanceIds = history
    .filter(a => a.date === today)
    .map(a => a.member_id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance System</h1>
        <p className="text-slate-500">Mark daily attendance and view history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mark Attendance */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Mark Today
          </h2>
          <Card className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search member..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {filteredMembers.map(member => {
                const isMarked = todayAttendanceIds.includes(member.id);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.membership_type}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant={isMarked ? 'ghost' : 'primary'}
                      disabled={isMarked}
                      onClick={() => markAttendance(member.id)}
                    >
                      {isMarked ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : 'Mark'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Attendance History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Recent History
          </h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Member Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice(0, 20).map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{record.member_name}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-400">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { token, user, login } = useAuth();
  const [settings, setSettings] = useState({ name: '', whatsapp_number: '', sms_number: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/gym/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/gym/settings', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setMessage('Settings updated successfully!');
      // Update local storage/context if name changed
      const updatedUser = { ...user, gymName: settings.name };
      localStorage.setItem('gym_user', JSON.stringify(updatedUser));
      // Trigger a re-render/context update if needed - for now just local update
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gym Settings</h1>
        <p className="text-slate-500">Manage your gym's profile and contact information</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <Input 
            label="Gym Name" 
            value={settings.name} 
            onChange={(e: any) => setSettings({ ...settings, name: e.target.value })} 
            required 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="WhatsApp Business/Personal Number" 
              placeholder="+1234567890"
              value={settings.whatsapp_number || ''} 
              onChange={(e: any) => setSettings({ ...settings, whatsapp_number: e.target.value })} 
            />
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm text-indigo-700 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                This number helps identify your business. 
                WhatsApp reminders will open a new window with a pre-filled message.
              </span>
            </p>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {message}
            </div>
          )}

          <Button className="w-full" size="lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, member, token, onPaymentAdded }: { isOpen: boolean, onClose: () => void, member: any, token: string, onPaymentAdded: () => void }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPayment, setNewPayment] = useState({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), method: 'Cash', notes: '' });

  const fetchPayments = () => {
    if (!member) return;
    setLoading(true);
    fetch(`/api/gym/members/${member.id}/payments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setPayments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isOpen) fetchPayments();
  }, [isOpen, member]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/gym/members/${member.id}/payments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newPayment),
    });
    if (res.ok) {
      setNewPayment({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), method: 'Cash', notes: '' });
      fetchPayments();
      onPaymentAdded();
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!confirm('Delete this payment record?')) return;
    const res = await fetch(`/api/gym/payments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchPayments();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Payments: ${member?.name}`}>
      <div className="space-y-6">
        <form onSubmit={handleAddPayment} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <p className="text-sm font-bold text-slate-900">Add New Payment</p>
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Amount" 
              type="number" 
              value={newPayment.amount} 
              onChange={(e: any) => setNewPayment({ ...newPayment, amount: e.target.value })} 
              required 
            />
            <Input 
              label="Date" 
              type="date" 
              value={newPayment.date} 
              onChange={(e: any) => setNewPayment({ ...newPayment, date: e.target.value })} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Method</label>
              <select 
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={newPayment.method}
                onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Transfer</option>
              </select>
            </div>
            <Input 
              label="Notes" 
              value={newPayment.notes} 
              onChange={(e: any) => setNewPayment({ ...newPayment, notes: e.target.value })} 
            />
          </div>
          <Button type="submit" className="w-full" size="sm">Record Payment</Button>
        </form>

        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-900">Payment History</p>
          {loading ? (
            <div className="text-center py-4 text-slate-400">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No payments recorded yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div>
                    <div className="text-sm font-bold text-slate-900">₹{p.amount}</div>
                    <div className="text-[10px] text-slate-500">{p.date} • {p.method}</div>
                    {p.notes && <div className="text-[10px] text-slate-400 italic">{p.notes}</div>}
                  </div>
                  <button 
                    onClick={() => handleDeletePayment(p.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// --- App Root ---

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'super_admin' ? '/admin' : '/dashboard'} />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gym_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('gym_user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem('gym_token', newToken);
    localStorage.setItem('gym_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'super_admin' ? '/admin' : '/dashboard'} />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="super_admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/gyms" element={<ProtectedRoute role="super_admin"><AdminGyms /></ProtectedRoute>} />
          
          {/* Gym Owner Routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="gym_owner"><GymDashboard /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute role="gym_owner"><MembersPage /></ProtectedRoute>} />
          <Route path="/trainers" element={<ProtectedRoute role="gym_owner"><TrainersPage /></ProtectedRoute>} />
          <Route path="/trainer-attendance" element={<ProtectedRoute role="gym_owner"><TrainerAttendancePage /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute role="gym_owner"><PlansPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute role="gym_owner"><AttendancePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute role="gym_owner"><SettingsPage /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
