<?php
class Database {
    private $servername = "localhost";
    private $username = "root";
    private $password = "";
    private $dbname = "storify";
    private $conn;

    public function connect() {
        echo "Connecting to the XAMPP database server...\n";
        $this->conn = new mysqli($this->servername, $this->username, $this->password, $this->dbname, 3306, "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock");
        
        if ($this->conn->connect_error) {
            throw new Exception("Connection failed: " . $this->conn->connect_error);
        }
        
        echo "Successfully connected to the database '{$this->dbname}' on '{$this->servername}'!\n\n";
    }

    public function getConnection() {
        echo "Establishing database connection...\n\n";
        return $this->conn;
    }

    public function __destruct() {
        if ($this->conn instanceof mysqli && !$this->conn->connect_error) {
            echo "Closing the database connection...\n\n";
            $this->conn->close();
        }
    }
}
?>