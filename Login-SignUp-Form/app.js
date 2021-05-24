var express = require('express');
var crypto = require('crypto');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var path = require('path');
var ejs = require('ejs');
var app = express();
var new_db = "mongodb://localhost:27017/login-data"
app.get('/', function(req, res) {
    res.set({
        'Access-Control-Allow-Origin' : '*'
    });
    return res.redirect('/public/index.html');

}).listen(8000);

console.log("Server listening at : 8000");
app.use('/public', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use('/css', express.static(__dirname + '/css'));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));

/*var getHash = ( pass , phone ) => {
				
    var hmac = crypto.createHmac('sha512', phone);
    data = hmac.update(pass);
    gen_hmac= data.digest('hex');
    return gen_hmac;
}*/
                                        
app.post('/sign_up' ,function(req,res){
	var name = req.body.name;
	var email= req.body.email;
	var password = req.body.password;
	var data = {
		"name":name,
		"email":email,
		"password": password
	}
	mongo.connect(new_db , function(error , db){
		if (error){
			throw error;
		}
		console.log("connected to database successfully");       
		db.collection("details").insertOne(data, (err , collection) => {
			if(err) throw err;
			console.log("Record inserted successfully");
			console.log(collection);
		});
	});
	
	console.log("DATA is " + JSON.stringify(data) );
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.render('success', {name:name});

});
		
app.post('/login' ,function(req,res){
	var email= req.body.email;
	var password = req.body.password;	
    console.log(email);
	mongo.connect(new_db , function(error , db){
		if (error){
			throw error;
		}
		console.log("connected to database successfully");
        var dbo = db.db("login-data");
        dbo.collection("details").find({"email": email, "password" : password}).toArray(function(err, result) {
            if (err) throw err;
            if(result.length > 0)
            {
				var user_name = result[0].name;
				console.log(user_name);
                console.log("Record Found Successfully");
                //return res.redirect('../public/success.html'); 
				return res.render('success', {name:user_name});
            }
            else
            {
                return res.redirect('../public/Login-1.html');
            }

          });
	});
	
});
