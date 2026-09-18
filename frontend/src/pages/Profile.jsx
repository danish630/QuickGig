import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ChatBox from '../components/ChatBox';

const Profile = () => {
  const { user } = useAuth();
  const [myGigs, setMyGigs] = useState([]);
  const [allGigs, setAllGigs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGigId, setExpandedGigId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [reviewedGigIds, setReviewedGigIds] = useState([]);
  const [showReviewFor, setShowReviewFor] = useState(null);
  const [acceptedWorkerMap, setAcceptedWorkerMap] = useState({});
  const [applicantRatings, setApplicantRatings] = useState({});
  const [openChatBookingId, setOpenChatBookingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allGigsRes = await axios.get('/api/gigs');
        setAllGigs(allGigsRes.data);

        const postedByMe = allGigsRes.data.filter(gig => gig.postedBy === user.uid);
        setMyGigs(postedByMe);

        const applicationsRes = await axios.get(`/api/bookings/professional/${user.uid}`);
        setMyApplications(applicationsRes.data);

        const reviewsRes = await axios.get(`/api/reviews/by/${user.uid}`);
        setReviewedGigIds(reviewsRes.data.map(r => r.gigId));
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.uid]);

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm("Are you sure you want to delete this gig?")) return;
    try {
      await axios.delete(`/api/gigs/${gigId}`, { data: { userId: user.uid } });
      setMyGigs(myGigs.filter(gig => gig._id !== gigId));
    } catch (error) {
      console.error("Error deleting gig:", error);
      alert("Failed to delete gig.");
    }
  };

  const handleViewApplicants = async (gigId) => {
    if (expandedGigId === gigId) {
      setExpandedGigId(null);
      return;
    }

    setExpandedGigId(gigId);
    setApplicantsLoading(true);
    try {
      const res = await axios.get(`/api/bookings/gig/${gigId}`);
      setApplicants(res.data);

      const uniqueApplicantIds = [...new Set(res.data.map(a => a.professionalId))];
      const ratingPromises = uniqueApplicantIds.map(id =>
        axios.get(`/api/reviews/user/${id}/average`).then(r => ({ id, data: r.data }))
      );
      const ratingResults = await Promise.all(ratingPromises);
      const ratingsMap = {};
      ratingResults.forEach(({ id, data }) => { ratingsMap[id] = data; });
      setApplicantRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleApprove = async (bookingId, gigId) => {
    if (!window.confirm("Approve this applicant? Others will be automatically rejected.")) return;
    try {
      await axios.patch(`/api/bookings/${bookingId}/approve`);
      alert("Applicant approved!");
      setMyGigs(myGigs.map(gig => gig._id === gigId ? { ...gig, status: 'booked' } : gig));
      const res = await axios.get(`/api/bookings/gig/${gigId}`);
      setApplicants(res.data);
    } catch (error) {
      console.error("Error approving applicant:", error);
      alert("Failed to approve.");
    }
  };

  const handleMarkComplete = async (gigId) => {
    if (!window.confirm("Mark this gig as completed?")) return;
    try {
      await axios.patch(`/api/gigs/${gigId}/complete`, { userId: user.uid });
      setMyGigs(myGigs.map(gig => gig._id === gigId ? { ...gig, status: 'completed' } : gig));
    } catch (error) {
      console.error("Error marking complete:", error);
      alert("Failed to mark as completed.");
    }
  };

  const handleRateProfessional = async (gigId) => {
    if (showReviewFor === gigId) {
      setShowReviewFor(null);
      return;
    }
    try {
      const res = await axios.get(`/api/bookings/gig/${gigId}`);
      const accepted = res.data.find(b => b.status === 'accepted');
      if (accepted) {
        setAcceptedWorkerMap({ ...acceptedWorkerMap, [gigId]: accepted.professionalId });
        setShowReviewFor(gigId);
      }
    } catch (error) {
      console.error("Error finding accepted worker:", error);
    }
  };

  const handleReviewSubmitted = (gigId) => {
    setReviewedGigIds([...reviewedGigIds, gigId]);
    setShowReviewFor(null);
    alert("Review submitted!");
  };

  const handleWithdraw = async (bookingId) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      await axios.delete(`/api/bookings/${bookingId}`, {
        data: { userId: user.uid }
      });
      setMyApplications(myApplications.filter(b => b._id !== bookingId));
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert(error.response?.data?.message || "Failed to withdraw.");
    }
  };

  if (loading) return <div className="p-4 text-center mt-10 text-gray-500">Loading profile...</div>;

  return (
    <div className="mt-10 space-y-12">
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-16 h-16 rounded-full border border-gray-200 object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#1E2A4A] text-white flex items-center justify-center text-xl font-semibold">
            {user.displayName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E2A4A]">{user.displayName}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>

      {/* My Posted Gigs */}
      <div>
        <h2 className="text-xl font-bold text-[#1E2A4A] mb-4">My Posted Gigs</h2>
        {myGigs.length === 0 ? (
          <p className="text-gray-500">You haven't posted any gigs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myGigs.map((gig) => (
              <div key={gig._id} className="bg-white p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-[#1E2A4A]">{gig.title}</h3>
                <p className="text-gray-600 mt-1 text-sm line-clamp-2">{gig.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-[#1E2A4A] font-bold">₹{gig.budget}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{gig.status}</span>
                </div>

                {gig.status !== 'completed' && (
                  <button
                    onClick={() => handleViewApplicants(gig._id)}
                    className="mt-4 w-full bg-gray-100 text-[#1E2A4A] py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                  >
                    {expandedGigId === gig._id ? 'Hide Applicants' : 'View Applicants'}
                  </button>
                )}

                {expandedGigId === gig._id && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                    {applicantsLoading ? (
                      <p className="text-xs text-gray-400">Loading applicants...</p>
                    ) : applicants.length === 0 ? (
                      <p className="text-xs text-gray-400">No applicants yet.</p>
                    ) : (
                      applicants.map((applicant) => {
                        const workerRating = applicantRatings[applicant.professionalId];
                        return (
                          <div key={applicant._id} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-800">{applicant.professionalName}</p>
                                {workerRating && workerRating.average && (
                                  <p className="text-xs text-gray-500">⭐ {workerRating.average} ({workerRating.count})</p>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  applicant.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                  applicant.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-50 text-[#B87A1A]'
                                }`}>
                                  {applicant.status}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setOpenChatBookingId(openChatBookingId === applicant._id ? null : applicant._id)}
                                  className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-300"
                                >
                                  {openChatBookingId === applicant._id ? 'Close' : 'Chat'}
                                </button>
                                {applicant.status === 'pending' && (
                                  <button
                                    onClick={() => handleApprove(applicant._id, gig._id)}
                                    className="bg-[#1E2A4A] text-white text-xs px-3 py-1 rounded hover:bg-[#16203a]"
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                            </div>

                            {openChatBookingId === applicant._id && (
                              <ChatBox
                                gigId={gig._id}
                                otherUserId={applicant.professionalId}
                                onClose={() => setOpenChatBookingId(null)}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {gig.status === 'booked' && (
                  <button
                    onClick={() => handleMarkComplete(gig._id)}
                    className="mt-3 w-full bg-[#1E2A4A] text-white py-2 rounded-md text-sm font-medium hover:bg-[#16203a] transition"
                  >
                    Mark as Completed
                  </button>
                )}

                {gig.status === 'completed' && !reviewedGigIds.includes(gig._id) && (
                  <button
                    onClick={() => handleRateProfessional(gig._id)}
                    className="mt-3 w-full bg-amber-50 text-[#B87A1A] py-2 rounded-md text-sm font-medium hover:bg-amber-100 transition"
                  >
                    {showReviewFor === gig._id ? 'Cancel' : 'Rate Professional'}
                  </button>
                )}

                {gig.status === 'completed' && reviewedGigIds.includes(gig._id) && (
                  <p className="mt-3 text-xs text-gray-400 italic text-center">Review submitted</p>
                )}

                {showReviewFor === gig._id && acceptedWorkerMap[gig._id] && (
                  <ReviewForm
                    gigId={gig._id}
                    revieweeId={acceptedWorkerMap[gig._id]}
                    onSubmitted={() => handleReviewSubmitted(gig._id)}
                  />
                )}

                <button
                  onClick={() => handleDeleteGig(gig._id)}
                  className="mt-3 w-full bg-white text-red-500 border border-red-100 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Applications */}
      <div>
        <h2 className="text-xl font-bold text-[#1E2A4A] mb-4">My Applications</h2>
        {myApplications.length === 0 ? (
          <p className="text-gray-500">You haven't applied to any gigs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myApplications.map((booking) => {
              const gigDetails = allGigs.find(g => g._id === booking.gigId);
              const canReview = booking.status === 'accepted' && gigDetails?.status === 'completed' && !reviewedGigIds.includes(booking.gigId);
              const alreadyReviewed = reviewedGigIds.includes(booking.gigId);
              const canWithdraw = booking.status === 'pending' &&
                (Date.now() - new Date(booking.createdAt).getTime() < 60 * 60 * 1000);

              return (
                <div key={booking._id} className="bg-white p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-[#1E2A4A]">
                    {gigDetails ? gigDetails.title : 'Gig no longer available'}
                  </h3>
                  {gigDetails && (
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">{gigDetails.description}</p>
                  )}
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${
                    booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-50 text-[#B87A1A]'
                  }`}>
                    {booking.status}
                  </span>

                  {canWithdraw && (
                    <button
                      onClick={() => handleWithdraw(booking._id)}
                      className="mt-3 w-full bg-gray-100 text-gray-600 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Withdraw Application
                    </button>
                  )}

                  {canReview && (
                    <button
                      onClick={() => setShowReviewFor(showReviewFor === booking._id ? null : booking._id)}
                      className="mt-3 w-full bg-amber-50 text-[#B87A1A] py-2 rounded-md text-sm font-medium hover:bg-amber-100 transition"
                    >
                      {showReviewFor === booking._id ? 'Cancel' : 'Rate Client'}
                    </button>
                  )}

                  {alreadyReviewed && (
                    <p className="mt-3 text-xs text-gray-400 italic">Review submitted</p>
                  )}

                  {showReviewFor === booking._id && gigDetails && (
                    <ReviewForm
                      gigId={booking.gigId}
                      revieweeId={gigDetails.postedBy}
                      onSubmitted={() => handleReviewSubmitted(booking.gigId)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;