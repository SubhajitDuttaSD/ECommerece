const mysql = require("mysql2");
const connection = require("./connectSqlToServer");

const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "ecommerce",
});

const createTables = (dbConnection) => {
  const userTable = `
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    );
  `;

  const ordersTable = `
    CREATE TABLE IF NOT EXISTS Orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      amount DECIMAL(10,2) NOT NULL,
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    );
  `;

  const orderTablesTable = `
    CREATE TABLE IF NOT EXISTS Order_Tables (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      table_id INT,
      FOREIGN KEY (order_id) REFERENCES Orders(id)
    );
  `;

  const orderChairsTable = `
    CREATE TABLE IF NOT EXISTS Order_Chairs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      chair_id INT,
      FOREIGN KEY (order_id) REFERENCES Orders(id)
    );
  `;

  const orderTopsTable = `
    CREATE TABLE IF NOT EXISTS Order_Tops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      top_id INT,
      FOREIGN KEY (order_id) REFERENCES Orders(id)
    );
  `;

  dbConnection.query(userTable, (error, result) => {
    if (error) {
      console.error("Error creating Users table:", error);
      return;
    }
    console.log("Users table created");

    dbConnection.query(ordersTable, (error, result) => {
      if (error) {
        console.error("Error creating Orders table:", error);
        return;
      }
      console.log("Orders table created");

      dbConnection.query(orderTablesTable, (error, result) => {
        if (error) {
          console.error("Error creating Order_Tables table:", error);
          return;
        }
        console.log("Order_Tables table created");

        dbConnection.query(orderChairsTable, (error, result) => {
          if (error) {
            console.error("Error creating Order_Chairs table:", error);
            return;
          }
          console.log("Order_Chairs table created");

          dbConnection.query(orderTopsTable, (error, result) => {
            if (error) {
              console.error("Error creating Order_Tops table:", error);
              return;
            }
            console.log("Order_Tops table created");

            dbConnection.end();
          });
        });
      });
    });
  });
};

const createDatabaseAndTables = () => {
  connection.query("CREATE DATABASE IF NOT EXISTS ecommerce", (err, result) => {
    if (err) {
      console.error("Error creating database:", err);
      connection.end();
      return;
    }
    console.log("Database created or already exists");

    dbConnection.connect((err) => {
      if (err) {
        console.error("Error connecting to the ecommerce database:", err);
        return;
      }
      console.log("Connected to the ecommerce database");

      createTables(dbConnection);
    });
  });
};

module.exports = createDatabaseAndTables;
