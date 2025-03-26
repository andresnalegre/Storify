<?php
require_once 'database.php';

try {
    echo "Connecting to the XAMPP server...\n";
    $conn = new mysqli("localhost", "root", "", "", 3306, "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock");

    if ($conn->connect_error) {
        throw new Exception("Error connecting to XAMPP:\n\n" . $conn->connect_error);
    }
    echo "Successfully connected to XAMPP!\n\n";

    echo "Setting character set to utf8mb4...\n";
    if (!$conn->set_charset("utf8mb4")) {
        throw new Exception("Failed to set character set to utf8mb4:" . $conn->error);
    }
    echo "Character set to utf8mb4 successfully!\n\n";

    echo "Creating database 'storify' if it does not exist...\n";
    $sql = "CREATE DATABASE IF NOT EXISTS storify CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
    if (!$conn->query($sql)) {
        throw new Exception("Failed to create database 'storify': " . $conn->error);
    }
    echo "Database 'storify' is created!\n\n";

    $conn->select_db("storify");

    echo "Checking 'files' table...\n";
    $result = $conn->query("SHOW TABLES LIKE 'files'");
    if ($result->num_rows == 0) {
        echo "'Files' table not found. Creating...\n";
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
        echo "Table 'files' created successfully.\n\n";
    } else {
        echo "Table 'files' already exists. Verifying integrity...\n";
        $expectedColumns = ['id', 'name', 'path', 'size', 'type', 'file_path', 'upload_date'];
        $result = $conn->query("DESCRIBE files");
        $existingColumns = [];

        while ($row = $result->fetch_assoc()) {
            $existingColumns[] = $row['Field'];
        }

        $missingColumns = array_diff($expectedColumns, $existingColumns);
        if (!empty($missingColumns)) {
            foreach ($missingColumns as $column) {
                echo "Missing columns found. Adding them now!\n";
                echo "Adding missing column '$column' to table 'files'...\n";
                $alterSql = "ALTER TABLE files ADD $column VARCHAR(255) NOT NULL";
                if (!$conn->query($alterSql)) {
                    throw new Exception("Failed to add '$column' to 'files' table: " . $conn->error);
                }
                echo "Column '$column' added successfully.\n";
            }
        } else {
            echo "All columns present in 'files' table!\n\n";
        }
    }

    echo "Database is OK and ready to GO!\n\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
        echo "Starting React!\n";
    }
}
?>