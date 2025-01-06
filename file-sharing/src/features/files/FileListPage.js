import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { shareFile, fetchFiles, generateSecureLink, downloadFile } from './fileSlice';
import { Link } from 'react-router-dom';

const FileListPage = () => {
  const dispatch = useDispatch();
  const { files, secureLink } = useSelector((state) => state.files);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [secureLinkFileId, setSecureLinkFileId] = useState(null);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const handleShare = (e) => {
    e.preventDefault();
    dispatch(shareFile({ fileId: selectedFileId, data: { email, permission } }));
    setSelectedFileId(null);
    setEmail('');
  };

  const handleGenerateSecureLink = (fileId) => {
    dispatch(generateSecureLink(fileId));
    setSecureLinkFileId(fileId);
  };

  const handleCopyToClipboard = () => {
    if (secureLink) {
      navigator.clipboard.writeText(secureLink);
      alert('Secure link copied to clipboard!');
    }
  };

  const handleDownload = (fileId) => {
    dispatch(downloadFile(fileId));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Your Files</h2>
        <ul className="divide-y divide-gray-200">
          {files.map((file, index) => (
            <li key={index} className="py-4 px-6 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">{file.title}</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedFileId(file.file_id)}
                    className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleGenerateSecureLink(file.file_id)}
                    className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    Generate Secure Link
                  </button>
                  <button
                    onClick={() => handleDownload(file.file_id)}
                    className="bg-gray-500 text-white py-1 px-3 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Download
                  </button>
                </div>
              </div>
              {secureLinkFileId === file.file_id && secureLink && (
                <div className="mt-2 flex items-center">
                  <span className="text-gray-600">Secure Link: {secureLink}</span>
                  <button
                    onClick={handleCopyToClipboard}
                    className="ml-4 bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {selectedFileId && (
          <div className="mt-6 p-6 bg-gray-50 border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Share File (ID: {selectedFileId})
            </h3>
            <form onSubmit={handleShare}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-600 font-medium mb-2">
                  Recipient Email:
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter recipient's email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="permission" className="block text-gray-600 font-medium mb-2">
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
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedFileId(null)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="mt-4 text-center">
          <Link to="/upload" className="text-blue-500 hover:text-blue-700">
            Go to Upload Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FileListPage;
