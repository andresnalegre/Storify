import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Dashboard';
import Navbar from './components/Navbar';
import FileManager from './components/FileManager';
import FileUpload from './components/FileUpload';
import { FileProvider, useFiles } from './context/FileContext';
import About from './components/About';
import Footer from './components/Footer';
import SetupBanner from './components/SetupBanner';

// Inner wrapper so we can access FileContext
const AppRoutes = () => {
  const { configured } = useFiles();

  if (!configured) {
    return <SetupBanner />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<FileUpload />} />
        <Route path="/files" element={<FileManager />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </>
  );
};

function App() {
  return (
    <FileProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </FileProvider>
  );
}

export default App;