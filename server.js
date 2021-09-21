const express = require('express')
const upload = require('express-fileupload')
const { stringify } = require('querystring')
const http = require('http');
const https = require('https');
const { constants } = require('buffer');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);


//--------- Opening a server and handling uploaded file ----------------------
const app = express()
app.use(upload())
app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/index.html')
})
app.post('/', (req,res)=>
{
  if (req.files)
  {
    var file = req.files.file
    var filename = file.name
    if (file.mimetype!= 'application/json')
    {
      res.send("The file uploaded is not a JSON file! please re-enter the site or press ENTER on the url to start over")
      return;
    }
    const dir = './uploads';
// check if directory exists
if (!fs.existsSync(dir)) {
  // create new directory
fs.mkdir(dir, (err) => {
  if (err) {
      throw err;
  }
});
}
    file.mv('./uploads/'+filename,function(err){
      if(err)
      {
        res.send(err)
        return;
      }
      else{
//--------- Opening a server and handling uploaded file end ----------------------
//------------ JSON Parsing ------------------
const { url } = require('inspector');
fs.readFile('./uploads/'+filename,'utf-8',(err,jsonString)=> { 
    if (err){
        res.send('The uploads folder doesnt exist, please make sure to create one in your work folder')
        deleteFiles(filename)
    }
    else{
        const data = JSON.parse(jsonString);
        if (data.url==null){
          deleteFiles(filename)
          res.send("The file uploaded doesn't have a url field! please re-enter the site or press ENTER on the url to start over")
          return;
        }
//--------- JSON Parsing end------------------------------------
//--------- Get Screenshot -------------------------------------
  if(!isValidURL(data.url))
  {
  deleteFiles(filename)
  res.end("The url given is not valid!")
  return;
  }
  checkWebsite(data.url)
  function checkWebsite(url){
    test(url, function(check){
      if (check)
      {
        const puppeteer = require('puppeteer');

        (async()=>
        {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(data.url);
            await page.screenshot({path: 'screenshot.jpg'})
            await browser.close();
        //-------- Get screenshot end ------------------------------------
        
        //-------- Create video from jpg ---------------------------------
        var videoshow = require('videoshow')
        var image = [{path: './screenshot.jpg'}]
        var videoOption = { 
          loop: 10,
          fps: 25,
          transition: false,
          transitionDuration: 0, // seconds
          videoBitrate: 1024,
          videoCodec: 'libx264',
          size: '640x?',
          audioBitrate: '128k',
          audioChannels: 2,
          format: 'mp4',
          pixelFormat: 'yuv420p'
        }
        //call the videoshow library
         videoshow(image,videoOption).save(filename+"_"+"movie.mp4").on('start',function(command){
             console.log("conversion started" + command)
        }).on('error',function(err,stdout,stderr){
             console.log("some error occured"+ err)
         }).on('end',function(output){
             console.log("conversion complete "+ output)
             let x = '\/'
        var oldPath = __dirname + x + output
        var newPath = __dirname + x + "uploads"+ x + output
         fs.rename(oldPath, newPath, function (err) {
           if (err) throw err
         })
        deleteFiles(filename)
        res.writeHead(200,{'Content-Type': 'application/json'});
        var myObj = {
          file: newPath
        }
        strx = Object
                .entries(myObj)
                .reduce((a, e) => {
                  if (typeof e[1] != "function") {
                    a += `"${e[0]}" : "${e[1]}", `;
                  }
                  return a;
                }, "`{")
                .slice(1, -2) + "}";
        res.end(strx)
         })
        })();
        //---------- Create video from jpeg end -----------------
      }
      else{
        res.send("cannot reach site! , please re-enter the site or press ENTER on the url to start over ")
        deleteFiles(filename)
        return;
      }
    })
}

//rest of body without error      
    }
});

      }
    })
  }
  else{
    res.end("Whoops! no file was uploaded, please re-enter the site or press ENTER on the url to start over")
    return;
  }
})
app.listen(1234)
console.log("Server ip is localhost:1234")


//-------------- Auxiliary Functions --------------------
function deleteFiles(filename)
{
const fs = require('fs');
let x = String.fromCharCode(92)
var pp = __dirname + x + "uploads"+ x + filename
var oldPath = __dirname + x + 'screenshot'
if (fs.existsSync("./screenshot.jpg"))
{
  fs.unlink('screenshot.jpg', (err) => {
    if (err) {
        throw err;
    }
  });
}
if (fs.existsSync(pp))
{
  fs.unlink(pp, (err) => {
    if (err) {
        throw err;
    }
  });
}
}


function isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
};




function test(url, callback) {
  https
    .get(url, function(res) {
      return callback(res.statusCode === 200);
    })
    .on("error", function(e) {
      return callback(false);
    });
}

//-------------- Auxiliary Functions end --------------------