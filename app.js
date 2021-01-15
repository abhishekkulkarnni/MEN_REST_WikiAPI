// jshint esversion:6

//' Get Required Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();


//' Intialise / Config Express & App
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ 
        extended:true 
    }));
app.use(express.static("public"));


//' Connect Mongoose
mongoose.connect(process.env.MONGODB_URL + process.env.MONGODB_DBNAME,    
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

//' Create Schema & Set Model
const articleSchema = {
    title : String,
    content : String
};

const Article = mongoose.model("Article", articleSchema);

    
//' TODO
//' Default Route
app.get("/", (req, res)=>{    
    let resHtml = "<p> <b>User Below Routes..</b> <br><br>";
    resHtml += "<b>GET : '/articles' </b>: To get all articles <br>";
    resHtml += "<b>GET : '/articles/:articleTitle' </b>: To get specific article <br>";

    resHtml += "<b> POST : '/articles' </b>: To add new article <br>";
    
    resHtml += "<b>PUT : '/articles/:articleTitle' </b>: To Update / Overwrite complete specific article <br>";
    resHtml += "<b>PATCH : '/articles/:articleTitle' </b>: To Update specific property of article <br>";

    resHtml += "<b> DELETE : '/articles' </b>: To add new article <br>";
    resHtml += "</p>";
    res.send(resHtml);
});




//' Chainable ROUTE Handler For Route Path '/articles' For All Articles
app.route("/articles")

    .get((req, res)=>{
        //' GET All Articles
        Article.find((err, foundArticles)=>{
            if(!err){
                res.send(foundArticles);
            }
            else{
                res.send(err);
            }            
        });
    })
    
    .post((req, res)=>{
        //' POST/Add New Article
        let reqTitle = req.body.title;
        let reqContent = req.body.content;

        const newArticle = new Article({
            title: reqTitle,
            content: reqContent
        });
        newArticle.save((err)=>{
            if(!err){
                res.send("Article Added !");
            }
            else{
                res.send("Error: "+ err);
            }
        });
    })
    
    .delete((req, res)=>{   
        //' DELETE All Articles
        Article.deleteMany((err)=>{
            if(!err){
                res.send("Successfully deleted all articles.");
            }
            else{
                res.send("Error: " + err );
            }
        });
    });




    //' Chainable ROUTE Handler For Route Path '/articles/:articleTitle' For Specific Articles
    app.route("/articles/:articleTitle")

    .get((req, res) =>{
        let reqTitle = req.params.articleTitle;        

        Article.findOne({title: reqTitle}, (err, foundArticle)=>{
            if(!err){
                if(foundArticle){
                    res.send(foundArticle);
                }
                else{
                    res.send("No article found for matching title");
                }
            }
            else{
                res.send("Error: " + err);
            }
        });
    })

    .put((req, res)=>{
        //' PUT/Update/Overwrite Complete Record
        let reqTitle = req.params.articleTitle;

        Article.findOneAndUpdate(
            {title: reqTitle},
            {
                title: req.body.title, content: req.body.content
            },            
            function(err, doc){
                if(!err){
                    if(!doc){
                        res.send("No such article found");
                    }
                    else{
                        res.send("Successfully updated article: " + reqTitle);
                    }
                }
                else{
                    res.send("Error: " + err);
                }
            }
        );

    })

    .patch((req, res)=>{
        //' PATCH/Update Specific Property. Instead Of Overwrite Complete Record.
        let reqTitle = req.params.articleTitle;

        Article.findOneAndUpdate(
            {title: reqTitle},
            {$set: req.body},
            {new: true},
            function(err, doc){
                if(!err){
                    if(!doc){
                        res.send("No such article found");
                    }
                    else{
                        res.send("Successfully updated article: " + reqTitle);
                    }
                    
                }
                else{
                    res.send("Error: " + err);
                }
            }
        );
    });










//' Initialize Server PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server started at PORT :" + PORT);
})