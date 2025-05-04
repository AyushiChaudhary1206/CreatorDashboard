import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Fetch Reddit posts and update their saved/reported status from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const redditResponse = await fetch('https://www.reddit.com/r/popular.json');
        const redditData = await redditResponse.json();

        const redditPosts = redditData.data.children.map((item) => ({
          id: item.data.id,
          title: item.data.title,
          url: item.data.url,
          permalink: item.data.permalink,
          saved: false,
          reported: false,
        }));

        const token = localStorage.getItem('token');
        if (!token) return setPosts(redditPosts);

        const [savedRes, reportedRes] = await Promise.all([
          axios.get('https://creatordashboardbackend-7px3.onrender.com/api/user/saved-posts', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://creatordashboardbackend-7px3.onrender.com/api/user/reports', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const savedPostIds = savedRes.data.map((p) => p.postId);
        const reportedPostIds = reportedRes.data.map((p) => p.postId);

        const mergedPosts = redditPosts.map((post) => ({
          ...post,
          saved: savedPostIds.includes(post.id),
          reported: reportedPostIds.includes(post.id),
        }));

        setPosts(mergedPosts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (post) => {
    if (post.saved) {
      setToastMessage('Post already saved!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToastMessage('Please login first!');
        return;
      }

      await axios.post(
        'https://creatordashboardbackend-7px3.onrender.com/api/user/save-post',
        {
          postId: post.id,
          content: post.title,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, saved: true } : p))
      );
      setToastMessage('Post saved successfully!');
    } catch (err) {
      console.error(err);
      setToastMessage('Error saving post.');
    }
  };

  const handleReport = (postId) => {
    const isAlreadyReported = posts.find((p) => p.id === postId)?.reported;
    if (isAlreadyReported) {
      setToastMessage('Post already reported!');
      return;
    }

    setSelectedPostId(postId);
    setReportReason('');
    setShowModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      setToastMessage('Please provide a reason.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToastMessage('Please login first!');
        return;
      }

      await axios.post(
        'https://creatordashboardbackend-7px3.onrender.com/api/user/report-post',
        {
          postId: selectedPostId,
          reason: reportReason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostId ? { ...p, reported: true } : p
        )
      );
      setToastMessage('Post reported successfully!');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setToastMessage('Error reporting post.');
    }
  };

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-white bg-purple-700 inline-block px-4 py-2 rounded">
          Reddit Feed
        </h2>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col justify-between transition duration-300 hover:shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
            >
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-4 line-clamp-3">
                  {post.title}
                </h3>
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
                  className={`w-1/2 text-white text-sm font-medium py-2 rounded-l-md transition ${
                    post.saved
                      ? 'bg-gray-400'
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                  disabled={post.saved}
                >
                  {post.saved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => handleReport(post.id)}
                  className={`w-1/2 text-white text-sm font-medium py-2 rounded-r-md transition ${
                    post.reported
                      ? 'bg-gray-400'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                  disabled={post.reported}
                >
                  {post.reported ? 'Reported' : 'Report'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Toast */}
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
