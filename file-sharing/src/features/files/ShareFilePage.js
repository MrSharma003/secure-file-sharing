import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { shareFile } from './fileSlice';

const ShareFilePage = ({ fileId }) => {
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState('view');
  const dispatch = useDispatch();

  const handleShare = (e) => {
    e.preventDefault();
    dispatch(shareFile({ fileId, data: { user_id: userId, permission } }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleShare}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Share File
        </h2>
        <div className="mb-4">
          <label
            htmlFor="user-id"
            className="block text-gray-600 font-medium mb-2"
          >
            User ID:
          </label>
          <input
            id="user-id"
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="permission"
            className="block text-gray-600 font-medium mb-2"
          >
            Permission:
          </label>
          <select
            id="permission"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="view">View</option>
            <option value="download">Download</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Share
        </button>
      </form>
    </div>
  );
};

export default ShareFilePage;
