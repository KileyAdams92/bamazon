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
          return;

        case "Add New Product":
          return;
      }
      //   connection.query(
      //     "SELECT * FROM products WHERE ?",
      //     { id: answers.item },
      //     function(err, res) {
      //       if (err) throw err;
      //       var enoughSupply = false;
      //       var currentStockQuantity;
      //       var price;
      //       for (var i = 0; i < res.length; i++) {
      //         currentStockQuantity = res[i].stock_quantity;
      //         price = res[i].price;
      //         if (currentStockQuantity >= answers.numberOfItems) {
      //           enoughSupply = true;
      //         }
      //       }
      //       if (enoughSupply === true) {
      //         connection.query(
      //           "UPDATE products SET ? WHERE ?",
      //           [
      //             {
      //               stock_quantity: currentStockQuantity - answers.numberOfItems
      //             },
      //             {
      //               id: answers.item
      //             }
      //           ],
      //           function(err, res) {
      //             if (!err) {
      //               console.log(
      //                 "Congratulations on your purchase! Your total was $" +
      //                   answers.numberOfItems * price +
      //                   "."
      //               );
      //               connection.end();
      //             } else {
      //               console.log("We have insufficient supply for your order.");
      //               connetion.end();
      //             }
      //           }
      //         );
      //       }
      //     }
      //   );
      // });
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
      for (var i = 0; i < res.length; i++) {
        currentStockQuantity = res[i].stock_quantity;
        if (currentStockQuantity < 5) {
          console.log(res[i]);
        }
      }
    });
    connection.end();
  }
}
