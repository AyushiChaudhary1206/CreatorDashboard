import React, { useEffect, useState } from "react";
import axios from "axios";
import Feed from "./Feed";  // Assuming FeedComponent is already created
import SavedPosts from "./SavedPosts";  // Component to show all saved posts in a modal

const UserDashboard = () => {
  const [credits, setCredits] = useState(0);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showSavedPosts, setShowSavedPosts] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No token found, skipping dashboard fetch");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCredits(res.data.credits);
        setSavedPosts(res.data.savedPosts);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };

    fetchDashboard();
  }, [savedPosts]);

  const handleSavedPostsClick = () => {
    setShowSavedPosts(true);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-md rounded-xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-white bg-purple-600 py-2 px-4 rounded-lg">
          Welcome back, {user?.username || 'User'}!
        </h1>

        {/* Credit Points and Saved Posts */}
        <div className="flex space-x-4">
          <div
            className="bg-purple-700 text-white py-1 px-3 rounded-lg shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out"
            onClick={handleSavedPostsClick}
          >
            <h3 className="text-sm font-medium">Saved Posts</h3>
            <p className="text-lg font-semibold">{savedPosts.length} Post(s)</p>
          </div>
          <div className="bg-purple-500 text-white py-1 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
            <h3 className="text-sm font-medium">Credits</h3>
            <p className="text-lg font-semibold">{credits}</p>
          </div>
        </div>
      </div>

      {/* Show Saved Posts Modal */}
      {showSavedPosts ? (
        <SavedPosts savedPosts={savedPosts} closeModal={() => setShowSavedPosts(false)} />
      ) : (
        <>
          {/* Feed Section */}
          <div>
            <Feed />
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
