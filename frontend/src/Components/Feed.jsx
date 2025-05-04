import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Fetch posts from Reddit
  useEffect(() => {
    fetch('https://www.reddit.com/r/popular.json')
      .then((res) => res.json())
      .then((data) => {
        const extracted = data.data.children.map((item) => ({
          id: item.data.id,
          title: item.data.title,
          url: item.data.url,
          permalink: item.data.permalink,
          saved: false,
          reported: false,
        }));

        // Check localStorage for saved and reported posts and update the posts state
        const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || {};
        const reportedPosts = JSON.parse(localStorage.getItem('reportedPosts')) || {};

        const updatedPosts = extracted.map((post) => ({
          ...post,
          saved: savedPosts[post.id] || false,
          reported: reportedPosts[post.id] || false,
        }));

        setPosts(updatedPosts);
      })
      .catch((err) => {
        console.error('Reddit API Error:', err);
        setMessage('Error fetching posts. Please try again later.');
      });
  }, []);

  // Handle saving a post
  const handleSave = async (post) => {
    if (post.saved) {
      setToastMessage('Post already saved!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found. Please login again.');
        return;
      }

      await axios.post(
        'https://creatordashboardbackend-7px3.onrender.com/api/user/save-post',
        {
          postId: post.id,
          content: post.title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the saved status and store it in localStorage
      const updatedPosts = posts.map((p) =>
        p.id === post.id ? { ...p, saved: true } : p
      );
      setPosts(updatedPosts);
      localStorage.setItem('savedPosts', JSON.stringify(updatedPosts.reduce((acc, p) => {
        acc[p.id] = p.saved;
        return acc;
      }, {})));

      setToastMessage('Post saved successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Error saving post. Please try again.');
    }
  };

  // Handle reporting a post
  const handleReport = (postId) => {
    if (posts.find(post => post.id === postId).reported) {
      setToastMessage('Post already reported!');
      return;
    }

    setSelectedPostId(postId);
    setShowModal(true);
    setReportReason('');
  };

  // Submit the report
  const submitReport = async () => {
    if (!reportReason) {
      alert('Please provide a reason for reporting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found. Please login again.');
        return;
      }

      await axios.post(
        'https://creatordashboardbackend-7px3.onrender.com/api/user/report-post',
        { postId: selectedPostId, reason: reportReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the reported status and store it in localStorage
      const updatedPosts = posts.map((p) =>
        p.id === selectedPostId ? { ...p, reported: true } : p
      );
      setPosts(updatedPosts);
      localStorage.setItem('reportedPosts', JSON.stringify(updatedPosts.reduce((acc, p) => {
        acc[p.id] = p.reported;
        return acc;
      }, {})));

      setToastMessage('Post reported successfully!');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setMessage('Error reporting post. Please try again.');
    }
  };

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-white bg-purple-700 inline-block px-4 py-2 rounded">
          Reddit Feed
        </h2>

        {message && (
          <div
            className={`mb-6 px-4 py-2 rounded text-white font-medium ${message.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`}
          >
            {message}
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col justify-between transition duration-300 hover:shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-4 line-clamp-3">{post.title}</h3>
                <a
                  href={`https://reddit.com${post.permalink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 text-sm underline"
                >
                  View on Reddit
                </a>
              </div>

              <div className="mt-6 flex">
                <button
                  onClick={() => handleSave(post)}
                  className={`w-1/2 text-white text-sm font-medium py-2 rounded-l-md transition ${post.saved ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'}`}
                  disabled={post.saved}
                >
                  {post.saved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => handleReport(post.id)}
                  className={`w-1/2 text-white text-sm font-medium py-2 rounded-r-md transition ${post.reported ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
                  disabled={post.reported}
                >
                  {post.reported ? 'Reported' : 'Report'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white py-2 px-6 rounded-lg shadow-lg"
            style={{ zIndex: 999 }}
          >
            {toastMessage}
          </div>
        )}

        {/* Report Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Post</h3>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                placeholder="Reason for reporting..."
                rows="3"
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 text-white px-3 py-1 text-xs rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700"
                >
                  Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
