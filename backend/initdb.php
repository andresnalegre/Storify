<?php
require_once 'database.php';

try {
    $conn = new mysqli("localhost", "root", "", "", 3306, "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    if (!$conn->set_charset("utf8mb4")) {
        throw new Exception("Failed to set character set: " . $conn->error);
    }

    $sql = "CREATE DATABASE IF NOT EXISTS storify CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
    if (!$conn->query($sql)) {
        throw new Exception("Failed to create database: " . $conn->error);
    }

    $conn->select_db("storify");

    $result = $conn->query("SHOW TABLES LIKE 'files'");
    if ($result->num_rows == 0) {
        $sql = "CREATE TABLE files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            path VARCHAR(255) NOT NULL,
            size INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_name_path (name, path)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";

        if (!$conn->query($sql)) {
            throw new Exception("Failed to create table 'files': " . $conn->error);
        }
    } else {
        $expectedColumns = ['id', 'name', 'path', 'size', 'type', 'file_path', 'upload_date'];
        $result          = $conn->query("DESCRIBE files");
        $existingColumns = [];

        while ($row = $result->fetch_assoc()) {
            $existingColumns[] = $row['Field'];
        }

        $missingColumns = array_diff($expectedColumns, $existingColumns);
        if (!empty($missingColumns)) {
            foreach ($missingColumns as $column) {
                $alterSql = "ALTER TABLE files ADD $column VARCHAR(255) NOT NULL";
                if (!$conn->query($alterSql)) {
                    throw new Exception("Failed to add column '$column': " . $conn->error);
                }
            }
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}
?>