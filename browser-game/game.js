const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const W=canvas.width,H=canvas.height,TILE=48;
const keys=new Set();
const mouse={x:W/2,y:H/2,down:false};
let last=performance.now(),food=0,coins=0,kills=0,hp=100,attackCD=0,messageTimer=0,messageText="";
const images={player:new Image(),slime:new Image(),brute:new Image(),ingredient:new Image(),torch:new Image()};
for(const [name,img] of Object.entries(images)){img.src="assets/"+name+".svg";}

window.addEventListener("keydown",e=>{
  const k=e.key.toLowerCase();
  if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","e"," "].includes(k)) e.preventDefault();
  keys.add(k);
});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>keys.clear());

function mousePos(e){const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*W/r.width;mouse.y=(e.clientY-r.top)*H/r.height;}
canvas.addEventListener("mousemove",mousePos);
canvas.addEventListener("mousedown",e=>{if(e.button===0){mousePos(e);mouse.down=true;attack();}});
window.addEventListener("mouseup",()=>mouse.down=false);

const rooms=[
 {x:1,y:1,w:7,h:5},{x:10,y:1,w:6,h:5},{x:19,y:1,w:6,h:5},
 {x:4,y:9,w:7,h:4},{x:14,y:8,w:8,h:5}
];
const floor=Array.from({length:15},()=>Array(26).fill(false));
for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)floor[y][x]=true;
function hall(x1,y1,x2,y2){
  for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)floor[y1][x]=true;
  for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)floor[y][x2]=true;
}
hall(7,3,10,3);hall(16,3,19,3);hall(6,5,6,9);hall(17,5,17,8);hall(10,10,14,10);

const player={x:6*TILE+24,y:3*TILE+24,r:16,speed:205,inv:0};
const enemies=[];
const items=[];
const sparks=[];
const fire={x:16*TILE+24,y:10*TILE+24};

function spawn(gx,gy,brute=false){
 enemies.push({x:gx*TILE+24,y:gy*TILE+24,r:brute?25:21,hp:brute?70:35,max:brute?70:35,speed:brute?52:76,cd:0,flash:0,brute});
}
spawn(12,3);spawn(21,3);spawn(7,11);spawn(18,10,true);spawn(4,3);
[[4,3],[12,3],[21,3],[8,11],[18,10],[20,11]].forEach(([gx,gy])=>items.push({x:gx*TILE+24,y:gy*TILE+24,bob:Math.random()*6}));

function solidAt(px,py,r){
 const minX=Math.floor((px-r)/TILE),maxX=Math.floor((px+r)/TILE);
 const minY=Math.floor((py-r)/TILE),maxY=Math.floor((py+r)/TILE);
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
   if(y<0||x<0||y>=15||x>=26||!floor[y][x]){
     const rx=Math.max(x*TILE,Math.min(px,(x+1)*TILE));
     const ry=Math.max(y*TILE,Math.min(py,(y+1)*TILE));
     if(Math.hypot(px-rx,py-ry)<r) return true;
   }
 }
 return false;
}
function move(o,dx,dy){
 if(!solidAt(o.x+dx,o.y,o.r))o.x+=dx;
 if(!solidAt(o.x,o.y+dy,o.r))o.y+=dy;
}
function say(text){messageText=text;messageTimer=1.35;document.getElementById("msg").textContent=text;document.getElementById("msg").style.opacity=1;}

function attack(){
 if(attackCD>0)return;
 attackCD=.32;
 const angle=Math.atan2(mouse.y-player.y,mouse.x-player.x);
 sparks.push({x:player.x+Math.cos(angle)*35,y:player.y+Math.sin(angle)*35,t:.22,a:angle});
 for(const e of enemies){
   const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);
   const ea=Math.atan2(dy,dx),diff=Math.atan2(Math.sin(ea-angle),Math.cos(ea-angle));
   if(d<82&&Math.abs(diff)<1.05){
     e.hp-=28;e.flash=.1;
     sparks.push({x:e.x,y:e.y,t:.18,a:ea});
     if(e.hp<=0){
       kills++;coins+=5;
       say("Monster defeated! +5 coins");
       setTimeout(()=>{const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1);},0);
     }
   }
 }
}

function update(dt){
 attackCD=Math.max(0,attackCD-dt);
 player.inv=Math.max(0,player.inv-dt);
 let dx=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);
 let dy=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0);
 const len=Math.hypot(dx,dy);
 if(len){dx/=len;dy/=len;move(player,dx*player.speed*dt,dy*player.speed*dt);}
 if(mouse.down)attack();

 for(const e of enemies){
   e.cd=Math.max(0,e.cd-dt);e.flash=Math.max(0,e.flash-dt);
   const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;
   if(d>48)move(e,dx/d*e.speed*dt,dy/d*e.speed*dt);
   else if(e.cd===0&&player.inv===0){
     e.cd=1.05;hp-=e.brute?10:6;player.inv=.45;
     if(hp<=0){hp=100;player.x=6*TILE+24;player.y=3*TILE+24;say("You wake at the entrance...");}
   }
 }
 for(let i=items.length-1;i>=0;i--){
   items[i].bob+=dt*3;
   if(Math.hypot(player.x-items[i].x,player.y-items[i].y)<30){
     items.splice(i,1);food++;coins++;say("Ingredient found! +1 coin");
   }
 }
 if(keys.has("e")&&Math.hypot(player.x-fire.x,player.y-fire.y)<72&&food>=3){
   keys.delete("e");food-=3;hp=Math.min(100,hp+35);say("Hearty meal! +35 HP");
 }
 for(const s of sparks)s.t-=dt;
 while(sparks.length&&sparks[0].t<=0)sparks.shift();
 if(messageTimer>0&&(messageTimer-=dt)<=0)document.getElementById("msg").style.opacity=0;
 document.getElementById("hp").textContent=Math.ceil(hp);
 document.getElementById("food").textContent=food;
 document.getElementById("coins").textContent=coins;
 document.getElementById("kills").textContent=kills;
}

