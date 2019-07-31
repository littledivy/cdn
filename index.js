const express = require('express');
const app = express();
const debug = require('debug')('myapp:server');
const path = require('path');
const multer = require('multer');
const logger = require('morgan');
const serveIndex = require('serve-index');
const os = require('os-utils');
const nativeOS = require('os');
const http = require('http');
const io = require('socket.io');
 

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

//will be using this for uplading
const upload = multer({ storage: storage });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true}));

app.get('/', function(req,res) {
        var stats = {}
        stats.uptime = nativeOS.uptime()
        stats.freemem = nativeOS.freemem()
        console.log(stats)
        return res.render('index',{
            stats:stats
        });
})

app.post('/upload', upload.single('file'), function(req,res) {
    debug(req.file);
    console.log('storage location is ', req.hostname +'/' + req.file.path);
    return res.send(req.file);
})

var server = http.createServer(app);
var sio = io(server); 

sio.on("connection", function(socket) {
   socket.on('gimme_cpu_usage', function(client) {
        os.cpuUsage(function(v){
            socket.emit('cpu_usage',v);
        });
   })
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    debug('Server is up and running on port ', port);
})