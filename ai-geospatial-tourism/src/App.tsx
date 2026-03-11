import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Compass, 
  User as UserIcon, 
  LogOut, 
  Search, 
  ChevronRight, 
  Star, 
  Hotel, 
  Info,
  Map as MapIcon,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { User, Destination, HistoryItem, Accommodation, TravelInsights, ItineraryItem } from './types';
import { getTravelInsights, getItinerary } from './services/gemini';
import { cn } from './lib/utils';

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-black/5 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-emerald-700">
        <Compass className="w-6 h-6" />
        <span className="hidden sm:inline">GeoTourism AI</span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-emerald-600 transition-colors">
              <UserIcon className="w-4 h-4" />
              {user.name}
            </Link>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-emerald-600 transition-colors">Login</Link>
            <Link to="/signup" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const Card = ({ children, className, onClick, key }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: React.Key }) => (
  <div 
    key={key}
    onClick={onClick}
    className={cn("bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden", className, onClick && "cursor-pointer")}
  >
    {children}
  </div>
);

// --- Pages ---

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80" 
          alt="Travel Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Travel Planning
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
          AI-Enhanced Geospatial <br />
          <span className="text-emerald-600">Tourism Recommendation</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Discover your next adventure with our intelligent travel assistant. 
          Personalized recommendations based on climate, interests, and geospatial analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-emerald-700 transition-all hover:scale-105">
            Get Started Free
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all">
            Login to Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const Auth = ({ mode }: { mode: 'login' | 'signup' }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = mode === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link to={mode === 'login' ? '/signup' : '/login'} className="text-emerald-600 font-semibold hover:underline">
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </Link>
        </p>
      </Card>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch(`/api/history/${user.id}`)
      .then(res => res.json())
      .then(setHistory);
  }, [user.id]);

  return (
    <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hello, {user.name}!</h1>
          <p className="text-slate-500">{user.email}</p>
        </div>
        <Link to="/planner" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-md">
          <Compass className="w-5 h-5" />
          Plan New Trip
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-emerald-600" />
        Travel Planning History
      </h2>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map(item => (
            <Card key={item.id} className="p-5 flex justify-between items-center hover:border-emerald-200 transition-colors">
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{item.month} • {item.interest}</div>
                <h3 className="text-lg font-bold text-slate-900">{item.destination_name}</h3>
                <p className="text-xs text-slate-400 mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-200">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No travel history yet. Start planning your first adventure!</p>
        </Card>
      )}
    </div>
  );
};

