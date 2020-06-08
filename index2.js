const express = require('express');
const app = express();
const cors = require('cors');
const xlsx = require('xlsx');
const mysql = require('mysql');

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "education_system_development"
});

const sql = "INSERT INTO counties (county, state, abbr, created_at, updated_at) VALUES ?";
app.use(cors());

app.get('/csv', (req, res) => {
	let workbook = xlsx.readFile("Counties by State v2.xlsx", { sheetStubs: true, cellDates: true });
	let sheet_name_list = workbook.SheetNames;
	let xlData = xlsx.utils.sheet_to_json(
	    workbook.Sheets[sheet_name_list[0]],
	    { defval: "" }
  	);
 	//  var values = [
	//     ['demian', 'demian@gmail.com', 1],
	//     ['john', 'john@gmail.com', 2],
	//     ['mark', 'mark@gmail.com', 3],
	//     ['pete', 'pete@gmail.com', 4]
	// ];
	let values = [];
  	for(let i = 0 ; i < xlData.length; i ++ ){
  		let ele = {
  			county: xlData[i]['County'].trim(),
  			state: xlData[i]['State'].trim(),
  			abbr: xlData[i]['Abbreviations'].trim(),
  			created_at: new Date(),
  			updated_at: new Date(),
  		};
  		values.push([ele.county, ele.state, ele.abbr, ele.created_at, ele.created_at]);
  		console.log(values);
  	}
  	conn.query(sql, [values], function(err) {
	    if (err) throw err;
	    conn.end();
	});
  	res.json({'status': "Success"})
})

app.listen(3004, function(){
    console.log(`Server is up and running`);
});