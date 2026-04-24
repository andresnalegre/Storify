import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FileContext = createContext();

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_BIN_BYTES = 80 * 1024;
const WORKER_URL = process.env.REACT_APP_WORKER_URL || '';

const isConfigured = () => Boolean(WORKER_URL);

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
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const getBinSize = (files) => {
  const payload = JSON.stringify({ files: files.map(({ icon, formattedSize, ...rest }) => rest) });
  return new Blob([payload]).size;
};

const fetchFiles = async () => {
  const res = await fetch(`${WORKER_URL}/files`);
  if (!res.ok) throw new Error(`Worker fetch failed: ${res.status}`);
  const json = await res.json();
  const files = json?.record?.files;
  return Array.isArray(files) ? files : [];
};

const saveFiles = async (files) => {
  const payload = files.map(({ icon, formattedSize, ...rest }) => rest);
  const res = await fetch(`${WORKER_URL}/files`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: payload }),
  });
  if (!res.ok) throw new Error(`Worker save failed: ${res.status}`);
};

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configured, setConfigured] = useState(isConfigured());

  const refreshFiles = useCallback(async () => {
    if (!isConfigured()) {
      setConfigured(false);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const raw = await fetchFiles();
      const enhanced = raw.map(enhanceFileData);
      enhanced.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      setFiles(enhanced);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshFiles(); }, [refreshFiles]);

  useEffect(() => {
    if (loading || !isConfigured()) return;
    saveFiles(files).catch((err) => console.error('Failed to save:', err));
  }, [files, loading]);

  const addFile = async ({ file, urlPath }) => {
    try {
      if (!file) throw new Error('Please select a file.');
      if (file.size > MAX_FILE_SIZE) throw new Error('File exceeds the 2MB limit.');

      const normalizedPath = sanitizePath(urlPath);
      const existingFile = files.find(
        (item) => item.name === file.name && item.path === normalizedPath
      );
      if (existingFile) return { success: false, error: 'FILE_EXISTS', existingFile };

      const fileData = await readFileAsDataUrl(file);

      const newFilePlain = {
        id: generateId(),
        name: file.name,
        path: normalizedPath,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString(),
        fileData,
      };

      const projectedFiles = [newFilePlain, ...files];
      const binSize = getBinSize(projectedFiles);

      if (binSize > MAX_BIN_BYTES) {
        throw new Error(
          `Files must be under 80KB.`
        );
      }

      const newFile = enhanceFileData(newFilePlain);
      setFiles((prev) => [newFile, ...prev]);
      return { success: true, file: newFile };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message || 'Failed to save file.' };
    }
  };

  const replaceFile = async ({ file, urlPath }, existingFileId) => {
    try {
      if (!file) throw new Error('Please select a file.');
      if (file.size > MAX_FILE_SIZE) throw new Error('File exceeds the 2MB limit.');

      const normalizedPath = sanitizePath(urlPath);
      const fileData = await readFileAsDataUrl(file);

      const updatedFilePlain = {
        id: existingFileId || generateId(),
        name: file.name,
        path: normalizedPath,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString(),
        fileData,
      };

      const projectedFiles = [
        updatedFilePlain,
        ...files.filter((f) => f.id !== existingFileId),
      ];
      const binSize = getBinSize(projectedFiles);

      if (binSize > MAX_BIN_BYTES) {
        throw new Error(
          `Files must be under 80KB.`
        );
      }

      const updatedFile = enhanceFileData(updatedFilePlain);
      setFiles((prev) => {
        const filtered = prev.filter((item) => item.id !== existingFileId);
        return [updatedFile, ...filtered];
      });
      return { success: true, file: updatedFile };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message || 'Failed to replace file.' };
    }
  };

  const deleteFile = async (fileId) => {
    try {
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Failed to delete file.' };
    }
  };

  const downloadFile = async (file) => {
    try {
      if (!file?.fileData) throw new Error('File is not available for download.');
      const link = document.createElement('a');
      link.href = file.fileData;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message || 'Failed to download file.' };
    }
  };

  const clearAllFiles = async () => setFiles([]);

  const value = {
    files, setFiles, loading, error, configured,
    addFile, replaceFile, deleteFile, downloadFile,
    refreshFiles, clearAllFiles,
    maxFileSize: MAX_FILE_SIZE,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used within a FileProvider');
  return context;
};

export default FileContext;