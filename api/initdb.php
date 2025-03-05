<?php
$servername = "localhost";
$username = "root";
$password = "admin";
$dbname = "storify";

try {
    $conn = new mysqli($servername, $username, $password);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $sql = "CREATE DATABASE IF NOT EXISTS $dbname";
    if (!$conn->query($sql)) {
        throw new Exception("Error creating database: " . $conn->error);
    }

    $conn->select_db($dbname);

    $sql = "CREATE TABLE IF NOT EXISTS files (
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

    echo "Database and table initialized successfully.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
} finally {
    $conn->close();
}
?>