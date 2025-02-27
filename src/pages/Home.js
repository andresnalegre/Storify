import React from 'react';
import { Link } from 'react-router-dom';
import { CloudUpload } from '@mui/icons-material';
import '../styles/theme.css';

const Home = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">
          Welcome to Storify
        </h1>
        
        <h2 className="hero-subtitle">
          Upload, organize and access your files from anywhere.
        </h2>

        <Link to="/upload" className="upload-link">
          <button className="upload-button">
            <CloudUpload />
            Start Uploading
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;