import React from "react";

const SavedPosts = ({ savedPosts, closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-[90%] max-w-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">Saved Posts</h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-red-600 text-lg font-bold transition px-2"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {savedPosts.length === 0 ? (
          <p className="text-gray-500 text-center">No saved posts available.</p>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post, index) => (
              <div
                key={index}
                className="p-6 bg-purple-50 border border-purple-100 rounded-lg shadow hover:shadow-lg transition duration-300"
              >
                {/* Display content as a card */}
                <p className="text-lg text-purple-800">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
