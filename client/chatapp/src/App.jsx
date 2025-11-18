import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';

function App() {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  }

  return (
    <>
      <Toaster position="top-center" gutter={8} toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={authUser ? <HomePage /> : <LoginPage />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <HomePage />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <HomePage />} />
            <Route path="/settings" element={authUser ? <SettingsPage /> : <LoginPage />} />
            <Route path="/profile" element={authUser ? <ProfilePage /> : <LoginPage />} />
          </Routes>

        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
