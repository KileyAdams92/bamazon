var inquirer = require("inquirer");
var mysql = require("mysql");

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
  console.log("Selecting all products...\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);
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
        "SELECT stock_quantity FROM products WHERE ?",
        { id: answers.item },
        function(err, res) {
          if (err) throw err;
          var enoughSupply = false;
          var currentStockQuantity;
          for (var i = 0; i < res.length; i++) {
            currentStockQuantity = res[i].stock_quantity;
            if (currentStockQuantity >= answers.numberOfItems) {
              enoughSupply = true;
              console.log("Row equals", currentStockQuantity);
            }
          }
          console.log("isEnoughSupply = ", enoughSupply);
          console.log("res = ", res);
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
                  console.log("Congratulations on your purchase!");
                } else {
                  console.log("We have insufficient supply for your order.");
                }
              }
            );
          }
        }
      );

      //
      //               function(error) {
      //                 if (error) throw err;
      //                 console.log("Congratulations on your purchase!");
      //                 runApplication();
      //               }
      //             );
      //           } else {
      //             //inform them stock quantity was too low for purchase
      //             console.log("We do not have enough supply for your purchase.");
      //             runApplication();
      //           }
      //         });
      //     ;
    });
}
