import HTML from './index.html';
const esc=s=>String(s||'').replace(/[\r\n]+/g,' ').slice(0,200);
export default{async fetch(req,env){const u=new URL(req.url);
if(u.pathname==='/api/contact'){if(req.method!=='POST')return new Response('Method not allowed',{status:405});
let d;try{d=await req.json()}catch{return Response.json({ok:false,error:'bad json'},{status:400})}
if(d.website)return Response.json({ok:true});
if(!d.name||!d.email||!d.message||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))return Response.json({ok:false,error:'missing fields'},{status:400});
const rec={ts:new Date().toISOString(),name:esc(d.name),email:esc(d.email),topic:esc(d.topic),message:String(d.message).slice(0,5000),ip:req.headers.get('cf-connecting-ip')};
let stored=false,mailed=false,err;
if(env.SUBMISSIONS){await env.SUBMISSIONS.put(`msg:${rec.ts}:${crypto.randomUUID()}`,JSON.stringify(rec));stored=true}
if(env.MAIL){try{const {EmailMessage}=await import('cloudflare:email');
const raw=[`From: Parapid website <${env.FROM}>`,`To: ${env.TO}`,`Reply-To: ${rec.email}`,`Subject: [parapid.com] ${rec.topic} - ${rec.name}`,`Message-ID: <${crypto.randomUUID()}@${env.FROM.split('@')[1]}>`,`Date: ${new Date().toUTCString()}`,'MIME-Version: 1.0','Content-Type: text/plain; charset=utf-8','',`Name: ${rec.name}\nEmail: ${rec.email}\nTopic: ${rec.topic}\n\n${rec.message}`].join('\r\n');
await env.MAIL.send(new EmailMessage(env.FROM,env.TO,raw));mailed=true}catch(e){err=String(e)}}
if(env.SUBMISSIONS)await env.SUBMISSIONS.put(`result:${rec.ts}`,JSON.stringify({mailed,err}));if(err)console.log('mail error',err);return Response.json({ok:mailed,stored},{status:mailed?200:502})}
return new Response(HTML,{headers:{'content-type':'text/html;charset=utf-8'}})}};
