import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const PostGig = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please login with Google first to post a gig!");
      return;
    }

    try {
      const gigData = {
        ...formData,
        postedBy: auth.currentUser.uid
      };

      await axios.post('/api/gigs', gigData);
      alert("Gig posted successfully!");
      navigate('/');
    } catch (error) {
      console.error("Error posting gig:", error);
      alert("Failed to post gig. Check console.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg border border-gray-200">
      <h2 className="text-2xl font-extrabold text-[#1E2A4A] mb-6">Post a New Gig</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" name="title" required onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E2A4A]" placeholder="e.g. Fix kitchen tap" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" required onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E2A4A]" rows="3" placeholder="Describe the job..."></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category / Profession</label>
            <input
              type="text"
              name="category"
              required
              onChange={handleChange}
              className="mt-1 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E2A4A]"
              placeholder="e.g. Maths Tutor, Web Developer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget (₹)</label>
            <input type="number" name="budget" required onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E2A4A]" placeholder="500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" name="location" required onChange={handleChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1E2A4A]" placeholder="e.g. Mumbai" />
        </div>
        <button type="submit" className="w-full bg-[#1E2A4A] text-white p-2.5 rounded-md font-bold hover:bg-[#16203a] transition">
          Publish Gig
        </button>
      </form>
    </div>
  );
};

export default PostGig;