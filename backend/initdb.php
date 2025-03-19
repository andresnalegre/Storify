<?php
require_once 'database.php';

$database = new Database();

try {
    $conn = new mysqli("localhost", "root", "admin");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $sql = "CREATE DATABASE IF NOT EXISTS storify";
    if (!$conn->query($sql)) {
        throw new Exception("Error creating database: " . $conn->error);
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
        )";

        if (!$conn->query($sql)) {
            throw new Exception("Error creating table: " . $conn->error);
        }

        echo "Database and table initialized successfully.\n";
    } else {
        $expectedColumns = ['id', 'name', 'path', 'size', 'type', 'file_path', 'upload_date'];
        $result = $conn->query("DESCRIBE files");
        $existingColumns = [];

        while ($row = $result->fetch_assoc()) {
            $existingColumns[] = $row['Field'];
        }

        $missingColumns = array_diff($expectedColumns, $existingColumns);
        if (!empty($missingColumns)) {
            foreach ($missingColumns as $column) {
                $alterSql = "ALTER TABLE files ADD $column VARCHAR(255) NOT NULL";
                if (!$conn->query($alterSql)) {
                    throw new Exception("Error adding column $column: " . $conn->error);
                }
            }
            echo "Missing columns added to the 'files' table.\n";
        } else {
            echo "Database is OK.\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
} finally {
    $conn->close();
}
?>