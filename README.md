
# Storify

**Storify** is a React project where I showcase my skills with React and PHP. The goal of this project is to create a simple data storage solution that works with MariaDB and can be easily adapted for enterprise environments.

---

## Features

- Data Storage

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
     

## Step 2: Setting Up the Database

   **Validate the username and password**:
   - Open your terminal, navigate to the backend folder:

     ```bash
     Storify/backend/database.php
     ```

   - By default, the credentials are:

     ```bash
     $username = "root";
     $password = "admin";
     ```
     
   **If you already have a password set, update it in database.php**


## Step 3:  How to use the app

   - Navigate to the Storify Folder:

     ```bash
     cd Storify
     ```
     
   - Run the project:

     ```bash
     npm start
     ```
     
   **The packege.json is already configured to set up the database and run the React project automatically. Just make sure all dependencies are installed.**

## Step 4: Validating your data into storify at MariaDB
1. **Access MariaDB**: 

   - Open a new terminal and run:

     ```bash
     mysql -u root -p
     ```
 
   - Enter the Database password:

     ```text
     admin
     ```
     
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
