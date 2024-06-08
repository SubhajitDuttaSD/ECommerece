const express = require("express");
// const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./connectSqlToServer");
const createDatabaseAndTables = require("./databaseAndTables");

const app = express();

app.use(cors());
app.use(express.json());
createDatabaseAndTables();

app.get("/products", (request, response) => {
  const products = [
    {
      id: 1,
      name: "Lounge Chair",
      price: 2000,
      category: "Chairs",
    },
    {
      id: 2,
      name: "Dining Chair",
      price: 1800,
      category: "Chairs",
    },
    {
      id: 3,
      name: "Table1",
      price: 3000,
      category: "Table",
    },
    {
      id: 4,
      name: "Table2",
      price: 3200,
      category: "Table",
    },
    {
      id: 5,
      name: "Table3",
      price: 3100,
      category: "Table",
    },
    {
      id: 6,
      name: "Dining Top",
      price: 900,
      category: "Top",
    },
  ];

  response.json(products);
});

app.post("/checkout", (request, response) => {
  const { name, email, cart } = request.body;

  connection.beginTransaction((transactionError) => {
    if (transactionError) {
      console.log("Transaction error:", transactionError);
      return response.status(500).send("Error in transaction");
    }

    connection.query(
      "INSERT INTO Users (name,email) VALUES (?,?)",
      [name, email],
      (userInsertError, userInsertResult) => {
        if (userInsertError) {
          console.log("User insert error:", userInsertError);
          return connection.rollback(() => {
            response.status(500).send("Error inserting user");
          });
        }

        const orderId = userInsertResult.insertId;

        const insertOrderItems = (table, items) => {
          if (items.length === 0) {
            return Promise.resolve();
          }

          const values = items.map((item) => [orderId, item.id]);
          const sqlQuery = `INSERT INTO ${table} (order_id, ${table
            .toLowerCase()
            .slice(6)}_id) VALUES ?`;

          return new Promise((resolve, reject) => {
            connection.query(
              sqlQuery,
              [values],
              (itemInsertError, itemInsertResult) => {
                if (itemInsertError) {
                  console.log(`Error inserting ${table}:`, itemInsertError);
                  return reject(itemInsertError);
                }
                resolve(itemInsertResult);
              }
            );
          });
        };

        const chairs = cart.filter((item) => item.category === "Chairs");
        const tables = cart.filter((item) => item.category === "Table");
        const tops = cart.filter((item) => item.category === "Top");

        Promise.all([
          insertOrderItems("Order_Chairs", chairs),
          insertOrderItems("Order_Tables", tables),
          insertOrderItems("Order_Tops", tops),
        ])
          .then(() => {
            connection.commit((commitError) => {
              if (commitError) {
                console.log("Commit error:", commitError);
                return connection.rollback(() => {
                  response.status(500).send("Error committing transaction");
                });
              }
              response.send("Order placed successfully");
            });
          })
          .catch((promiseError) => {
            console.log("Promise error:", promiseError);
            connection.rollback(() => {
              response.status(500).send("Error in promise chain");
            });
          });
      }
    );
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
