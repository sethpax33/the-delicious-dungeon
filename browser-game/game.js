const c=document.getElementById("game"),x=c.getContext("2d"),W=c.width,H=c.height,S=48;
const keys={},mouse={x:W/2,y:H/2};let last=0,food=0,coins=0,kills=0,hp=100,attackCD=0,msgCD=0;
onkeydown=e=>keys[e.key.toLowerCase()]=1;onkeyup=e=>keys[e.key.toLowerCase()]=0;
c.onmousemove=e=>{const r=c.getBoundingClientRect();mouse.x=(e.clientX-r.left)*W/r.width;mouse.y=(e.clientY-r.top)*H/r.height};
c.onmousedown=attack;
const rooms=[{x:1,y:1,w:7,h:5},{x:10,y:1,w:6,h:5},{x:19,y:1,w:6,h:5},{x:4,y:9,w:7,h:4},{x:14,y:8,w:8,h:5}],floor=Array.from({length:15},()=>Array(26).fill(0));
function room(r){for(let y=r.y;y<r.y+r.h;y++)for(let xx=r.x;xx<r.x+r.w;xx++)floor[y][xx]=1}
rooms.forEach(room);
function hall(a,b,cx,cy){for(let xx=Math.min(a,cx);xx<=Math.max(a,cx);xx++)floor[b][xx]=1;for(let y=Math.min(b,cy);y<=Math.max(b,cy);y++)floor[y][cx]=1}
hall(7,3,10,3);hall(16,3,19,3);hall(6,5,6,9);hall(17,5,17,8);hall(10,10,14,10);
const p={x:6*S,y:3*S,r:17,s:210,hit:0},enemies=[],items=[];
function spawn(gx,gy,brute=false){enemies.push({x:gx*S+24,y:gy*S+24,r:brute?21:17,hp:brute?60:30,max:brute?60:30,sp:brute?48:68,cd:0,flash:0,brute})}
spawn(12,3);spawn(21,3);spawn(7,11);spawn(18,10,1);spawn(4,3);
[[4,3],[12,3],[21,3],[8,11],[18,10],[20,11]].forEach(q=>items.push({x:q[0]*S+24,y:q[1]*S+24}));
const fire={x:16*S+24,y:10*S+24},sparks=[];
function blocked(px,py,r){const gx=Math.floor(px/S),gy=Math.floor(py/S);for(let yy=gy-1;yy<=gy+1;yy++)for(let xx=gx-1;xx<=gx+1;xx++)if(yy<0||xx<0||yy>=15||xx>=26||!floor[yy][xx]){const qx=Math.max(xx*S,Math.min(px,(xx+1)*S)),qy=Math.max(yy*S,Math.min(py,(yy+1)*S));if(Math.hypot(px-qx,py-qy)<r)return 1}return 0}
function move(o,dx,dy){if(!blocked(o.x+dx,o.y,o.r))o.x+=dx;if(!blocked(o.x,o.y+dy,o.r))o.y+=dy}
function attack(){if(attackCD>0)return;attackCD=.35;const a=Math.atan2(mouse.y-p.y,mouse.x-p.x);sparks.push({x:p.x+Math.cos(a)*35,y:p.y+Math.sin(a)*35,t:.2,a});enemies.forEach(e=>{const d=Math.hypot(e.x-p.x,e.y-p.y),ea=Math.atan2(e.y-p.y,e.x-p.x),df=Math.atan2(Math.sin(ea-a),Math.cos(ea-a));if(d<75&&Math.abs(df)<1.1){e.hp-=25;e.flash=.1;if(e.hp<=0){kills++;coins+=5;show("Monster defeated!");setTimeout(()=>{const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1)},0)}}})}
function show(t){document.getElementById("msg").textContent=t;document.getElementById("msg").style.opacity=1;msgCD=1.5}
function update(dt){attackCD=Math.max(0,attackCD-dt);p.hit=Math.max(0,p.hit-dt);let dx=(keys.d||keys.arrowright)-(keys.a||keys.arrowleft),dy=(keys.s||keys.arrowdown)-(keys.w||keys.arrowup),l=Math.hypot(dx,dy)||1;move(p,dx/l*p.s*dt,dy/l*p.s*dt);
enemies.forEach(e=>{e.cd=Math.max(0,e.cd-dt);e.flash=Math.max(0,e.flash-dt);const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy);if(d>35)move(e,dx/d*e.sp*dt,dy/d*e.sp*dt);else if(e.cd===0){e.cd=1.1;hp-=e.brute?9:5;if(hp<=0){hp=100;p.x=6*S;p.y=3*S;show("You wake at the entrance...")}}});
for(let i=items.length-1;i>=0;i--)if(Math.hypot(p.x-items[i].x,p.y-items[i].y)<28){items.splice(i,1);food++;coins++;show("Ingredient found!")}
if(keys.e&&Math.hypot(p.x-fire.x,p.y-fire.y)<70&&food>=3){keys.e=0;food-=3;hp=Math.min(100,hp+35);show("Hearty meal! +35 HP")}
sparks.forEach(s=>s.t-=dt);while(sparks.length&&sparks[0].t<=0)sparks.shift();if(msgCD>0&&(msgCD-=dt)<=0)document.getElementById("msg").style.opacity=0;
document.getElementById("hp").textContent=Math.ceil(hp);document.getElementById("food").textContent=food;document.getElementById("coins").textContent=coins;document.getElementById("kills").textContent=kills}
function draw(){x.fillStyle="#0b0907";x.fillRect(0,0,W,H);
for(let y=0;y<15;y++)for(let xx=0;xx<26;xx++){if(floor[y][xx]){x.fillStyle=(xx+y)%2?"#40372e":"#493f34";x.fillRect(xx*S,y*S,S,S);x.strokeStyle="#29221d";x.strokeRect(xx*S,y*S,S,S)}else{x.fillStyle="#211c18";x.fillRect(xx*S,y*S,S,S)}}
[[2,2],[12,2],[21,2],[5,10],[17,9]].forEach(q=>{const g=x.createRadialGradient(q[0]*S+24,q[1]*S+24,3,q[0]*S+24,q[1]*S+24,110);g.addColorStop(0,"#ffb34d55");g.addColorStop(1,"transparent");x.fillStyle=g;x.fillRect(q[0]*S-80,q[1]*S-80,208,208);x.fillStyle="#ffb34d";x.beginPath();x.arc(q[0]*S+24,q[1]*S+20,6,0,7);x.fill()});
x.fillStyle="#33231a";x.beginPath();x.arc(fire.x,fire.y+10,31,0,7);x.fill();x.fillStyle="#e36b27";x.beginPath();x.arc(fire.x,fire.y,18,0,7);x.fill();x.fillStyle="#ffd36a";x.beginPath();x.arc(fire.x,fire.y-5,10,0,7);x.fill();
items.forEach(i=>{x.fillStyle="#6e9e52";x.beginPath();x.arc(i.x,i.y,12,0,7);x.fill();x.fillStyle="#e7d7a0";x.beginPath();x.arc(i.x-3,i.y-3,4,0,7);x.fill()});
enemies.forEach(e=>{x.fillStyle=e.flash?"#fff":e.brute?"#a44e45":"#7d4e8c";x.beginPath();x.arc(e.x,e.y,e.r,0,7);x.fill();x.fillStyle="#17110e";x.beginPath();x.arc(e.x-6,e.y-3,3,0,7);x.arc(e.x+6,e.y-3,3,0,7);x.fill();x.fillStyle="#1a100d";x.fillRect(e.x-20,e.y-e.r-10,40,5);x.fillStyle="#c74b39";x.fillRect(e.x-20,e.y-e.r-10,40*(e.hp/e.max),5)});
const a=Math.atan2(mouse.y-p.y,mouse.x-p.x);x.save();x.translate(p.x,p.y);x.rotate(a);x.fillStyle=p.hit?"#fff":"#d7b47b";x.beginPath();x.arc(0,0,p.r,0,7);x.fill();x.fillStyle="#6d3c26";x.fillRect(7,-4,40,8);x.fillStyle="#ddd";x.fillRect(42,-6,18,12);x.restore();
sparks.forEach(s=>{x.globalAlpha=Math.min(1,s.t*6);x.strokeStyle="#ffd36a";x.lineWidth=5;x.beginPath();x.arc(s.x,s.y,35,s.a-1,s.a+1);x.stroke();x.globalAlpha=1})}
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);