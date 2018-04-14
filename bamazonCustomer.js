var inquirer = require("inquirer");
var mysql = require("mysql");
var cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "ComputerNerd1",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  // begin running application once connection has been made
  runApplication();
});

function runApplication(items) {
  readProducts();
}

function readProducts() {
  console.log("Opening Kiley's Store...\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    console.log(
      "Welcome to our store! Please have a look aorund and feel free to purchase any items you may need!"
    );
    thePurchase();
  });
}

function thePurchase() {
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message:
          "What is the product ID# of the item you would like to purchase?"
      },
      {
        name: "numberOfItems",
        type: "input",
        message: "How many of this item would you like to buy?"
      }
    ])
    .then(function(answers) {
      connection.query(
        "SELECT * FROM products WHERE ?",
        { id: answers.item },
        function(err, res) {
          if (err) throw err;
          var enoughSupply = false;
          var currentStockQuantity;
          var price;
          for (var i = 0; i < res.length; i++) {
            currentStockQuantity = res[i].stock_quantity;
            price = res[i].price;
            if (currentStockQuantity >= answers.numberOfItems) {
              enoughSupply = true;
            }
          }
          if (enoughSupply === true) {
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: currentStockQuantity - answers.numberOfItems
                },
                {
                  id: answers.item
                }
              ],
              function(err, res) {
                if (!err) {
                  console.log(
                    "Congratulations on your purchase! Your total was $" +
                      answers.numberOfItems * price +
                      "."
                  );
                  connection.end();
                } else {
                  console.log("We have insufficient supply for your order.");
                  connetion.end();
                }
              }
            );
          }
        }
      );
    });
}
