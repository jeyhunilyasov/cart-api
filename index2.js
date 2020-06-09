const express = require('express');
const app = express();
const cors = require('cors');
const xlsx = require('xlsx');
const _ = require('lodash');
const bodyParser = require("body-parser");
const workbook = xlsx.readFile("Combined ACNH.xlsx", { sheetStubs: true, cellDates: true });
const sheet_name_list = workbook.SheetNames;
const xlData0 = xlsx.utils.sheet_to_json(
    workbook.Sheets[sheet_name_list[0]],
    { defval: "" }
);
const xlData1 = xlsx.utils.sheet_to_json(
    workbook.Sheets[sheet_name_list[1]],
    { defval: "" }
);
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(cors());

app.get('/api/csv', (req, res) => {
  let groupedByTag = _.groupBy(xlData0, 'Name');
  res.json({'status': "Success", 'data': groupedByTag, originalData: xlData0, paymentData: xlData1});
});

app.get('/api/products', (req, res) => {
  console.log(req.query.category);
  let newData = xlData0.filter(ele => {
    if (ele.Category.trim() === req.query.category.trim()) {
      return true
    }
  });
  res.json({status: 'Success', data: newData});
})

app.get('/api/paymentTerms', (req, res) => {
  res.json({status: 'Success', data: xlData1}); 
})

app.post('/api/placeOrder', (req, res) => {
  let discordName = req.body.discord_name;
  let paymentType = req.body.payment_type;
  let items = req.body.data;
  let totalPrice = req.body.totalPrice;
  const mailgun = require("mailgun-js");
    let html = `Discord name: ${discordName} <br>
          Payment method: ${paymentType} <br>
          `;
  const DOMAIN = "m.dodoairlin.es";
    const api_key = "452b73b5d598ebae7f68cb080a6b2934-a2b91229-ce507dee";
    let cartItems = '<table style="text-align: left"><thead><th width="35%">Name</th><th width="30%">Variant ID</th><th>Unique Entry ID</th></thead><tbody>';
    for(let i = 0 ; i < items.length; i ++) {
      let temp = '<tr><td>' + items[i]['Name'] + '</td><td>' + items[i]['Variant ID'] + '</td><td>' + items[i]['Unique Entry ID'] + '</td></tr>';
      cartItems += temp;
    };
    html = html + cartItems + '</tbody></table>'
    const mg = mailgun({ apiKey: api_key, domain: DOMAIN });
    const data = {
      from: "Dodo<me@lunarenigma.com>",
      to: 'sweden.super.star@gmail.com',
      subject: discordName + " " + totalPrice + " " + paymentType,
      html: html
    };

    mg.messages().send(data, function(error, body) {
      console.log("body", body);
      res.json({status: 'Success', data: body});
    });
});

app.post('/api/login', (req, res) => {
  let password = xlData1[0]['Password'];
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
