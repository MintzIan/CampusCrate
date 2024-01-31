
const express = require ('express');
const path = require('path');
const { connectToDb, getDb } = require("./config")
const bodyParser = require('body-parser')

const app = express();

const port = 3000;

//Database Connection
let db;
let currentUser;

//The server will run if the database is sucessfully connected.
connectToDb((err) =>{
    if(!err){
      app.listen(port, () =>{
         console.log("server is running")
      })
      db = getDb();
    }
})

//Parses elements from the frontend.
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs')

app.use(express.static('public'));

app.get('/', (req, res) =>{
    res.render("index")
})
//Fetches all usernames from the database.
app.get('/login', (req, res) =>{
    users = []
    db.collection('users')
    .find()
    .sort({username: 1})
    .forEach(user => users.push(user))
    .then(() =>{
        console.log(users)
    })
    .catch((err) => {
        console.log(err)
    })
    res.render("login")
})
//Arrays to store database keys upon opening a certain webpage.
let users = [];
let cards = [];
let userCards = [];
let notes = [];
let userNotes = [];
app.get('/flashCards', (req, res) =>{
    res.render("flashCards")
})
app.get('/planner', (req, res) =>{
    res.render("planner")
})

//Signs out the user by maing the current user variable null, restricting access to saving flashcards and notes.
app.get('/logOut', (req, res) =>{//idea from CBTNuggets - Backend to Frontend API Fetcher.
    currentUser = null;
    cards = [];
    res.redirect("/")
})
//Fetches all users from the database.
app.get('/signUp', (req, res) =>{
    //Find method returns cursors, then use methods to make arrays.
    users = [];
    db.collection('users')
    .find()
    .sort({username: 1})
    .forEach(user => users.push(user))
    .then(() =>{
        console.log(users)
    })
    .catch((err) => {
        console.log(err)
    })
    res.render("signUp")
})
//Upon opening the flashcards webpage, a request is made to fetch this api. (same goes for planner with "/api/notes")
app.get('/api/cards', (req, res) => {
    cards = []
    userCards = []
    db.collection('cards')
    .find()
    .sort({username: 1})
    .forEach(card => cards.push(card))
    .then(() =>{
       console.log(cards)
       let len = cards.length;
       for(i = 0; i < len; i++){
        if(currentUser == cards[i].user){//Filters out all cards that aren't saved by the user that is currently logged in. 
            console.log("added")
            userCards.push(cards[i])
        }
       }
       res.json(userCards)
    })
    .catch((err) => {
        console.log(err)
    })
})
app.get('/api/notes', (req, res) => {
    notes = []
    userNotes = []
    console.log("here")
    db.collection('notes')
    .find()
    .sort({username: 1})
    .forEach(note => notes.push(note))
    .then(() =>{
       console.log(notes)
       let len = notes.length;
       for(i = 0; i < len; i++){
        if(currentUser == notes[i].user){
            console.log("added")
            userNotes.push(notes[i])
        }
       }
       res.json(userNotes)
    })
    .catch((err) => {
        console.log(err)
    })
})
//Checks for duplicate usernames.
app.post('/signUp', async (req, res) =>{
    let user = req.body.username;
    let equal = false;
   const data = {
     username: req.body.username,
     password: req.body.password
   }
   let length = users.length;
   for(i = 0; i < length; i++){
    if(user == users[i].username){
        //console.log("equal")
        equal = true;
        break;
    }
   }
   if (equal == false){
    db.collection('users').insertOne(data).then(result => {
      currentUser = user;
      res.redirect('/')
    })
    .catch(err =>{
      console.log(err)
   })
}
else{
    res.send("pick a different username")
}
})
//Checks for a username password combo that matches the inputs.
app.post('/login', async (req, res) =>{
    let username = req.body.username;
    let password = req.body.password;
    let length = users.length;
    let num;
   for(i = 0; i < length; i++){
    if(username == users[i].username){
        num = i;
        break;
    }
   }
   if(num == null){
    res.send("nonexistent")
   }
   else{
    if(users[num].password == password){
        currentUser = username;
        res.redirect('/')
    }
    else{
        res.send("wrong password")
    }
   }
   
})
//Saves flashcards if the user is signed in. 
app.post('/flashCards', (req, res) =>{
    if(currentUser != null && req.body.question != null && req.body.answer != null && req.body.answerShow == null && req.body.questionShow == null){
        let q = {
            user: currentUser, 
            question: req.body.question,
            answer: req.body.answer
        }
        db.collection('cards').insertOne(q)
        res.redirect('/flashCards')
        
    }
    else if(currentUser != null && req.body.questionShow != null && req.body.answerShow != null && req.body.question == null && req.body.answer == null){
        let p = {
            user: currentUser, 
            question: req.body.questionShow,
            answer: req.body.answerShow
        }
        console.log(p)
        db.collection('cards').deleteOne(p)
        res.redirect('/flashCards')
    }
    else{
        res.send("sign in to save")
    }
    
})
//Saves notes if the user is signed in. 
app.post('/planner', (req, res) =>{
    if(currentUser != null && req.body.note != null && req.body.title != null){
        let q = {
            user: currentUser, 
            title: req.body.title,
            note: req.body.note
        }
        db.collection('notes').insertOne(q)
        res.redirect('/planner')
        
    }
    else if(currentUser != null && req.body.titleDel != null && req.body.noteDel != null){
        let p = {
            user: currentUser, 
            title: req.body.titleDel,
            note: req.body.noteDel
        }
        console.log(p)
        db.collection('notes').deleteOne(p)
        res.redirect('/planner')
    }
    else{
        res.send("sign in to save")
    }
    
})