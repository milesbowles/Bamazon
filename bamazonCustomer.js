// Get dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');

// Setup MySQL connection
var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'Bamazon'
});


// displays list of available items
function showItems() {
	query = 'SELECT * FROM products';
	connection.query(query, function(err, data) {
		if (err) throw err;

        console.log(' ___  _   _   _   _  ___ _  _  _ ');
        console.log('| o )/ \\ | \\_/ | / \\|_ // \\| \\| |');
        console.log('| o \\ o || \\_/ || o |/(( o ) \\ |');
		console.log('|___/_n_||_| |_||_n_/___\\_/|_|\\_|' + '\n');
		
		console.log('///////////////////////////////////////////////////////////////////////////////\n');

		var productBox = '';
		for (var i = 0; i < data.length; i++) {
			productBox += '---------------------------------------------------' + '\n';
			productBox += '  Item ID    | ' + data[i].item_id + '\n';
			productBox += 'Product Name | ' + data[i].product_name + '\n';
			productBox += ' Department  | ' + data[i].department_name + '\n';
            productBox += '   Price     | ' + '$' + data[i].price + '\n';
            productBox += '---------------------------------------------------' + '\n';
		}

		console.log(productBox);
	  	promptUser();
	})
}

// checks whether string is a normal integer 
function isPositiveInteger(str) {
	return /^\+?[1-9][\d]*$/.test(str);
}

// checks for valid user input
function checkInput(value) {
	if (isPositiveInteger(value) === true) {
		return true;
	} else {
	return 'Whoops! Somethings not right. Make sure your entering a number.';
	}
}


function promptUser() {
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Enter the ID of the product you wish to purchase.',
			validate: checkInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many would you like?',
			validate: checkInput,
			filter: Number
		}
	]).then(function(input) {

		var item = input.item_id;
		var quantity = input.quantity;

		// Query db
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, data) {
			if (err) throw err;

			if (data.length === 0) {
				console.log('Whoops! Invalid Item ID. Please try again with a valid Item ID.');
				showItems();

			} else {
				var productInfo = data[0];

				if (quantity <= productInfo.stock_quantity) {
					console.log('Your item is in stock. Your order is now being proccessed.');

					// Update the items list
					var updateQuery = 'UPDATE products SET stock_quantity = ' + (productInfo.stock_quantity - quantity) + ' WHERE item_id = ' + item;
					connection.query(updateQuery, function(err, data) {
						if (err) throw err;

						console.log('Your oder has been placed! Your total is $' + productInfo.price * quantity + '\n');
						console.log('////////////////////////////////////////////////////////////////////////////\n');;

						connection.end();
					})
				} else {
					console.log('Oh no! We don\'t have enough of the item you selected in stock...\n');
					console.log('///////////////////////////////////////////////////////////////////////////////\n');

					showItems();
				}
			}
		})
	})
}



// Main function
function runBamazon() {
	showItems();
}


runBamazon();