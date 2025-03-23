<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

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

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

            $filePath = __DIR__ . '/uploads/' . $file['file_path'];
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

            $filePath = __DIR__ . '/uploads/' . $file['file_path'];
            if (file_exists($filePath)) {
                if (!unlink($filePath)) {
                    throw new Exception('Failed to delete file from uploads');
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