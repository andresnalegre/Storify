<?php
class Database {
    private $servername = "localhost";
    private $username = "root";
    private $password = "";
    private $dbname = "storify";
    private $conn;

    public function connect() {
        $this->conn = new mysqli($this->servername, $this->username, $this->password, $this->dbname, 3306, "/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock");
        
        if ($this->conn->connect_error) {
            throw new Exception("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function getConnection() {
        return $this->conn;
    }

    public function __destruct() {
        if ($this->conn instanceof mysqli && !$this->conn->connect_error) {
            $this->conn->close();
        }
    }
}
?>