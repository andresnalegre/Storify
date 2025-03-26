
# About Storify

**Storify** is a React project where I developed with React and PHP. The goal of this project is to create a simple file storage solution that works with MariaDB and makes it easy to store and download them.

---

## Features

- File Storage

---

## Technologies Used

- React
- PHP
- MariaDB

---

## Step 1: Clone the Repository

   - Open your terminal and clone the Storify repository:

     ```bash
     git clone https://github.com/andresnalegre/Storify
     ```
     

## Step 2: How to use the SafePass app

   - Navigate to the SafePass Folder:

     ```bash
     cd Storify
     ```
     
   - Run the project:

     ```bash
     npm start
     ```
     
   **The packege.json is already configured to set up the database and run the React project automatically. Just make sure all dependencies are installed.**


## Step 3:  Validating your data into storify at XAMPP
1. **Access MariaDB**:
   - Open a new terminal and run:

     ```bash
     /Applications/XAMPP/xamppfiles/bin/mysql -u root -p --socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock;
     ```
     
   - Alternatively, you can access phpMyAdmin:

     ```bash
     http://localhost/phpmyadmin
     ```
     
   **Make sure that XAMPP is running properly.**

2. **Select the Storify Database**:  
   - Select storify Database:
     
     ```sql
     USE storify;
     ```
     
3. **Analyze Stored Data**:  
   - Get the total number of stored files:  

     ```sql
     SELECT COUNT(*) AS total_files FROM files;
     ```
     
   - search all stored files:  

     ```sql
     SELECT * FROM files;
     ```
     
   - Count files by type:  

     ```sql
     SELECT type, COUNT(*) AS count FROM files GROUP BY type;
     ```
          
---

## License

This project is licensed under the [MIT License](LICENSE)

---

## Contributing

Contributions are welcome! If you have any improvements or new features you’d like to add, feel free to fork the repository and submit a pull request. Please ensure that your code follows the existing style and structure.

[![GitHub](https://img.shields.io/badge/Made%20by-Andres%20Nicolas%20Alegre-brightgreen)](https://github.com/andresnalegre)
