var express = require('express');
const path = require('path');
const fabric = require("fabric").fabric;
const helmet = require("helmet");
const fs = require('fs')
var session = require('express-session')

var canvas = new fabric.Canvas(null, { width: 500, height: 600 });
var app = express();
//app.use(helmet( {contentSecurityPolicy: false}));/////ONLY FOR DEVELOPMENT!!!!!!!!
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 's3Cur3a3b45a5b',
    resave: true,
    saveUninitialized: true,
    name: 'sessionId'
}));

const port = process.env.PORT || 8080;
var images_array = fs.readdirSync('public/meme_templates/');
var small_similar_image;

// only for dev also remova <meta http-equiv="Content-Security-Policy" from index
if(port == 8080){
    const livereload = require("livereload");
    const liveReloadServer = livereload.createServer({
      exts: ['js', 'ejs', 'md', 'json', 'css', 'less', 'sass', 'scss', 'styl', 'svg', 'png', 'jpg', 'gif']
    });
    liveReloadServer.watch([__dirname+'/views',__dirname+'/public']);
    const connectLivereload = require("connect-livereload");
    app.use(connectLivereload());
}
// only for dev end    
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true}));


app.listen(port, () => {
    console.log(`  \\,,/(^_^)\,,/ Started listening at http://127.0.0.1:${port}`)
})


app.post(`/generate_meme`, function(req, res) {
    generate_meme(req);
    res.sendStatus(200);
});
app.get("/", (req, res) => {
    end_of_arrayslice = getRandomInt(40,images_array.length);
    small_similar_image = images_array.slice(end_of_arrayslice-40,end_of_arrayslice);
    res.render("index", ({
        small_similar_image
    })); // index refers to index.ejs
});

app.post(`/api/search`, function(req, res) {
    const similar_images = images_array.filter(s => s.toLowerCase().includes(req.body.search.toLowerCase()));

    if(req.body.search.length === 0){
        res.json(small_similar_image); //empty search, removed all characters
    }else if(req.body.search === "*"){
        res.json(images_array); //down scroll
    }else{
        res.json(similar_images); //none of the above
    }   
});



function generate_meme(req){
    try {
        var json = JSON.parse(req.body.canvas_json);
        canvas.loadFromJSON(req.body.canvas_json, function(o, object) {
        canvas.renderAll.bind(canvas);
        const out = fs.createWriteStream(__dirname + '/test.png');
        const svgoutput = canvas.toSVG();
            fs.writeFile("output.svg", svgoutput, function(err) {
                if (err){
                    throw err
                }else{
                    console.log('line 38: JSON received!');
                }
            });
        });
      } catch (e) {
        console.log('Invalid json')
        return false;
      }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }