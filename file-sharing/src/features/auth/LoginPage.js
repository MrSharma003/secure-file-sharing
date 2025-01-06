import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './authSlice'; // Import the login thunk
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null); // State to hold error message
  const [loading, setLoading] = useState(false); // State for loading spinner
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const credentials = { email, password };
    setLoading(true); // Show loading spinner

    try {
      // Dispatch login thunk
      const resultAction = await dispatch(login(credentials));

      if (login.fulfilled.match(resultAction)) {
        // If OTP is required, the backend response will contain a message
        if (resultAction.payload.message === 'OTP has been sent to your email.') {
          // Navigate to OTP page if OTP is sent
          navigate('/otp', { state: { email } });
        } else {
          // Handle unexpected responses here, if necessary
          setErrorMessage('Unexpected response from the server.');
        }
      } else {
        // If login failed
        setErrorMessage(resultAction.error.message || 'Login failed');
      }
    } catch (error) {
      // Handle any other errors, such as network issues
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Login</h2>

        {/* Error message display */}
        {errorMessage && (
          <div className="text-red-500 mb-4 text-center">
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-600 font-medium mb-2">
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-600 font-medium mb-2">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <span className="loader"></span>
              Processing...
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Add a simple loading spinner */}
      <style jsx>{`
        .loader {
          border: 4px solid #f3f3f3; /* Light grey */
          border-top: 4px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
