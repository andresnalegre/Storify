import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FileContext = createContext();

const STORAGE_KEY = 'storify_files_v1';
const EXPIRY_KEY = 'storify_expiry_v1';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (fileType = '') => {
  const type = fileType.toLowerCase();

  if (type.includes('image')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('word') || type.includes('document')) return 'word';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return 'excel';
  if (type.includes('video')) return 'video';
  return 'file';
};

const enhanceFileData = (file) => ({
  ...file,
  icon: getFileIcon(file.type),
  formattedSize: formatFileSize(file.size),
});

const sanitizePath = (value = '/') => {
  const trimmed = value.trim() || '/';
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return normalized.replace(/\/+/g, '/');
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));

    reader.readAsDataURL(file);
  });

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const isStorageExpired = () => {
  try {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!expiry) return false;
    return Date.now() > parseInt(expiry, 10);
  } catch {
    return false;
  }
};

const initStorageExpiry = () => {
  try {
    if (!localStorage.getItem(EXPIRY_KEY)) {
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + ONE_YEAR_MS));
    }
  } catch {
    // silent
  }
};

const getStoredFiles = () => {
  try {
    if (isStorageExpired()) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return [];
  }
};

const saveStoredFiles = (files) => {
  const filesToStore = files.map(({ icon, formattedSize, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filesToStore));
};

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshFiles = useCallback(() => {
    try {
      initStorageExpiry();
      const storedFiles = getStoredFiles().map(enhanceFileData);
      storedFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      setFiles(storedFiles);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  useEffect(() => {
    if (!loading) {
      try {
        saveStoredFiles(files);
      } catch (err) {
        console.error('Failed to save files:', err);
      }
    }
  }, [files, loading]);

  const addFile = async ({ file, urlPath }) => {
    try {
      if (!file) {
        throw new Error('Please select a file.');
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File exceeds the 2MB limit for this demo.');
      }

      const normalizedPath = sanitizePath(urlPath);
      const existingFile = files.find(
        (item) => item.name === file.name && item.path === normalizedPath
      );

      if (existingFile) {
        return {
          success: false,
          error: 'FILE_EXISTS',
          existingFile,
        };
      }

      const fileData = await readFileAsDataUrl(file);

      const newFile = enhanceFileData({
        id: generateId(),
        name: file.name,
        path: normalizedPath,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString(),
        fileData,
      });

      setFiles((prevFiles) => [newFile, ...prevFiles]);

      return { success: true, file: newFile };
    } catch (err) {
      console.error('Failed to add file:', err);
      return {
        success: false,
        error: err.message || 'Failed to save file.',
      };
    }
  };

  const replaceFile = async ({ file, urlPath }, existingFileId) => {
    try {
      if (!file) {
        throw new Error('Please select a file.');
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File exceeds the 2MB limit for this demo.');
      }

      const normalizedPath = sanitizePath(urlPath);
      const fileData = await readFileAsDataUrl(file);

      const updatedFile = enhanceFileData({
        id: existingFileId || generateId(),
        name: file.name,
        path: normalizedPath,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString(),
        fileData,
      });

      setFiles((prevFiles) => {
        const filtered = prevFiles.filter((item) => item.id !== existingFileId);
        return [updatedFile, ...filtered];
      });

      return { success: true, file: updatedFile };
    } catch (err) {
      console.error('Failed to replace file:', err);
      return {
        success: false,
        error: err.message || 'Failed to replace file.',
      };
    }
  };

  const deleteFile = async (fileId) => {
    try {
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete file:', err);
      return {
        success: false,
        error: 'Failed to delete file.',
      };
    }
  };

  const downloadFile = async (file) => {
    try {
      if (!file?.fileData) {
        throw new Error('File is not available for download.');
      }

      const link = document.createElement('a');
      link.href = file.fileData;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true };
    } catch (err) {
      console.error('Failed to download file:', err);
      return {
        success: false,
        error: err.message || 'Failed to download file.',
      };
    }
  };

  const clearAllFiles = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    setFiles([]);
  };

  const value = {
    files,
    setFiles,
    loading,
    error,
    addFile,
    replaceFile,
    deleteFile,
    downloadFile,
    refreshFiles,
    clearAllFiles,
    maxFileSize: MAX_FILE_SIZE,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

export const useFiles = () => {
  const context = useContext(FileContext);

  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }

  return context;
};

export default FileContext;