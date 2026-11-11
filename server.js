// CENB · Suprem Poker bot control room. A project of its own: it serves the panel and
// passes each panel request to the poker server's CENB interface (/api/cenb/...), where the
// bots play. It keeps no data: the CENB sign-in and the bots live on the poker server,
// behind the CENB username and password. No npm dependencies.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.dirname(fileURLToPath(import.meta.url)),PUBLIC=path.join(ROOT,'public');
const PORT=Number(process.env.PORT||3000);
// Where the poker server is. On Coolify this can stay as it is.
const POKER_URL=String(process.env.POKER_URL||'https://suprempoker.com').replace(/\/+$/,'');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const HEADERS={'x-content-type-options':'nosniff','x-frame-options':'DENY','referrer-policy':'no-referrer','x-robots-tag':'noindex, nofollow','permissions-policy':'camera=(), microphone=(), geolocation=(), payment=()','cross-origin-opener-policy':'same-origin',
 'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"};
const clientIp=req=>String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket.remoteAddress||'';
const send=(res,status,body,type='application/json')=>{res.writeHead(status,{'content-type':type,'cache-control':'no-store'});res.end(body);};

async function proxy(req,res,action){
 if(req.method!=='POST')return send(res,405,JSON.stringify({error:'Use POST'}));
 if(!/^[a-z]+(\/[a-z]+)?$/.test(action))return send(res,404,JSON.stringify({error:'Not found'}));
 let body='';for await(const c of req){body+=c;if(body.length>50_000)return send(res,413,JSON.stringify({error:'Body too large'}));}
 try{
  const r=await fetch(POKER_URL+'/api/cenb/'+action,{method:'POST',signal:AbortSignal.timeout(15000),
   headers:{'content-type':'application/json','x-forwarded-for':clientIp(req),...(req.headers.authorization?{authorization:req.headers.authorization}:{})},body:body||'{}'});
  send(res,r.status,await r.text());
 }catch{send(res,502,JSON.stringify({error:'The poker server does not answer right now. Try again in a moment.'}));}
}

const server=http.createServer(async(req,res)=>{
 for(const [k,v] of Object.entries(HEADERS))res.setHeader(k,v);
 if(req.headers['x-forwarded-proto']==='https')res.setHeader('strict-transport-security','max-age=31536000');
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health')return send(res,200,JSON.stringify({ok:true}));
  if(url.pathname.startsWith('/api/'))return await proxy(req,res,url.pathname.slice(5));
  const name=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1)),file=path.resolve(PUBLIC,name);
  if(!file.startsWith(PUBLIC+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return send(res,404,'Not found','text/plain');
  res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':name==='index.html'?'no-store':'no-cache'});res.end(fs.readFileSync(file));
 }catch{if(!res.headersSent)send(res,500,JSON.stringify({error:'Server error'}));}
});
server.listen(PORT,()=>console.log(`CENB http://localhost:${PORT} · poker server ${POKER_URL}`));
for(const sig of ['SIGTERM','SIGINT'])process.on(sig,()=>{server.close();setTimeout(()=>process.exit(0),1500).unref();});
