//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-tashi:test123@cluster0.rfgon.mongodb.net/todolistsDB", {useNewurlParser: true})

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema)

const Water = new Item ({
  name: "Water"
})

const Earth = new Item ({
  name: "Earth"
})

const Fire = new Item ({
  name: "Fire"
})

const Air = new Item ({
  name: "Air"
})

const defaultItems = [Water, Earth, Fire, Air];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("success");
        }
      });
      res.redirect('/');
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});



app.post("/", function(req, res){

 const itemName = req.body.newItem;
 const listName = req.body.list;

 const item = new Item({
   name: itemName
 });

 if (listName === "Today"){
  item.save();
  res.redirect('/');
 } else {
   List.findOne({name: listName}, function(err, result){
     result.items.push(item);
     result.save();
     res.redirect('/' + listName)
   })
 }

 
});

app.post('/delete', function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted item");
        res.redirect('/')
      }
    });
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}},
      function(err, result){
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }

  
})

app.get('/:customeName', function(req,res){
  const customName = _.capitalize(req.params.customeName);

  List.findOne({name: customName}, function(err,result){

    if (!err){
      if (!result){
        // create new list
        const list = new List({
          name: customName,
          items: defaultItems
        })
       
        list.save(function(){
          res.redirect('/' + customName)
        });
      } else {
        // show exitsing list
        res.render('list', {listTitle: result.name, newListItems: result.items});
  }
}
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
