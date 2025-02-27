import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FileProvider } from './context/FileContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';

function App() {
    return (
        <FileProvider>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={<FileUpload />} />
                    <Route path="/files" element={<FileList />} />
                </Routes>
            </div>
        </FileProvider>
    );
}

export default App;