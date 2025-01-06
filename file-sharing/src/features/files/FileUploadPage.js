import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFile } from './fileSlice';
import { Link } from 'react-router-dom';

const FileUploadPage = () => {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.files);

  const handleUpload = (e) => {
    e.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      dispatch(uploadFile(formData));
    }
  };

  useEffect(() => {
    if (status === 'succeeded') {
      alert('File uploaded successfully!');
      setFile(null); // Reset the file input after successful upload
    } else if (status === 'failed') {
      alert(`File upload failed: ${error}`);
    }
  }, [status, error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleUpload}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Upload File
        </h2>
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="block text-gray-600 font-medium mb-2"
          >
            Choose a file:
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Upload
        </button>
        <div className="mt-4 text-center">
          <Link
            to="/files"
            className="text-blue-500 hover:text-blue-700"
          >
            Go to File List
          </Link>
        </div>
      </form>
    </div>
  );
};

export default FileUploadPage;
