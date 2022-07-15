const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"tomarrow_land"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Database Connected!");
});
