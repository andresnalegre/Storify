import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const enhanceFileData = (file) => ({
    ...file,
    icon: getFileIcon(file.type),
    formattedSize: formatFileSize(file.size),
  });

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/getFiles.php');
      const data = await response.json();
      
      if (data.success) {
        const uniqueFiles = Array.from(
          new Map(data.files.map(file => [file.id, enhanceFileData(file)])).values()
        );
        
        setFiles(uniqueFiles);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const addOrReplaceFile = async (fileData, replace = false, existingFileId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('path', fileData.urlPath);
      if (replace) {
        formData.append('replace', 'true');
        formData.append('existingFileId', existingFileId);
      }

      const response = await fetch('http://localhost:8000/getFiles.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const newFileData = enhanceFileData(data.file);
        
        setFiles(prevFiles => {
          const uniqueFiles = new Map(prevFiles.map(file => [file.id, file]));
          uniqueFiles.set(newFileData.id, newFileData);
          return Array.from(uniqueFiles.values());
        });
        
        return { success: true, file: newFileData };
      } else if (data.error === 'FILE_EXISTS') {
        return { 
          success: false, 
          error: 'FILE_EXISTS',
          existingFile: data.existingFile 
        };
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteFile = async (fileId) => {
    try {
      const response = await fetch('http://localhost:8000/getFiles.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: fileId })
      });

      const data = await response.json();

      if (data.success) {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        return { success: true };
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      return { success: false, error: err.message };
    }
  };

  const downloadFile = async (file) => {
    try {
      const response = await fetch(`http://localhost:8000/getFiles.php?download=true&id=${file.id}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (err) {
      console.error('Error downloading file:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    files,
    setFiles,
    loading,
    error,
    addFile: (fileData) => addOrReplaceFile(fileData),
    replaceFile: (fileData, existingFileId) => addOrReplaceFile(fileData, true, existingFileId),
    deleteFile,
    downloadFile,
    refreshFiles: fetchFiles
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

export default FileContext;