//DEPENDANCIES 
const express = require("express");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Bunny', { useNewUrlParser: true });
const BunnySchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    color: { type: String, required: true, minlength: 2 },
    home: { type: String, required: true },
    created_at: { type: String }
})
const Bunny = mongoose.model('Bunny', BunnySchema);
const app = express();
app.use(express.static(__dirname + "/static"));
const session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
const flash = require('express-flash');
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.listen(8000, () => console.log("listening on port 8000"));


//ROUTES
app.get('/', (req, res) => {
    Bunny.find().sort({ 'created_at': -1 })
        .then(bunnies => {
            res.render("fluffleDash", { bun: bunnies });
        })
        .catch(err => res.json(err));
});

app.get('/bunny/new', (req, res) => {
    res.render("newFluffle");
});

app.post('/add', (req, res) => {
    const bunny = req.body;
    Bunny.create(bunny)
        .then(newBunny => {
            newBunny.created_at = new Date().toLocaleString();
            newBunny.save();
            res.redirect(`/bunny/${newBunny.id}`);
        })
        .catch(err => {
            for (var key in err.errors) {
                console.log("We have an error!", err);
                req.flash('newFluffle', err.errors[key].message);
            }
            res.redirect('/bunny/new');
        });
});

app.get('/bunny/:id', (req, res) => {
    const { id } = req.params;
    Bunny.findOne({ _id: id })
        .then(display => {
            res.render("displayBunny", { bunny: display });
        })
        .catch(err => res.json(err));
});

app.get('/bunny/edit/:id', (req, res) => {
    const { id } = req.params;
    Bunny.findOne({ _id: id })
        .then(display => {
            res.render("editBunny", { bunny: display });
        })
        .catch(err => res.json(err));
});

app.post('/edit/:id', (req, res) => {
    const { id } = req.params;
    Bunny.updateOne({ _id: id }, { name: req.body.name, color: req.body.color, home: req.body.home })
        .then(edit => {
            edit.save();
            res.redirect(`/bunny/${id}`)
        })
        .catch(err => {
            for (var key in err.errors) {
                console.log("We have an error!", err);
                req.flash('editFluffle', err.errors[key].message);
            }
            res.redirect(`/bunny/edit/${id}`);
        });
    res.redirect(`/bunny/${id}`)
});

app.get('/destroy/:id', (req, res) => {
    const { id } = req.params;
    Bunny.remove({ _id: id })
        .then(deleted => {
            deleted.save();
        })
        .catch(err => res.json(err));
    res.redirect("/");
});