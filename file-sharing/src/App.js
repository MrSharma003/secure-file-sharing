import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import FileUploadPage from './features/files/FileUploadPage';
import FileListPage from './features/files/FileListPage';
import './index.css';
import SignupPage from './features/auth/SignupPage';
import OTPPage from './features/auth/OTPPage';


const App = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/otp" element={<OTPPage/>} />
      <Route path="/upload" element={<FileUploadPage />} />
      <Route path="/files" element={<FileListPage />} />
    </Routes>
  </Router>
);

export default App;
