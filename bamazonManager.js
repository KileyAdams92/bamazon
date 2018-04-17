var inquirer = require("inquirer");
var mysql = require("mysql");
var cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  // begin running application once connection has been made
  runApplication();
});

function runApplication() {
  listOptions();
}

function listOptions() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "menuOptions",
        message: "What task are you trying to complete?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ]
      }
    ])
    .then(function(answers) {
      switch (answers.menuOptions) {
        case "View Products for Sale":
          return productsForSale();

        case "View Low Inventory":
          return lowInventory();

        case "Add to Inventory":
          return addToCurrent();

        case "Add New Product":
          return addNewProduct();
      }
    });

  function productsForSale() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      console.log(
        "------------------------------------------------------------------------"
      );
      console.table(res);
      console.log("Here are the products available in your store.");
      connection.end();
    });
  }

  function lowInventory() {
    var currentStockQuantity;
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      console.log(
        "The following products are considered to have low inventory:"
      );
      for (var i = 0; i < res.length; i++) {
        currentStockQuantity = res[i].stock_quantity;
        if (currentStockQuantity < 5) {
          console.table(res[i].product_name);
        }
      }
    });

    connection.end();
  }

  function addToCurrent() {
    var currentStockQuantity;
    connection.query("SELECT * FROM products", function(err, res) {
      console.log(
        "----------------------------------------------------------------------"
      );
      console.table(res);
      if (err) throw err;
      inquirer
        .prompt([
          {
            name: "item",
            type: "input",
            message:
              "What is the ID of the item you would like to add inventory to?"
          },
          {
            name: "inventoryAdd",
            type: "input",
            message:
              "How much inventory would you like to add to the existing product?"
          }
        ])
        .then(function(answers) {
          connection.query(
            "SELECT * FROM products WHERE ?",
            { id: answers.item },
            function(err, res) {
              if (err) throw err;
              var newStockQuantity;
              for (var i = 0; i < res.length; i++) {
                currentStockQuantity = res[i].stock_quantity;
                console.log(currentStockQuantity);
              }
              if (currentStockQuantity >= 0) {
                connection.query(
                  "UPDATE products SET ? WHERE ?",
                  [
                    {
                      stock_quantity:
                        currentStockQuantity + parseInt(answers.inventoryAdd)
                    },
                    {
                      id: answers.item
                    }
                  ],
                  function(err, res) {
                    if (err) throw err;
                    if (!err) {
                      console.log("Your inventory has been updated");
                      connection.end();
                    } else {
                      console.log(
                        "You may need to update your inventory at a different time."
                      );
                      connection.end();
                    }
                  }
                );
              }
            }
          );
        });
    });
  }

  function addNewProduct() {
    inquirer
      .prompt([
        {
          name: "id",
          type: "input",
          message: "What is the next ID in the list of products "
        },
        {
          name: "productName",
          type: "input",
          message: "What is the name of the product you would like to add?"
        },
        {
          name: "department",
          type: "input",
          message: "What department is the product going to be sold in?"
        },
        {
          name: "price",
          type: "input",
          message: "How much does the product cost?"
        },
        {
          name: "stockQuantity",
          type: "input",
          message: "How much of this item are you adding to the inventory?"
        }
      ])
      .then(function(answers) {
        connection.query(
          "INSERT INTO products SET ?",
          {
            id: answers.id,
            product_name: answers.productName,
            department_name: answers.department,
            price: answers.price,
            stock_quantity: answers.stockQuantity
          },
          function(err, res) {
            if (err) throw err;
            if (!err) {
              console.log("Your product has been added to the store!");
              connection.end();
            } else {
              console.log(
                "Technical difficulties have occurred. Please try to add your item at a later date."
              );
              connection.end();
            }
          }
        );
      });
  }
}
