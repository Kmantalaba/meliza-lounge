import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Heart, LogOut, Plus, LogIn, User, Menu, X, Image as ImageIcon, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from './src/supabase.js';

export default function MelizaLounge() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Booking state
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  
  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: 1,
      service: 'Gel Manicure with Art Design',
      description: 'Custom floral gel design',
      image: '🎨',
      date: 'March 2024'
    },
    {
      id: 2,
      service: 'Acrylic Nails Extension',
      description: 'Ombre gradient with glitter',
      image: '✨',
      date: 'March 2024'
    },
    {
      id: 3,
      service: 'French Manicure',
      description: 'Classic white tip',
      image: '💎',
      date: 'February 2024'
    }
  ]);
  
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    service: '',
    description: '',
    image: ''
  });

  // Auth state
  const [loginPassword, setLoginPassword] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [supabaseSetupMessage, setSupabaseSetupMessage] = useState('Checking Supabase connection...');
  const [appointmentsTableExists, setAppointmentsTableExists] = useState(null);

  const ADMIN_TEST_EMAIL = 'root';
  const ADMIN_TEST_PASSWORD = 'admin';
  const DEPLOY_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@meliza-lounge.test';
  const APPOINTMENTS_TABLE_SQL = `CREATE TABLE appointments (
    id serial PRIMARY KEY,
    user_id text,
    date date NOT NULL,
    time text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    status text NOT NULL DEFAULT 'confirmed',
    created_at timestamp with time zone DEFAULT now()
  );`;

  // Working hours constants
  const WORKING_HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const MIN_ADVANCE_DAYS = 3;
  const BUSINESS_HOURS_START = 8;
  const BUSINESS_HOURS_END = 17;

  // Get minimum booking date (3 days from now)
  const getMinBookingDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + MIN_ADVANCE_DAYS);
    return today.toISOString().split('T')[0];
  };

  // Check if a date is Monday
  const isMonday = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).getDay() === 1;
  };

  // Get available time slots for a date
  const getAvailableSlots = (dateString) => {
    if (!dateString) return WORKING_HOURS;
    
    // Check if it's Monday
    if (isMonday(dateString)) return [];

    // Get bookings for this date
    const dayBookings = appointments.filter(apt => apt.date === dateString);
    
    // If no bookings, all slots available
    if (dayBookings.length === 0) return WORKING_HOURS;

    // Check which periods are booked (morning: before 13:00, afternoon: 13:00+)
    const hasMorningBooking = dayBookings.some(apt => {
      const time = apt.time.split(':')[0];
      return parseInt(time) < 13;
    });
    
    const hasAfternoonBooking = dayBookings.some(apt => {
      const time = apt.time.split(':')[0];
      return parseInt(time) >= 13;
    });

    // If both periods booked, return empty
    if (hasMorningBooking && hasAfternoonBooking) return [];

    // If morning booked, return afternoon slots only
    if (hasMorningBooking) {
      return WORKING_HOURS.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour >= 13;
      });
    }

    // If afternoon booked, return morning slots only
    if (hasAfternoonBooking) {
      return WORKING_HOURS.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour < 13;
      });
    }

    return WORKING_HOURS;
  };

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    if (!error && data) setAppointments(data);
  };

  const checkSupabaseSetup = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setSupabaseSetupMessage('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setAppointmentsTableExists(false);
      return;
    }

    const { error } = await supabase.from('appointments').select('id').limit(1);
    if (error) {
      const message = error.message || String(error);
      if (message.toLowerCase().includes('does not exist') || message.toLowerCase().includes('relation')) {
        setSupabaseSetupMessage('Supabase is connected, but the appointments table is missing.');
        setAppointmentsTableExists(false);
      } else {
        setSupabaseSetupMessage(`Supabase connection failed: ${message}`);
        setAppointmentsTableExists(false);
      }
      return;
    }

    setSupabaseSetupMessage('Supabase is connected and the appointments table exists.');
    setAppointmentsTableExists(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const name = session.user.user_metadata?.name || session.user.email.split('@')[0];
        const isAdminUser = session.user.email === DEPLOY_ADMIN_EMAIL || session.user.user_metadata?.role === 'admin';
        setCurrentUser({ id: session.user.id, email: session.user.email, name, role: isAdminUser ? 'admin' : 'user' });
        loadAppointments();
      }
    });
    checkSupabaseSetup();
  }, []);

  const openBookingModal = () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (!bookingName && currentUser.name) setBookingName(currentUser.name);
    if (!bookingEmail && currentUser.email) setBookingEmail(currentUser.email);
    setShowBookingModal(true);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    const normalizedEmail = loginEmail.trim().toLowerCase();

    if (normalizedEmail === ADMIN_TEST_EMAIL && loginPassword === ADMIN_TEST_PASSWORD) {
      setCurrentUser({ id: 'root', email: ADMIN_TEST_EMAIL, name: 'Root Admin', role: 'admin' });
      setLoginEmail('');
      setLoginPassword('');
      setShowLoginModal(false);
      await loadAppointments();
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: loginPassword,
    });
    if (error) {
      alert('Invalid email or password. Please try again or create an account.');
      return;
    }
    const isAdminUser = normalizedEmail === DEPLOY_ADMIN_EMAIL || data.user.user_metadata?.role === 'admin';
    const name = data.user.user_metadata?.name || data.user.email.split('@')[0];
    setCurrentUser({ id: data.user.id, email: data.user.email, name, role: isAdminUser ? 'admin' : 'user' });
    setLoginEmail('');
    setLoginPassword('');
    setShowLoginModal(false);
    await loadAppointments();
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAppointments([]);
    setActiveTab('home');
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (regName.trim().length < 2) {
      alert('Name must be at least 2 characters');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }
    if (regPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      options: { data: { name: regName.trim() } },
    });
    if (error) {
      alert(error.message);
      return;
    }
    const name = regName.trim();
    setCurrentUser({ id: data.user.id, email: data.user.email, name, role: 'user' });
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setShowRegisterModal(false);
    alert('Account created! Welcome to The Meliza Lounge!');
  };

  // Handle booking
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingDate || !bookingTime || !bookingName || !bookingEmail || !bookingPhone) {
      alert('Please fill in all fields');
      return;
    }

    if (bookingName.trim().length < 2) {
      alert('Please enter a valid name (at least 2 characters)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^(\+?63|0)9\d{9}$/;
    if (!phoneRegex.test(bookingPhone.replace(/[\s\-]/g, ''))) {
      alert('Please enter a valid phone number (e.g. 09XXXXXXXXX or +639XXXXXXXXX)');
      return;
    }

    const minDate = getMinBookingDate();
    if (bookingDate < minDate) {
      alert(`Bookings must be at least ${MIN_ADVANCE_DAYS} days in advance`);
      return;
    }

    if (isMonday(bookingDate)) {
      alert('We are closed on Mondays. Please select another date.');
      return;
    }

    const availableSlots = getAvailableSlots(bookingDate);
    if (!availableSlots.includes(bookingTime)) {
      alert('This time slot is no longer available. Please select another time.');
      return;
    }

    const { error } = await supabase.from('appointments').insert({
      user_id: currentUser.id,
      date: bookingDate,
      time: bookingTime,
      name: bookingName,
      email: bookingEmail,
      phone: bookingPhone,
      status: 'confirmed',
    });

    if (error) {
      alert('Booking failed. Please try again.');
      return;
    }

    await loadAppointments();
    setBookingDate('');
    setBookingTime('');
    setBookingName('');
    setBookingEmail('');
    setBookingPhone('');
    setShowBookingModal(false);
    alert('Appointment booked successfully!');
  };

  // Handle portfolio item addition
  const handleAddPortfolioItem = (e) => {
    e.preventDefault();
    if (newPortfolioItem.service && newPortfolioItem.description) {
      setPortfolioItems([...portfolioItems, {
        id: Date.now(),
        service: newPortfolioItem.service,
        description: newPortfolioItem.description,
        image: newPortfolioItem.image || '💅',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      }]);
      setNewPortfolioItem({ service: '', description: '', image: '' });
      setShowPortfolioModal(false);
      alert('Portfolio item added successfully!');
    }
  };

  // Delete portfolio item
  const handleDeletePortfolio = (id) => {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
      setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    }
  };

  // Delete appointment
  const handleCancelAppointment = async (id) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (!error) setAppointments(prev => prev.filter(apt => apt.id !== id));
    }
  };

  const availableSlots = useMemo(() => bookingDate ? getAvailableSlots(bookingDate) : [], [bookingDate, appointments]);
  const minDate = useMemo(getMinBookingDate, []);
  const userAppointments = useMemo(() => currentUser ? appointments.filter(apt => apt.user_id === currentUser.id) : [], [currentUser, appointments]);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', backgroundImage: 'url(/meliza_logo.png)', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundSize: '50%', backgroundAttachment: 'fixed' }} className="text-white">
      {/* Navigation */}
      <nav style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(218, 165, 32, 0.2)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/meliza_logo.png" alt="The Meliza Lounge" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
            <span style={{ fontFamily: "'Calibre Lights', serif", color: '#DAA520', fontSize: '16px', fontWeight: '700', letterSpacing: '0.05em', lineHeight: '1.2', textShadow: '0 0 12px rgba(218,165,32,0.4)' }}>The Meliza<br/>Lounge</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'home' ? '#DAA520' : '#999', borderBottom: activeTab === 'home' ? '2px solid #DAA520' : 'none' }} className="pb-1">Home</button>
            <button onClick={() => { setActiveTab('portfolio'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'portfolio' ? '#DAA520' : '#999', borderBottom: activeTab === 'portfolio' ? '2px solid #DAA520' : 'none' }} className="pb-1">Portfolio</button>
            {isAdmin && <button onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'admin' ? '#DAA520' : '#999', borderBottom: activeTab === 'admin' ? '2px solid #DAA520' : 'none' }} className="pb-1">Admin</button>}
            <button onClick={() => { openBookingModal(); setMobileMenuOpen(false); }} style={{ background: '#DAA520', color: '#1a1a1a' }} className="px-4 py-2 rounded-lg font-semibold hover:bg-amber-400">Book Now</button>
            {currentUser ? (
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
            ) : (
              <>
                <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} style={{ color: '#DAA520' }} className="hover:text-amber-400">Login</button>
                <button onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false); }} style={{ color: '#1a1a1a', background: '#DAA520', border: '1px solid #DAA520' }} className="px-3 py-1 rounded-lg text-sm font-semibold hover:bg-amber-400">Sign Up</button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ background: 'rgba(0, 0, 0, 0.9)' }} className="md:hidden border-t border-amber-700 p-4 space-y-2">
            <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="block w-full text-left py-2" style={{ color: activeTab === 'home' ? '#DAA520' : '#999' }}>Home</button>
            <button onClick={() => { setActiveTab('portfolio'); setMobileMenuOpen(false); }} className="block w-full text-left py-2" style={{ color: activeTab === 'portfolio' ? '#DAA520' : '#999' }}>Portfolio</button>
            {isAdmin && <button onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} className="block w-full text-left py-2" style={{ color: activeTab === 'admin' ? '#DAA520' : '#999' }}>Admin</button>}
            <button onClick={() => { openBookingModal(); setMobileMenuOpen(false); }} style={{ background: '#DAA520', color: '#1a1a1a' }} className="block w-full py-2 rounded-lg font-semibold">Book Now</button>
            {currentUser ? (
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">Logout</button>
            ) : (
              <>
                <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} className="block w-full text-left py-2" style={{ color: '#DAA520' }}>Login</button>
                <button onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false); }} style={{ background: '#DAA520', color: '#1a1a1a' }} className="block w-full py-2 rounded-lg font-semibold text-sm">Sign Up</button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(218, 165, 32, 0.15)', borderRadius: '16px', padding: '18px', marginBottom: '24px' }}>
          <p style={{ color: '#DAA520', fontSize: '14px', marginBottom: '6px', fontWeight: '700' }}>Supabase status</p>
          <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px' }}>{supabaseSetupMessage}</p>
          {appointmentsTableExists === false && (
            <div style={{ background: '#111', border: '1px solid rgba(218, 165, 32, 0.15)', borderRadius: '12px', padding: '14px', overflowX: 'auto' }}>
              <p style={{ color: '#fff', fontSize: '13px', marginBottom: '8px' }}>Run this SQL in Supabase SQL editor to create the missing appointments table:</p>
              <pre style={{ color: '#ccc', fontSize: '13px', whiteSpace: 'pre-wrap', margin: 0 }}>{APPOINTMENTS_TABLE_SQL}</pre>
            </div>
          )}
        </div>
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 style={{ fontSize: '48px', color: '#DAA520', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }} className="mb-4">
                ✨ The Meliza Lounge ✨
              </h1>
              <p style={{ fontSize: '20px', color: '#ccc' }} className="mb-2">Nail Artistry, Beauty & Luxury</p>
              <p style={{ fontSize: '14px', color: '#999' }} className="mb-6">Premium nail services starting from ₱799.00</p>
              <button onClick={openBookingModal} style={{ background: '#DAA520', color: '#1a1a1a' }} className="px-8 py-3 rounded-lg font-bold text-lg hover:bg-amber-400 transition">
                📅 Book Your Appointment
              </button>
            </div>

            {/* Business Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div style={{ background: 'rgba(218, 165, 32, 0.1)', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '12px' }} className="p-6">
                <Clock size={32} style={{ color: '#DAA520', marginBottom: '12px' }} />
                <h3 style={{ color: '#DAA520', fontSize: '18px', fontWeight: 'bold' }} className="mb-2">Hours</h3>
                <p style={{ color: '#ccc' }}>Monday - Sunday</p>
                <p style={{ color: '#999' }}>8:00 AM - 5:00 PM</p>
                <p style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '8px' }}>Closed Every Monday</p>
              </div>

              <div style={{ background: 'rgba(218, 165, 32, 0.1)', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '12px' }} className="p-6">
                <Heart size={32} style={{ color: '#DAA520', marginBottom: '12px' }} />
                <h3 style={{ color: '#DAA520', fontSize: '18px', fontWeight: 'bold' }} className="mb-2">Services</h3>
                <p style={{ color: '#ccc' }}>Premium Nail Design</p>
                <p style={{ color: '#ccc' }}>Gel & Acrylic Work</p>
                <p style={{ color: '#ccc' }}>Custom Art & Designs</p>
              </div>

              <div style={{ background: 'rgba(218, 165, 32, 0.1)', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '12px' }} className="p-6">
                <MapPin size={32} style={{ color: '#DAA520', marginBottom: '12px' }} />
                <h3 style={{ color: '#DAA520', fontSize: '18px', fontWeight: 'bold' }} className="mb-2">Booking</h3>
                <p style={{ color: '#ccc' }}>Book 3 Days in Advance</p>
                <p style={{ color: '#ccc' }}>Same Day Afternoon Available</p>
                <p style={{ color: '#ccc' }}>Instant Confirmation</p>
              </div>
            </div>

            {/* How It Works */}
            <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)', borderRadius: '12px' }} className="p-8 mb-12">
              <h2 style={{ color: '#DAA520', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { num: '1', title: 'Select Date', desc: 'Choose a date 3+ days from now' },
                  { num: '2', title: 'Pick Time', desc: 'Select morning or afternoon slot' },
                  { num: '3', title: 'Add Details', desc: 'Enter your contact information' },
                  { num: '4', title: 'Confirm', desc: 'Get instant booking confirmation' }
                ].map((step, i) => (
                  <div key={i} className="text-center">
                    <div style={{ background: '#DAA520', color: '#1a1a1a', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 12px' }}>
                      {step.num}
                    </div>
                    <h3 style={{ color: '#DAA520', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{step.title}</h3>
                    <p style={{ color: '#999', fontSize: '14px' }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Portfolio Preview */}
            {portfolioItems.length > 0 && (
              <div className="mb-12">
                <h2 style={{ color: '#DAA520', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Featured Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {portfolioItems.slice(0, 3).map(item => (
                    <div key={item.id} style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)', borderRadius: '12px', overflow: 'hidden' }} className="hover:border-amber-500 transition">
                      <div style={{ background: 'linear-gradient(135deg, #DAA520, #8B7500)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
                        {item.image}
                      </div>
                      <div className="p-4">
                        <h3 style={{ color: '#DAA520', fontWeight: 'bold', marginBottom: '8px' }}>{item.service}</h3>
                        <p style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>{item.description}</p>
                        <p style={{ color: '#666', fontSize: '12px' }}>{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 style={{ color: '#DAA520', fontSize: '32px', fontWeight: 'bold' }}>Portfolio Gallery</h1>
              {isAdmin && (
                <button onClick={() => setShowPortfolioModal(true)} style={{ background: '#DAA520', color: '#1a1a1a' }} className="px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400">
                  <Plus size={20} /> Add Work
                </button>
              )}
            </div>

            {portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map(item => (
                  <div key={item.id} style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)', borderRadius: '12px', overflow: 'hidden' }} className="hover:border-amber-500 transition">
                    <div style={{ background: 'linear-gradient(135deg, #DAA520, #8B7500)', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '100px' }}>
                      {item.image}
                    </div>
                    <div className="p-6">
                      <h3 style={{ color: '#DAA520', fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{item.service}</h3>
                      <p style={{ color: '#ccc', marginBottom: '8px' }}>{item.description}</p>
                      <p style={{ color: '#999', fontSize: '12px', marginBottom: '12px' }}>{item.date}</p>
                      {isAdmin && (
                        <button onClick={() => handleDeletePortfolio(item.id)} className="text-red-400 hover:text-red-300 flex items-center gap-2">
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)', borderRadius: '12px' }} className="p-12 text-center">
                <p style={{ color: '#999', fontSize: '16px' }}>No portfolio items yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && isAdmin && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <h1 style={{ color: '#DAA520', fontSize: '32px', fontWeight: 'bold' }}>Admin Dashboard</h1>
              <span style={{ background: '#DAA520', color: '#1a1a1a', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.05em' }}>ADMIN</span>
            </div>
            <p style={{ color: '#999', marginBottom: '28px', fontSize: '14px' }}>Logged in as {currentUser.email}</p>

            {/* All Appointments */}
            <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(218,165,32,0.2)', borderRadius: '12px' }} className="p-6 mb-6">
              <h2 style={{ color: '#DAA520', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                All Appointments <span style={{ color: '#999', fontSize: '14px', fontWeight: 'normal' }}>({appointments.length} total)</span>
              </h2>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(218,165,32,0.15)', borderRadius: '8px' }} className="p-4 flex justify-between items-start gap-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 text-sm">
                        <div>
                          <p style={{ color: '#DAA520', fontSize: '11px', marginBottom: '4px', letterSpacing: '0.05em' }}>CUSTOMER</p>
                          <p style={{ color: '#fff', fontWeight: 'bold' }}>{apt.name}</p>
                          <p style={{ color: '#999', fontSize: '12px' }}>{apt.email}</p>
                          <p style={{ color: '#999', fontSize: '12px' }}>{apt.phone}</p>
                        </div>
                        <div>
                          <p style={{ color: '#DAA520', fontSize: '11px', marginBottom: '4px', letterSpacing: '0.05em' }}>DATE</p>
                          <p style={{ color: '#fff' }}>{new Date(apt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p style={{ color: '#DAA520', fontSize: '11px', marginBottom: '4px', letterSpacing: '0.05em' }}>TIME</p>
                          <p style={{ color: '#fff' }}>⏰ {apt.time}</p>
                        </div>
                        <div>
                          <p style={{ color: '#DAA520', fontSize: '11px', marginBottom: '4px', letterSpacing: '0.05em' }}>STATUS</p>
                          <span style={{ color: '#4ade80', fontSize: '13px' }}>✓ {apt.status}</span>
                        </div>
                      </div>
                      <button onClick={() => handleCancelAppointment(apt.id)} style={{ color: '#f87171', fontSize: '13px', whiteSpace: 'nowrap' }} className="hover:text-red-300">Cancel</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999' }}>No appointments yet.</p>
              )}
            </div>

            {/* Portfolio shortcut */}
            <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(218,165,32,0.2)', borderRadius: '12px' }} className="p-6">
              <h2 style={{ color: '#DAA520', fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Portfolio</h2>
              <div className="flex gap-3">
                <button onClick={() => setActiveTab('portfolio')} style={{ background: '#DAA520', color: '#1a1a1a' }} className="px-4 py-2 rounded-lg font-bold hover:bg-amber-400">
                  Manage Portfolio →
                </button>
                <button onClick={() => setShowPortfolioModal(true)} style={{ border: '1px solid #DAA520', color: '#DAA520' }} className="px-4 py-2 rounded-lg font-bold hover:bg-amber-900">
                  + Add Work
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Dashboard */}
        {currentUser && !isAdmin && (
          <div className="mb-12">
            <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)', borderRadius: '12px' }} className="p-6 mb-12">
              <div className="flex items-center gap-4">
                <div style={{ background: '#DAA520', color: '#1a1a1a', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {currentUser.name[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ color: '#DAA520', fontWeight: 'bold', fontSize: '16px' }}>Welcome, {currentUser.name}!</p>
                  <p style={{ color: '#999', fontSize: '14px' }}>{currentUser.email}</p>
                </div>
              </div>
            </div>

            {/* My Appointments */}
            <div>
              <h2 style={{ color: '#DAA520', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Your Appointments</h2>
              {userAppointments.length > 0 ? (
                <div className="space-y-4">
                  {userAppointments.map(apt => (
                    <div key={apt.id} style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)', borderRadius: '12px' }} className="p-6 flex justify-between items-start">
                      <div>
                        <p style={{ color: '#DAA520', fontWeight: 'bold', fontSize: '16px' }}>{new Date(apt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p style={{ color: '#ccc', fontSize: '16px', marginTop: '8px' }}>⏰ {apt.time}</p>
                        <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>Status: <span style={{ color: '#4ade80' }}>✓ {apt.status}</span></p>
                      </div>
                      <button onClick={() => handleCancelAppointment(apt.id)} className="text-red-400 hover:text-red-300 px-4 py-2">
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(218, 165, 32, 0.2)', borderRadius: '12px' }} className="p-6">
                  <p style={{ color: '#999' }}>You have no appointments yet.</p>
                  <button onClick={openBookingModal} style={{ background: '#DAA520', color: '#1a1a1a' }} className="mt-4 px-4 py-2 rounded-lg font-bold hover:bg-amber-400">
                    Book Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ color: '#DAA520', fontSize: '24px', fontWeight: 'bold', marginBottom: '6px' }}>Login</h2>
            <p style={{ color: '#999', fontSize: '13px', marginBottom: '20px' }}>Login required to book an appointment</p>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', marginBottom: '12px', fontSize: '14px' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', marginBottom: '16px', fontSize: '14px' }}
              />
              <div className="flex gap-4">
                <button type="submit" style={{ background: '#DAA520', color: '#1a1a1a' }} className="flex-1 py-2 rounded-lg font-bold hover:bg-amber-400">
                  Login
                </button>
                <button type="button" onClick={() => setShowLoginModal(false)} style={{ background: '#333', color: '#fff', border: '1px solid rgba(218, 165, 32, 0.3)' }} className="flex-1 py-2 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
              </div>
              <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '12px' }}>
                Test admin login: <strong style={{ color: '#DAA520' }}>root/admin</strong>. Deployed admin email: <strong style={{ color: '#DAA520' }}>{DEPLOY_ADMIN_EMAIL}</strong>.
              </p>
              <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} style={{ color: '#DAA520', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                  Create one
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflowY: 'auto', paddingTop: '20px', paddingBottom: '20px' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '12px', padding: '32px', maxWidth: '420px', width: '90%' }}>
            <h2 style={{ color: '#DAA520', fontSize: '24px', fontWeight: 'bold', marginBottom: '6px' }}>Create Account</h2>
            <p style={{ color: '#999', fontSize: '13px', marginBottom: '20px' }}>Sign up to book appointments at The Meliza Lounge</p>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Full name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>
              <div className="mb-5">
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" style={{ background: '#DAA520', color: '#1a1a1a' }} className="flex-1 py-2 rounded-lg font-bold hover:bg-amber-400">
                  Create Account
                </button>
                <button type="button" onClick={() => setShowRegisterModal(false)} style={{ background: '#333', color: '#fff', border: '1px solid rgba(218, 165, 32, 0.3)' }} className="flex-1 py-2 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
              </div>
              <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} style={{ color: '#DAA520', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                  Login
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflowY: 'auto', paddingTop: '20px', paddingBottom: '20px' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#DAA520', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Book Your Appointment</h2>
            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Date (3+ days in advance)</label>
                <input
                  type="date"
                  min={minDate}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
                {bookingDate && isMonday(bookingDate) && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '6px' }}>❌ We're closed on Mondays</p>}
              </div>

              <div className="mb-4">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Time</label>
                {bookingDate ? (
                  availableSlots.length > 0 ? (
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                    >
                      <option value="">Select a time</option>
                      {availableSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  ) : (
                    <p style={{ color: '#ff6b6b', padding: '12px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px' }}>No available slots on this date</p>
                  )
                ) : (
                  <p style={{ color: '#999', padding: '12px' }}>Select a date first</p>
                )}
              </div>

              <div className="mb-4">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>

              <div className="mb-4">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                <input
                  type="email"
                  placeholder="Your email"
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>

              <div className="mb-6">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phone</label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" style={{ background: '#DAA520', color: '#1a1a1a' }} className="flex-1 py-3 rounded-lg font-bold hover:bg-amber-400 text-lg">
                  Confirm Booking
                </button>
                <button type="button" onClick={() => setShowBookingModal(false)} style={{ background: '#333', color: '#fff', border: '1px solid rgba(218, 165, 32, 0.3)' }} className="flex-1 py-3 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '12px', padding: '32px', maxWidth: '450px', width: '90%' }}>
            <h2 style={{ color: '#DAA520', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Add to Portfolio</h2>
            <form onSubmit={handleAddPortfolioItem}>
              <div className="mb-4">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Service Type</label>
                <input
                  type="text"
                  placeholder="e.g., Gel Manicure with Design"
                  value={newPortfolioItem.service}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, service: e.target.value })}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>

              <div className="mb-4">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
                <textarea
                  placeholder="Describe what you did"
                  value={newPortfolioItem.description}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div className="mb-6">
                <label style={{ color: '#DAA520', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Icon/Emoji (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 💅 or 🎨"
                  value={newPortfolioItem.image}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, image: e.target.value })}
                  maxLength="2"
                  style={{ background: '#2d2d2d', border: '1px solid rgba(218, 165, 32, 0.3)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', fontSize: '14px' }}
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" style={{ background: '#DAA520', color: '#1a1a1a' }} className="flex-1 py-2 rounded-lg font-bold hover:bg-amber-400">
                  Add to Portfolio
                </button>
                <button type="button" onClick={() => setShowPortfolioModal(false)} style={{ background: '#333', color: '#fff', border: '1px solid rgba(218, 165, 32, 0.3)' }} className="flex-1 py-2 rounded-lg hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: 'rgba(0, 0, 0, 0.7)', borderTop: '1px solid rgba(218, 165, 32, 0.2)', marginTop: '60px', padding: '30px' }} className="text-center">
        <p style={{ color: '#DAA520', fontWeight: 'bold', marginBottom: '8px' }}>👑 The Meliza Lounge 👑</p>
        <p style={{ color: '#999' }}>Premium Nail Artistry, Beauty & Luxury</p>
        <p style={{ color: '#666', fontSize: '12px', marginTop: '12px' }}>© 2024 The Meliza Lounge. All rights reserved.</p>
      </footer>
    </div>
  );
}