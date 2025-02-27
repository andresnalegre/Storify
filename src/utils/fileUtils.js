export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('word')) return 'word';
  if (fileType.includes('excel')) return 'excel';
  if (fileType.includes('video')) return 'video';
  return 'file';
};

export const downloadFile = async (file) => {
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