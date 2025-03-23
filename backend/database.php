<?php
class Database {
    private $servername = "localhost";
    private $username = "root";
    private $password = "admin";
    private $dbname = "storify";
    private $conn;

    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const UPLOAD_DIR = __DIR__ . '/uploads/';
    const ALLOWED_TYPES = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];

    public function connect() {
        $this->conn = new mysqli($this->servername, $this->username, $this->password, $this->dbname);
        if ($this->conn->connect_error) {
            throw new Exception("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function getConnection() {
        return $this->conn;
    }

    public function uploadFile($file, $path, $replace = false) {
        $this->validateFile($file);
        $name = $this->conn->real_escape_string($file['name']);
        $path = $this->conn->real_escape_string($path ?? '/');
        $size = $file['size'];
        $type = $this->conn->real_escape_string($file['type']);

        $this->createUploadDirectory();

        $fileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $name);
        $filePath = self::UPLOAD_DIR . $fileName;

        $this->conn->begin_transaction();

        $stmt = $this->conn->prepare("SELECT id, file_path FROM files WHERE name = ? AND path = ? FOR UPDATE");
        $stmt->bind_param("ss", $name, $path);
        $stmt->execute();
        $result = $stmt->get_result();
        $existingFile = $result->fetch_assoc();

        if ($existingFile && !$replace) {
            return [
                'success' => false,
                'error' => 'FILE_EXISTS',
                'message' => 'The file already exists. Would you like to replace it?',
                'existingFile' => [
                    'id' => $existingFile['id'],
                    'name' => $name,
                    'path' => $path
                ]
            ];
        }

        move_uploaded_file($file['tmp_name'], $filePath);
        chmod($filePath, 0644);

        if ($existingFile) {
            $oldFilePath = self::UPLOAD_DIR . $existingFile['file_path'];
            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }

            $stmt = $this->conn->prepare("UPDATE files SET size = ?, type = ?, file_path = ? WHERE id = ?");
            $stmt->bind_param("issi", $size, $type, $fileName, $existingFile['id']);
        } else {
            $stmt = $this->conn->prepare("INSERT INTO files (name, path, size, type, file_path) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssiss", $name, $path, $size, $type, $fileName);
        }

        if (!$stmt->execute()) {
            throw new Exception('Database error: ' . $stmt->error);
        }

        $fileId = $existingFile ? $existingFile['id'] : $stmt->insert_id;
        $this->conn->commit();

        return [
            'success' => true,
            'id' => $fileId,
            'message' => $existingFile ? 'The file was successfully replaced!' : 'The file was uploaded successfully!',
            'file' => [
                'id' => $fileId,
                'name' => $name,
                'path' => $path,
                'size' => $size,
                'type' => $type,
                'filePath' => $fileName,
                'uploadDate' => date('Y-m-d H:i:s')
            ]
        ];
    }

    private function validateFile($file) {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Invalid file upload');
        }

        if ($file['size'] > self::MAX_FILE_SIZE) {
            throw new Exception('The file size exceeds the maximum limit of 100MB. Please choose a smaller file.');
        }

        if (!in_array($file['type'], self::ALLOWED_TYPES)) {
            throw new Exception('File type not allowed');
        }
    }

    private function createUploadDirectory() {
        if (!file_exists(self::UPLOAD_DIR)) {
            if (!mkdir(self::UPLOAD_DIR, 0777, true)) {
                throw new Exception('Unable to create the upload directory. Please check permissions and try again.');
            }
        }
    }

    public function __destruct() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
?>