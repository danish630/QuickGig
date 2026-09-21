import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Wrench, GraduationCap, Code, Car, Home as HomeIcon, Package, ArrowRight, Star, Users, Briefcase } from 'lucide-react';

const categoryIcons = {
  Plumbing: Wrench,
  Tutoring: GraduationCap,
  'Web Development': Code,
  Driving: Car,
  'Home Repair': HomeIcon,
  Delivery: Package,
};

const Home = () => {
  const [recentGigs, setRecentGigs] = useState([]);
  const [stats, setStats] = useState({ totalOpen: 0, totalGigs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentGigs = async () => {
      try {
        const response = await axios.get('/api/gigs');
        const open = response.data.filter(g => g.status === 'open');
        setStats({ totalOpen: open.length, totalGigs: response.data.length });
        setRecentGigs(open.slice(0, 3));
      } catch (error) {
        console.error("Error fetching gigs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentGigs();
  }, []);

  return (
    <div>
      {/* Hero — text only, no side panel */}
      <div className="py-16 max-w-2xl">
        <p className="text-sm font-semibold text-[#F5A524] mb-3">
          {stats.totalOpen > 0 ? `${stats.totalOpen} ${stats.totalOpen === 1 ? 'gig' : 'gigs'} live right now` : 'Local services, sorted fast'}
        </p>
        <h1 className="text-5xl font-extrabold leading-tight mb-6">
          <span className="text-[#1E2A4A]">Get local work done.</span>{' '}
          <span className="text-[#F5A524]">Or find work near you.</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Post a job in minutes, or browse gigs from people who need help nearby.
          Rated by the people who've actually worked with them.
        </p>
        <div className="flex gap-3">
          <Link
            to="/gigs"
            className="inline-flex items-center gap-2 bg-[#F5A524] text-[#1E2A4A] px-6 py-3 rounded-md font-bold hover:bg-[#e0951c] transition shadow-sm hover:shadow-md"
          >
            Find a gig <ArrowRight size={18} />
          </Link>
          <Link
            to="/post-gig"
            className="bg-[#1E2A4A] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#16203a] transition shadow-sm hover:shadow-md"
          >
            Post a job
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 py-10 border-y border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Briefcase size={18} className="text-[#B87A1A]" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1E2A4A]">{stats.totalGigs}</p>
            <p className="text-xs text-gray-500">Gigs posted</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Users size={18} className="text-[#B87A1A]" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1E2A4A]">{stats.totalOpen}</p>
            <p className="text-xs text-gray-500">Open right now</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Star size={18} className="text-[#B87A1A]" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#1E2A4A]">Rated</p>
            <p className="text-xs text-gray-500">By real clients & workers</p>
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 py-8 border-b border-gray-200">
        {Object.entries(categoryIcons).map(([cat, Icon]) => (
          <Link
            key={cat}
            to={`/gigs?category=${encodeURIComponent(cat)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:border-[#1E2A4A] hover:text-[#1E2A4A] transition"
          >
            <Icon size={16} /> {cat}
          </Link>
        ))}
      </div>

      {/* Recent gigs */}
      <div className="py-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-[#1E2A4A]">Recently posted</h2>
          <Link to="/gigs" className="text-sm font-medium text-[#1E2A4A] hover:underline flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : recentGigs.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center">
            <p className="text-gray-500 mb-3">No gigs posted yet.</p>
            <Link to="/post-gig" className="text-[#1E2A4A] font-medium hover:underline">
              Be the first to post one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentGigs.map((gig) => {
              const Icon = categoryIcons[gig.category] || Briefcase;
              return (
                <Link
                  to="/gigs"
                  key={gig._id}
                  className="block bg-white p-5 rounded-xl border border-gray-200 hover:border-[#1E2A4A] hover:shadow-md transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                    <Icon size={18} className="text-[#B87A1A]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E2A4A]">{gig.title}</h3>
                  <p className="text-gray-600 mt-2 text-sm line-clamp-2">{gig.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[#1E2A4A] font-bold">₹{gig.budget}</span>
                    <span className="text-gray-400 text-xs">{gig.location}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;