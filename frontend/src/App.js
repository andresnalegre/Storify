import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Dashboard';
import Navbar from './components/Navbar';
import FileManager from './components/FileManager';
import FileUpload from './components/FileUpload';
import { FileProvider } from './context/FileContext';
import About from './components/About';
import Footer from './components/Footer';

function App() {
    return (
        <FileProvider>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<FileUpload />} />
                    <Route path="/files" element={<FileManager />} />
                    <Route path="/about" element={<About />} />
                </Routes>
                <Footer />
            </div>
        </FileProvider>
    );
}

export default App;