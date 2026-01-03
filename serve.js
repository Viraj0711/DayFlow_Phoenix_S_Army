const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8000;
const root = process.cwd();
const mime = {
  '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.json':'application/json', '.txt':'text/plain'
};
http.createServer((req,res)=>{
  try{
    const reqPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(root, reqPath);
    if(reqPath === '/' || reqPath === '') filePath = path.join(root,'index.html');
    fs.stat(filePath,(err,stat)=>{
      if(err){ res.statusCode=404; res.end('Not found'); return; }
      if(stat.isDirectory()){ filePath = path.join(filePath,'index.html'); }
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error',()=>{ res.statusCode=500; res.end('Server error'); });
    });
  }catch(e){ res.statusCode=500; res.end('Server error'); }
}).listen(port,()=>console.log(`Static server running at http://localhost:${port}/`));
