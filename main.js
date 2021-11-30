'use strict';
const rpcURL = 'https://polygon-mainnet.infura.io/v3/d8737054b1a0401282cb8624a060fc7f';

var express = require('express');
const path = require('path');
const fabric = require("fabric").fabric;
const helmet = require("helmet");
const fs = require('fs')
var session = require('cookie-session')

const Web3 = require('web3');
let web3 = new Web3(rpcURL);

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

//proxy_set_header Strict-Transport-Security: max-age=31536000; de adaugat 
// only for dev end    
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true}));
app.use(express.static(path.join(__dirname, "public"), {
    maxAge: '5000' // uses milliseconds per docs
  }))


app.listen(port, () => {
    console.log(`  \\,,/(^_^)\,,/ Started listening at http://127.0.0.1:${port}`)
})


app.post(`/ethereum/send`, function(req, res) {
    //console.log(req.body.params);
    console.log('Transaction received! '+req.body.params.txHash);
    checkTransaction(req.body.params.txHash, req.body.canvas_json)
    res.sendStatus(200);
});


async function checkTransaction(hash, canvas_json){
    let passes = 0;
    var check_hash = setInterval( async() => {
        try{
            if(passes > 20){
                console.log('failed 20 passes! '+hash)
                clearInterval(check_hash);
            }

            let transaction_response = await web3.eth.getTransaction(hash);
            if(transaction_response.blockHash == null){
                passes++;
            }else{
                web3.eth.getTransactionReceipt(hash)
                .then(async function(data){
                    let logs = data.logs;
                    let token_id = web3.utils.hexToNumber(logs[1].topics[3]);
                    let value = transaction_response.value;
                    let owner = transaction_response.from;

                    create_NFT(token_id,value,owner,canvas_json);
                });
                clearInterval(check_hash);
                console.log()
            }
        }catch(e){
            console.log(e);
        }
      }, 60*1000);
}

app.get("/", (req, res) => {
    let end_of_arrayslice = getRandomInt(40,images_array.length);
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function create_NFT(token_id,value,owner,canvas_json){
    console.log('Owner of token nr: '+token_id+' with the value of: '+value+' is: '+owner);
    generate_meme(canvas_json,token_id)//add watermark depending on value, send owner for json too
}


function generate_meme(canvas_json,token_id){
    try {
        var json = JSON.parse(canvas_json);
        var small_src = decodeURIComponent(json.backgroundImage.src.split("meme_templates/")[1]);
        json.backgroundImage.src = "";

        canvas.loadFromJSON(json, function() {
            fabric.Image.fromURL('https://nft-memes.io/meme_templates/'+small_src, function(myImg){
                var stream = canvas.createPNGStream();
                canvas.setBackgroundImage(myImg,canvas.renderAll.bind(canvas));
                const out = fs.createWriteStream(__dirname + '/public/nfts/'+token_id+'.png');

                stream.on('data', function(chunk) {
                    out.write(chunk);
                });
                stream.on('end', function(data){
                    console.log('Salvou imagem');
                });
            });
        });
      } catch (e) {
        console.log(canvas_json)
        console.log('Invalid json' + e)
        return false;
      }
}