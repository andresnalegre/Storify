import React, { createContext, useContext, useState, useEffect } from 'react';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem('storifyFiles');
    return savedFiles ? JSON.parse(savedFiles) : [];
  });

  useEffect(() => {
    localStorage.setItem('storifyFiles', JSON.stringify(files));
  }, [files]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('word')) return 'word';
    if (fileType.includes('excel')) return 'excel';
    if (fileType.includes('video')) return 'video';
    return 'file';
  };

  const addFile = (newFile) => {
    const fileData = {
      id: Date.now(),
      name: newFile.file.name,
      path: newFile.urlPath,
      size: formatFileSize(newFile.file.size),
      type: newFile.file.type,
      icon: getFileIcon(newFile.file.type),
      uploadDate: new Date().toISOString(),
      lastModified: newFile.file.lastModified,
      revision: 0,
      file: newFile.file,
    };

    setFiles(prevFiles => {
      const existingFileIndex = prevFiles.findIndex(f => f.path === newFile.urlPath);
      
      if (existingFileIndex !== -1) {
        const updatedFiles = [...prevFiles];
        fileData.revision = prevFiles[existingFileIndex].revision + 1;
        updatedFiles.unshift(fileData);
        return updatedFiles;
      }

      return [fileData, ...prevFiles];
    });
  };

  const deleteFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const getFileRevisions = (filePath) => {
    return files.filter(file => file.path === filePath)
      .sort((a, b) => b.revision - a.revision);
  };

  const downloadFile = async (file) => {
    try {
      const blob = new Blob([file.file], { type: file.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Download error:', error);
      return false;
    }
  };

  return (
    <FileContext.Provider 
      value={{ 
        files, 
        addFile, 
        deleteFile, 
        getFileRevisions,
        downloadFile,
        formatFileSize 
      }}
    >
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