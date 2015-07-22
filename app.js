var express    = require("express");
var paypal = require('paypal-rest-sdk');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
app.locals.baseurl = 'http://localhost:5000';


// paypal auth configuration
var config = {
  "port" : 5000,
  "api" : {
    "host" : "api.sandbox.paypal.com",
    "port" : "",            
    "client_id" : "AQ0HGpP-Ezb95BfHEbveAUwbEJzCHSH7broTXgvwBbClO9ESNpaUYNo6ke0edj7j4Du2wOKhWWaMNIdj",
    "client_secret" : "EJQpAFRPangtsGDTIvHnX2VTAwIIwLim4gV3v0Nty3ierH5ICK_-EK2ExmsZbPk9afooe1HM-Eg8cPDP"
  }
}
 
paypal.configure(config.api);


// Page will display after payment has beed transfered successfully
app.get('/success', function(req, res) {
  res.send("Payment transfered successfully.");
});

// Page will display when you canceled the transaction 
app.get('/cancel', function(req, res) {
  res.send("Payment canceled successfully.");
});

app.get('/', function(req, res) {
   res.sendFile(__dirname+'/index.html');
});



app.post('/paynow', function(req, res) {
   // paypal payment configuration.
  var payment = {
  "intent": "sale",
  "payer": {
    "payment_method": "paypal"
  },
  "redirect_urls": {
    "return_url": app.locals.baseurl+"/success",
    "cancel_url": app.locals.baseurl+"/cancel"
  },
  "transactions": [{
    "amount": {
      "total":parseInt(req.body.amount),
      "currency":  req.body.currency
    },
    "description": req.body.description
  }]
};

console.log(req.body.amount);
console.log(req.body.currency);
console.log(req.body.description);

  paypal.payment.create(payment, function (error, payment) {
  if (error) {
    console.log(error);
  } else {
    if(payment.payer.payment_method === 'paypal') {
      req.paymentId = payment.id;
      var redirectUrl;
      console.log(payment);
      for(var i=0; i < payment.links.length; i++) {
        var link = payment.links[i];
        if (link.method === 'REDIRECT') {
          redirectUrl = link.href;
        }
      }
      res.redirect(redirectUrl);
    }
  }
});
});


console.log("Listening  on 5000");
app.listen(5000);