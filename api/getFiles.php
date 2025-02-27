<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

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

function handleFileOperation($operation, $callback) {
    try {
        return $callback();
    } catch (Exception $e) {
        error_log("File operation error ($operation): " . $e->getMessage());
        throw new Exception("Failed to $operation file: " . $e->getMessage());
    }
}

function validateFile($file) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Invalid file upload');
    }

    if ($file['size'] > MAX_FILE_SIZE) {
        throw new Exception('File size exceeds maximum limit of 100MB');
    }

    if (!in_array($file['type'], ALLOWED_TYPES)) {
        throw new Exception('File type not allowed');
    }

    return true;
}

function createUploadDirectory() {
    if (!file_exists(UPLOAD_DIR)) {
        if (!mkdir(UPLOAD_DIR, 0777, true)) {
            throw new Exception('Failed to create upload directory');
        }
    }
}

try {
    $conn = new mysqli("localhost", "root", "admin", "storify");
    $conn->set_charset("utf8mb4");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            if (!isset($_FILES['file'])) {
                throw new Exception('No file uploaded');
            }

            $file = $_FILES['file'];
            validateFile($file);

            $name = $conn->real_escape_string($file['name']);
            $path = $conn->real_escape_string($_POST['path'] ?? '/');
            $size = $file['size'];
            $type = $conn->real_escape_string($file['type']);
            $replace = isset($_POST['replace']) ? filter_var($_POST['replace'], FILTER_VALIDATE_BOOLEAN) : false;

            $stmt = $conn->prepare("SELECT id, file_path FROM files WHERE name = ? AND path = ? FOR UPDATE");
            $stmt->bind_param("ss", $name, $path);
            $stmt->execute();
            $result = $stmt->get_result();
            $existingFile = $result->fetch_assoc();

            if ($existingFile && !$replace) {
                echo json_encode([
                    'success' => false,
                    'error' => 'FILE_EXISTS',
                    'message' => 'File already exists. Do you want to replace it?',
                    'existingFile' => [
                        'id' => $existingFile['id'],
                        'name' => $name,
                        'path' => $path
                    ]
                ]);
                exit;
            }

            createUploadDirectory();

            $fileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $name);
            $filePath = UPLOAD_DIR . $fileName;

            $conn->begin_transaction();

            try {
                handleFileOperation('move', function() use ($file, $filePath) {
                    return move_uploaded_file($file['tmp_name'], $filePath);
                });

                chmod($filePath, 0644);

                if ($existingFile) {
                    $oldFilePath = UPLOAD_DIR . $existingFile['file_path'];
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }

                    $stmt = $conn->prepare("UPDATE files SET size = ?, type = ?, file_path = ? WHERE id = ?");
                    $stmt->bind_param("issi", $size, $type, $fileName, $existingFile['id']);
                } else {
                    $stmt = $conn->prepare("INSERT INTO files (name, path, size, type, file_path) VALUES (?, ?, ?, ?, ?)");
                    $stmt->bind_param("ssiss", $name, $path, $size, $type, $fileName);
                }

                if (!$stmt->execute()) {
                    throw new Exception('Database error: ' . $stmt->error);
                }

                $fileId = $existingFile ? $existingFile['id'] : $stmt->insert_id;
                $conn->commit();

                echo json_encode([
                    'success' => true,
                    'id' => $fileId,
                    'message' => $existingFile ? 'File replaced successfully' : 'File uploaded successfully',
                    'file' => [
                        'id' => $fileId,
                        'name' => $name,
                        'path' => $path,
                        'size' => $size,
                        'type' => $type,
                        'filePath' => $fileName,
                        'uploadDate' => date('Y-m-d H:i:s')
                    ]
                ]);

            } catch (Exception $e) {
                $conn->rollback();
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                throw $e;
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['download']) && isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("SELECT * FROM files WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $file = $result->fetch_assoc();

            if (!$file) {
                throw new Exception('File not found');
            }

            $filePath = UPLOAD_DIR . $file['file_path'];
            if (!file_exists($filePath)) {
                throw new Exception('File not found on server');
            }

            header('Content-Type: ' . $file['type']);
            header('Content-Disposition: attachment; filename="' . $file['name'] . '"');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;
        } else {
            $result = $conn->query("SELECT * FROM files ORDER BY upload_date DESC");
            $files = [];

            while ($row = $result->fetch_assoc()) {
                $files[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'path' => $row['path'],
                    'size' => (int)$row['size'],
                    'type' => $row['type'],
                    'uploadDate' => $row['upload_date'],
                    'filePath' => $row['file_path']
                ];
            }

            echo json_encode([
                'success' => true,
                'files' => $files
            ]);
        }
    }

    else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('File ID not provided');
        }

        $id = intval($data['id']);
        $conn->begin_transaction();

        try {
            $stmt = $conn->prepare("SELECT file_path FROM files WHERE id = ? FOR UPDATE");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $file = $result->fetch_assoc();

            if (!$file) {
                throw new Exception('File not found');
            }

            $filePath = UPLOAD_DIR . $file['file_path'];
            if (file_exists($filePath)) {
                if (!unlink($filePath)) {
                    throw new Exception('Failed to delete physical file');
                }
            }

            $stmt = $conn->prepare("DELETE FROM files WHERE id = ?");
            $stmt->bind_param("i", $id);

            if (!$stmt->execute()) {
                throw new Exception('Failed to delete file from database');
            }

            $conn->commit();

            echo json_encode([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);

        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }
    }

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>