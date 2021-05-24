const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
var app = express();

mongoose.connect('mongodb://localhost:27017/notesDB', {useNewUrlParser: true,  useUnifiedTopology: true, useFindAndModify: true});

const noteSchema = {
	heading: String,
	content: String
};

const Note = mongoose.model("note", noteSchema);

const ListSchema = {
	name: String,
	items: [noteSchema]
};

const List = mongoose.model("list", ListSchema);
 
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/custom/:listName", function(req, res) {
	var listName = req.params.listName;
	List.findOne({name: listName}, function(err, foundList) {
		if(err) res.redirect('/');
		else {
			res.render('index', {title: foundList.name, items: foundList.items});
		}
	})
})

app.post("/opencustom/:listName", function(req, res) {
	res.redirect("/custom/"+req.params.listName);
})

app.post("/custom/:listName", function(req, res) {
	var listName = req.params.listName;
	var newNote = new Note({
		heading: req.body.heading,
		content: req.body.content
	})
	List.findOneAndUpdate({name: listName}, { $push: { items: newNote}}, function(err, success) {
		if(err) console.log(err);
		else console.log("successfully pushed");
	})
	res.redirect("/custom/"+listName);
})

app.post("/deleteNote/:listName", function(req, res) {
	var listName = req.params.listName;
	List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: req.body.noteID}}}, function(err, foundList) {
		if(err) res.redirect('/');
		else res.redirect("/custom/"+listName);
	})
})

app.post("/deleteList", function(req, res) {
	console.log(req.body.listID);
	List.findByIdAndDelete(req.body.listID, function(err, result){
		if(err) console.log("some error in deleting list");
		else console.log("Successfully deleted"+result);		
});	
	res.redirect("/");
})

app.get("/", function(req, res){
	List.find({}, function(err, list){	
		if(err) console.log("error");

		else {
			// console.log(list);
			res.render('home', {title: "Your Custom Lists", list, list});
		}
	});
})

app.post("/", function(req, res){
	var newList = new List({
		name: req.body.listName,
		itmes: []
	})
	newList.save();
	res.redirect("/");
})

app.listen(7000, function(){
	console.log("The server is up and running at port 3000");
});