function drawFloor(){
 ctx.fillStyle="#0b0806";ctx.fillRect(0,0,W,H);
 for(let y=0;y<15;y++)for(let x=0;x<26;x++){
   const px=x*TILE,py=y*TILE;
   if(floor[y][x]){
     ctx.fillStyle=(x+y)%2?"#51483d":"#5b5044";ctx.fillRect(px,py,TILE,TILE);
     ctx.strokeStyle="#302820";ctx.lineWidth=2;ctx.strokeRect(px+1,py+1,TILE-2,TILE-2);
     ctx.fillStyle="rgba(255,240,200,.025)";
     ctx.fillRect(px+5,py+5,TILE-10,5);
     if((x*17+y*31)%9===0){ctx.fillStyle="rgba(20,14,10,.18)";ctx.fillRect(px+10,py+29,18,3);}
   }else{
     ctx.fillStyle="#1b1511";ctx.fillRect(px,py,TILE,TILE);
     ctx.fillStyle="#261d17";ctx.fillRect(px+4,py+4,TILE-8,TILE-8);
   }
 }
 // wall edge shadows
 for(let y=0;y<15;y++)for(let x=0;x<26;x++)if(floor[y][x]){
   ctx.fillStyle="rgba(0,0,0,.35)";
   if(y===0||!floor[y-1][x])ctx.fillRect(x*TILE,y*TILE,TILE,5);
   if(x===0||!floor[y][x-1])ctx.fillRect(x*TILE,y*TILE,5,TILE);
 }
}

function drawTorches(){
 const spots=[[2,2],[12,2],[21,2],[5,10],[17,9]];
 for(const [gx,gy] of spots){
   const px=gx*TILE+24,py=gy*TILE+25;
   const g=ctx.createRadialGradient(px,py,5,px,py,135);
   g.addColorStop(0,"rgba(255,194,90,.24)");g.addColorStop(1,"rgba(255,120,30,0)");
   ctx.fillStyle=g;ctx.fillRect(px-140,py-140,280,280);
   if(images.torch.complete)ctx.drawImage(images.torch,px-20,py-38,40,60);
 }
}

function drawFire(){
 ctx.fillStyle="#2c1c14";ctx.beginPath();ctx.ellipse(fire.x,fire.y+16,34,17,0,0,Math.PI*2);ctx.fill();
 for(let i=0;i<3;i++){ctx.fillStyle=i===0?"#ffdc72":i===1?"#f4772c":"#b52e1d";ctx.beginPath();ctx.arc(fire.x+(i-1)*8,fire.y-4-(i%2)*4,13-i*2,0,Math.PI*2);ctx.fill();}
}

function draw(){
 drawFloor();drawTorches();drawFire();
 for(const item of items){
   const y=item.y+Math.sin(item.bob)*4;
   if(images.ingredient.complete)ctx.drawImage(images.ingredient,item.x-22,y-22,44,44);
   ctx.fillStyle="rgba(210,240,150,.35)";ctx.beginPath();ctx.arc(item.x,y,28,0,Math.PI*2);ctx.fill();
 }
 for(const e of enemies){
   const size=e.brute?58:50;
   if(images[e.brute?"brute":"slime"].complete)ctx.drawImage(images[e.brute?"brute":"slime"],e.x-size/2,e.y-size/2,size,size);
   ctx.fillStyle="rgba(0,0,0,.5)";ctx.fillRect(e.x-25,e.y-e.r-12,50,6);
   ctx.fillStyle="#d84c3c";ctx.fillRect(e.x-25,e.y-e.r-12,50*Math.max(0,e.hp/e.max),6);
 }
 const angle=Math.atan2(mouse.y-player.y,mouse.x-player.x);
 ctx.save();ctx.translate(player.x,player.y);ctx.rotate(angle);
 if(images.player.complete)ctx.drawImage(images.player,-30,-30,60,60);
 ctx.fillStyle="#e8e1cf";ctx.fillRect(18,-4,43,8);ctx.fillStyle="#6b3b25";ctx.fillRect(13,-6,10,12);
 ctx.restore();
 for(const s of sparks){
   ctx.globalAlpha=Math.min(1,s.t*6);ctx.strokeStyle="#ffd56e";ctx.lineWidth=5;
   ctx.beginPath();ctx.arc(s.x,s.y,32,s.a-.9,s.a+.9);ctx.stroke();ctx.globalAlpha=1;
 }
 // vignette
 const v=ctx.createRadialGradient(W/2,H/2,230,W/2,H/2,760);
 v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.48)");
 ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}

function loop(now){
 const dt=Math.min(.033,(now-last)/1000);last=now;
 update(dt);draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
