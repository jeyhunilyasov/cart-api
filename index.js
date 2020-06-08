const express = require('express');
const app = express();
const cors = require('cors');
const xlsx = require('xlsx');
const _ = require('lodash');
const bodyParser = require("body-parser");

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(cors())
app.get('/csv', (req, res) => {
	let workbook = xlsx.readFile("Combined ACNH.xlsx", { sheetStubs: true, cellDates: true });
	let sheet_name_list = workbook.SheetNames;
	let xlData = xlsx.utils.sheet_to_json(
	    workbook.Sheets[sheet_name_list[0]],
	    { defval: "" }
	);
  let groupedByTag = _.groupBy(xlData, 'Name');
  res.json({'status': "Success", 'data': groupedByTag, originalData: xlData});
})

app.get('/products', (req, res) => {
	console.log(req.query.category);
	let workbook = xlsx.readFile("Combined ACNH.xlsx", { sheetStubs: true, cellDates: true });
	let sheet_name_list = workbook.SheetNames;
	let xlData = xlsx.utils.sheet_to_json(
	    workbook.Sheets[sheet_name_list[0]],
	    { defval: "" }
	);
	let newData = xlData.filter(ele => {
		if (ele.Category.trim() === req.query.category.trim()) {
			return true
		}
	});
	res.json({status: 'Success', data: newData});
})

app.get('/paymentTerms', (req, res) => {
	let workbook = xlsx.readFile("Combined ACNH.xlsx", { sheetStubs: true, cellDates: true });
	let sheet_name_list = workbook.SheetNames;
	let xlData = xlsx.utils.sheet_to_json(
	    workbook.Sheets[sheet_name_list[1]],
	    { defval: "" }
	);
	res.json({status: 'Success', data: xlData}); 
})

app.post('/placeOrder', (req, res) => {
	let discordName = req.body.discord_name;
	let paymentType = req.body.payment_type;
	let items = req.body.data;
	let totalPrice = req.body.totalPrice;
	const mailgun = require("mailgun-js");
    const DOMAIN = "m.dodoairlin.es";
    const api_key = "452b73b5d598ebae7f68cb080a6b2934-a2b91229-ce507dee";
    let html = `Discord name: ${discordName} <br>
    			Payment method: ${paymentType} <br>
    			`;
   	let cartItems = '<table style="text-align: left"><thead><th width="35%">Name</th><th width="30%">Variant ID</th><th>Unique Entry ID</th></thead><tbody>';
   	console.log(items)
   	for(let i = 0 ; i < items.length; i ++) {
   		let temp = '<tr><td>' + items[i]['Name'] + '</td><td>' + items[i]['Variant ID'] + '</td><td>' + items[i]['Unique Entry ID'] + '</td></tr>';
   		cartItems += temp;
   	};
   	html = html + cartItems + '</tbody></table>'
    const mg = mailgun({ apiKey: api_key, domain: DOMAIN });
    const data = {
      from: "Dodo<me@lunarenigma.com>",
      to: 'me@lunarenigma.com',
      subject: "<" + discordName + "> <" + totalPrice + "> <" + paymentType + ">",
      html: html
    };

    mg.messages().send(data, function(error, body) {
      console.log("body", body);
      res.json({status: 'Success', data: body});
    });
});

app.post('/login', (req, res) => {
	let workbook = xlsx.readFile("Combined ACNH.xlsx", { sheetStubs: true, cellDates: true });
	let sheet_name_list = workbook.SheetNames;
	let xlData = xlsx.utils.sheet_to_json(
	    workbook.Sheets[sheet_name_list[1]],
	    { defval: "" }
	);
	let password = xlData[0]['Password'];
	console.log(password, req.body.password);
	if (req.body.password.toString().trim() === password.toString().trim()) {
		res.json({status: 'Success', data: 'Login Success!'});
	} else {
		res.json({status: 'Error', data: 'Password Incorrect'});
	}
})

app.listen(3004, function(){
    console.log(`Server is up and running`);
});