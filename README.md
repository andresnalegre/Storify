
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

## How to use the app

1. **Clone the Project**:
   - Open your terminal, go to the folder where you want to save the project, and run:

     ```bash
     git clone https://github.com/andresnalegre/Storify
     ```
     
2. **Go to the Project Folder**:
   - Change to the project folder:

     ```bash
     cd Storify
     ```
     
3. **Run the Project**:
   - Run the project with:

     ```bash
     npm start
     ```

## How to Access MariaDB

1. **Open Another Terminal**:
   - Inside the project folder, run:

     ```bash
     mysql -u root -p
     ```

1. **Log in to MariaDB**:  
   - Enter the password:

     ```text
     admin
     ```
     
2. **Select the Storify Database**:  

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