const Planner = ({ user }: { user: User }) => {
  const [month, setMonth] = useState('January');
  const [interest, setInterest] = useState('all');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categories = ['all', 'Beaches', 'Mountains', 'Heritage', 'Nature', 'Adventure', 'Wildlife'];

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/destinations?month=${month}&preference=${interest}`);
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDestination = async (dest: Destination) => {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        month,
        interest,
        destination_name: dest.name
      })
    });
    navigate(`/destination/${dest.id}`);
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Destination</h1>
        <p className="text-slate-500">Tell us when you want to travel and what you love.</p>
      </div>

      <Card className="p-6 mb-12 bg-emerald-50/50 border-emerald-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Travel Month</label>
            <select 
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Travel Preference</label>
            <select 
              value={interest}
              onChange={e => setInterest(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button 
            onClick={handleGetRecommendations}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Get Recommendations'}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {destinations.map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <Card 
                className="group cursor-pointer h-full flex flex-col hover:shadow-xl transition-all duration-300"
                onClick={() => handleSelectDestination(dest)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={dest.image_url} 
                    alt={dest.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                    {dest.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{dest.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{dest.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      <Calendar className="w-3 h-3" />
                      Best: {dest.best_months.split(',').slice(0, 2).join(', ')}...
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && destinations.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No destinations found</h3>
          <p className="text-slate-500">Try adjusting your filters to see more options.</p>
        </div>
      )}
    </div>
  );
};

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [dest, setDest] = useState<Destination | null>(null);
  const [insights, setInsights] = useState<TravelInsights | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dRes = await fetch(`/api/destinations/${id}`);
        const dData = await dRes.json();
        setDest(dData);

        // Fetch AI insights
        const aiInsights = await getTravelInsights(dData.name, dData.category);
        setInsights(aiInsights);

        // Fetch AI itinerary
        const aiItinerary = await getItinerary(dData.name, aiInsights.duration || "3 days");
        setItinerary(aiItinerary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="pt-32 text-center">Loading destination details...</div>;
  if (!dest) return <div className="pt-32 text-center">Destination not found.</div>;

  return (
    <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8 shadow-lg">
            <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">
                <MapPin className="w-4 h-4" />
                {dest.city}, {dest.state}
              </div>
              <h1 className="text-4xl font-bold">{dest.name}</h1>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-emerald-600" />
                About this Place
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">{dest.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Category</div>
                  <div className="font-bold text-slate-900">{dest.category}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Best Time</div>
                  <div className="font-bold text-slate-900">{dest.best_months.split(',').slice(0, 2).join(', ')}...</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Location</div>
                  <div className="font-bold text-slate-900">{dest.city}</div>
                </div>
              </div>
            </section>

            {itinerary && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  AI Suggested Itinerary
                </h2>
                <div className="space-y-4">
                  {itinerary.map((item) => (
                    <div key={item.day} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                        D{item.day}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.plan}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-emerald-600" />
                Location Map
              </h2>
              <div className="h-[400px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
                <MapContainer center={[dest.latitude, dest.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[dest.latitude, dest.longitude]}>
                    <Popup>{dest.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-emerald-900 text-white border-none">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              AI Travel Insights
            </h2>
            {insights ? (
              <div className="space-y-6">
                <div>
                  <div className="text-emerald-400 text-xs font-bold uppercase mb-2">Recommended Duration</div>
                  <div className="text-lg font-medium">{insights.duration}</div>
                </div>
                <div>
                  <div className="text-emerald-400 text-xs font-bold uppercase mb-3">Best Activities</div>
                  <ul className="space-y-2">
                    {insights.activities.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-emerald-400 text-xs font-bold uppercase mb-3">Travel Tips</div>
                  <ul className="space-y-2">
                    {insights.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-50/80">
                        <Star className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-emerald-800 rounded w-3/4"></div>
                <div className="h-4 bg-emerald-800 rounded w-1/2"></div>
                <div className="h-20 bg-emerald-800 rounded"></div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Link 
              to={`/nearby/${dest.id}`}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">Nearby Attractions</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
            <Link 
              to={`/accommodations/${dest.id}`}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Hotel className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">Where to Stay</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const NearbyAttractions = () => {
  const { id } = useParams<{ id: string }>();
  const [nearby, setNearby] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/nearby/${id}`)
      .then(res => res.json())
      .then(data => {
        setNearby(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Destination
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Nearby Attractions</h1>
        <p className="text-slate-500">Discover more amazing places within reach.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">Calculating distances...</div>
      ) : nearby.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nearby.map(place => (
            <Card key={place.id} className="flex flex-col sm:flex-row h-full">
              <div className="sm:w-40 h-40 shrink-0">
                <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{place.name}</h3>
                    <div className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                      {place.distance?.toFixed(1)} km away
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{place.description}</p>
                </div>
                <Link to={`/destination/${place.id}`} className="mt-4 text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline">
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No nearby attractions found</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            We couldn't find any other major attractions within a 200km radius of this location. 
            Try exploring other regions in the travel planner!
          </p>
        </div>
      )}
    </div>
  );
};

const Accommodations = () => {
  const { id } = useParams<{ id: string }>();
  const [accs, setAccs] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/accommodations/${id}`)
      .then(res => res.json())
      .then(data => {
        setAccs(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Destination
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Where to Stay</h1>
        <p className="text-slate-500">Curated accommodation options for your budget.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading options...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accs.map(acc => (
            <Card key={acc.id} className="flex flex-col h-full">
              <div className="h-40 relative">
                <img src={acc.image_url} alt={acc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                  {acc.price_range}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900">{acc.name}</h3>
                  <span className="text-xs font-medium text-slate-400">{acc.type}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                  <MapPin className="w-3 h-3" />
                  {acc.distance} km from center
                </div>
                <a 
                  href={acc.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-auto py-2 border border-emerald-600 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all text-center"
                >
                  Check Availability
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App ---

import { useParams } from 'react-router-dom';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const handleStorage = () => {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar user={user} onLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth mode="login" />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Auth mode="signup" />} />
          
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/planner" element={user ? <Planner user={user} /> : <Navigate to="/login" />} />
          <Route path="/destination/:id" element={user ? <DestinationDetail /> : <Navigate to="/login" />} />
          <Route path="/nearby/:id" element={user ? <NearbyAttractions /> : <Navigate to="/login" />} />
          <Route path="/accommodations/:id" element={user ? <Accommodations /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
