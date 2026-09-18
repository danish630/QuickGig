import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';

const Gigs = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';

  const [gigs, setGigs] = useState([]);
  const [myBookingGigIds, setMyBookingGigIds] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');
  const [openChatGigId, setOpenChatGigId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gigsRes = await axios.get('/api/gigs');
        const openGigsData = gigsRes.data.filter(gig => gig.status === 'open');
        setGigs(gigsRes.data);

        const bookingsRes = await axios.get(`/api/bookings/professional/${user.uid}`);
        const appliedIds = bookingsRes.data.map(booking => booking.gigId);
        setMyBookingGigIds(appliedIds);

        const uniquePosters = [...new Set(openGigsData.map(gig => gig.postedBy))];
        const ratingPromises = uniquePosters.map(posterId =>
          axios.get(`/api/reviews/user/${posterId}/average`).then(res => ({ posterId, data: res.data }))
        );
        const ratingResults = await Promise.all(ratingPromises);

        const ratingsMap = {};
        ratingResults.forEach(({ posterId, data }) => {
          ratingsMap[posterId] = data;
        });
        setRatings(ratingsMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.uid]);

  const handleApply = async (gigId) => {
    try {
      await axios.post('/api/bookings', {
        gigId,
        professionalId: user.uid,
        professionalName: user.displayName
      });
      setMyBookingGigIds([...myBookingGigIds, gigId]);
      alert("Applied successfully!");
    } catch (error) {
      console.error("Error applying:", error);
      alert(error.response?.data?.message || "Failed to apply.");
    }
  };

  const openGigs = gigs.filter(gig =>
    gig.status === 'open' &&
    gig.location.toLowerCase().includes(locationFilter.toLowerCase()) &&
    (categoryFromUrl === '' || gig.category.toLowerCase() === categoryFromUrl.toLowerCase())
  );

  if (loading) return <div className="p-4 text-center mt-10 text-gray-500">Loading gigs...</div>;

  return (
    <div className="mt-10">
      <h1 className="text-3xl font-extrabold text-[#1E2A4A] mb-6">
        {categoryFromUrl ? `${categoryFromUrl} Gigs` : 'Explore All Available Gigs'}
      </h1>

      <div className="mb-8">
        <input
          type="text"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          placeholder="Filter by location..."
          className="w-full md:w-64 p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#1E2A4A]"
        />
      </div>

      {openGigs.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
          No gigs available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {openGigs.map((gig) => {
            const isOwnGig = gig.postedBy === user.uid;
            const alreadyApplied = myBookingGigIds.includes(gig._id);
            const clientRating = ratings[gig.postedBy];

            return (
              <div key={gig._id} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-[#1E2A4A] transition">
                <h2 className="text-xl font-semibold text-[#1E2A4A]">{gig.title}</h2>
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{gig.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[#1E2A4A] font-bold">₹{gig.budget}</span>
                  <span className="bg-amber-50 text-[#B87A1A] text-xs px-2 py-1 rounded-full font-medium">{gig.category}</span>
                </div>
                <p className="text-xs text-gray-400 mt-3">Location: {gig.location}</p>

                {clientRating && clientRating.average && (
                  <p className="text-xs text-gray-500 mt-1">
                    ⭐ {clientRating.average} ({clientRating.count} review{clientRating.count !== 1 ? 's' : ''}) — Client
                  </p>
                )}

                {isOwnGig ? (
                  <p className="mt-4 text-xs text-gray-400 italic">This is your gig</p>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setOpenChatGigId(openChatGigId === gig._id ? null : gig._id)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                    >
                      {openChatGigId === gig._id ? 'Close Chat' : 'Chat'}
                    </button>
                    {alreadyApplied ? (
                      <button disabled className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-md text-sm font-medium">
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(gig._id)}
                        className="flex-1 bg-[#1E2A4A] text-white py-2 rounded-md text-sm font-medium hover:bg-[#16203a] transition"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                )}

                {openChatGigId === gig._id && (
                  <ChatBox
                    gigId={gig._id}
                    otherUserId={gig.postedBy}
                    onClose={() => setOpenChatGigId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Gigs;