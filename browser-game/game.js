import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas=document.getElementById("game");
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x090705);
scene.fog=new THREE.FogExp2(0x090705,.028);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,180);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;

const ui={
 home:document.getElementById("homeScreen"),levels:document.getElementById("levelScreen"),settings:document.getElementById("settingsScreen"),pause:document.getElementById("pauseScreen"),
 hud:document.getElementById("hud"),hint:document.getElementById("hint"),cross:document.getElementById("crosshair"),msg:document.getElementById("msg"),
 hp:document.getElementById("hp"),food:document.getElementById("food"),coins:document.getElementById("coins"),kills:document.getElementById("kills"),
 levelLabel:document.getElementById("levelLabel"),bossBar:document.getElementById("bossBar"),bossHp:document.getElementById("bossHp"),bossName:document.getElementById("bossName")
};
const state={screen:"home",level:1,unlocked:1,food:0,coins:0,kills:0,hp:100,sensitivity:1,volume:.7,shake:true,saveSlot:0};
const keys=new Set();
const enemies=[],arrows=[],particles=[],pickups=[];
let dungeonGroup=null,playerGroup=null,bow=null,bowString=null;
let yaw=0,pitch=.38,last=performance.now(),shotCD=0,msgTimer=0,shakeTimer=0,victoryTimer=null;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);

function showScreen(name){
 [ui.home,ui.levels,ui.settings,ui.pause].forEach(e=>e.classList.add("hidden"));
 if(name)ui[name].classList.remove("hidden");
 state.screen=name||"game";
 const playing=state.screen==="game";
 ui.hud.classList.toggle("hidden",!playing);ui.hint.classList.toggle("hidden",!playing);ui.cross.classList.toggle("hidden",!playing);
}
function say(text,ms=1500){ui.msg.textContent=text;ui.msg.style.opacity=1;msgTimer=ms/1000;}
function save(slot=state.saveSlot){
 const data={level:state.level,unlocked:state.unlocked,food:state.food,coins:state.coins,kills:state.kills,hp:state.hp,sensitivity:state.sensitivity,volume:state.volume,shake:state.shake};
 localStorage.setItem("deliciousDungeonSave"+slot,JSON.stringify(data));state.saveSlot=slot;say("Save file "+(slot+1)+" saved.");
}
function load(slot=state.saveSlot){
 const raw=localStorage.getItem("deliciousDungeonSave"+slot);
 if(!raw){say("No save file in slot "+(slot+1));return false;}
 Object.assign(state,JSON.parse(raw),{saveSlot:slot});applySettings();renderLevels();say("Save file "+(slot+1)+" loaded.");return true;
}
function applySettings(){
 document.getElementById("sens").value=state.sensitivity;document.getElementById("sensValue").textContent=Number(state.sensitivity).toFixed(2);
 document.getElementById("volume").value=state.volume;document.getElementById("volumeValue").textContent=Math.round(state.volume*100)+"%";
 document.getElementById("shake").checked=state.shake;
}

const hemi=new THREE.HemisphereLight(0x9aa5b8,0x20150d,1.25);scene.add(hemi);
const moon=new THREE.DirectionalLight(0xb9c7e8,1.7);moon.position.set(-20,32,18);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);moon.shadow.camera.left=-45;moon.shadow.camera.right=45;moon.shadow.camera.top=45;moon.shadow.camera.bottom=-45;scene.add(moon);
function mat(color,rough=.85,metal=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
const floorMat=mat(0x5a5045),wallMat=mat(0x3c322a),woodMat=mat(0x69432a),goldMat=mat(0xc9954e,.35,.4);
function box(w,h,d,material,x,y,z,shadow=true){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;dungeonGroup.add(m);return m;
}
function buildDungeon(level){
 if(dungeonGroup)scene.remove(dungeonGroup);
 dungeonGroup=new THREE.Group();scene.add(dungeonGroup);
 enemies.length=0;arrows.length=0;particles.length=0;pickups.length=0;
 const size=level===1?30:level===2?38:46,half=size/2;
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(size,size),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;dungeonGroup.add(floor);
 for(let i=-half;i<=half;i+=4){box(.25,.15,size,wallMat,i,.08,0,false);box(size,.15,.25,wallMat,0,.08,i,false);}
 const wallCount=level*18+10;
 for(let i=0;i<wallCount;i++){
   const horizontal=Math.random()>.5,len=rand(2.5,7),x=rand(-half+3,half-3),z=rand(-half+3,half-3);
   if(Math.hypot(x,z)<5)continue;box(horizontal?len:.65,rand(1.7,3),horizontal?.65:len,wallMat,x,rand(.85,1.5),z);
 }
 for(let i=0;i<Math.floor(size/5);i++){
   const x=-half+4+i*5,z=-half+3+(i%2)*5;
   box(1.2,3.5,1.2,wallMat,x,1.75,z);
   const light=new THREE.PointLight(0xff9a3d,2.5,9,2);light.position.set(x,2.5,z);light.castShadow=true;dungeonGroup.add(light);
   const flame=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),new THREE.MeshBasicMaterial({color:0xffb24b}));flame.position.set(x,3.1,z);dungeonGroup.add(flame);
 }
 const fire=box(2.2,.35,2.2,woodMat,0,.18,0);fire.rotation.y=.2;
 const flame=new THREE.Mesh(new THREE.ConeGeometry(.8,1.5,12),new THREE.MeshBasicMaterial({color:0xff7b27}));flame.position.set(0,1,0);dungeonGroup.add(flame);
 for(let i=0;i<5+level*2;i++){const p=makePickup(rand(-half+3,half-3),rand(-half+3,half-3));pickups.push(p);dungeonGroup.add(p);}
 const count=level===3?7+level*2:5+level*2;
 for(let i=0;i<count;i++)spawnEnemy(rand(-half+4,half-4),rand(-half+4,half-4),i%3===2&&level>1);
 if(level===3)spawnBoss(0,-half+7);
}
function makePickup(x,z){
 const g=new THREE.Group(),orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.35,1),mat(0x86b85c,.55));
 orb.position.y=.7;orb.castShadow=true;g.add(orb);
 const glow=new THREE.PointLight(0x9bd76b,.8,3);glow.position.y=.7;g.add(glow);g.position.set(x,0,z);g.userData.baseY=.7;return g;
}
function makeEnemyModel(brute=false,boss=false){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.SphereGeometry(boss?1.5:brute?1.15:.9,20,16),mat(boss?0x6e2430:brute?0x9c473b:0x744c87,.72));
 body.scale.y=brute||boss?1.15:1;body.position.y=boss?1.9:1.25;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(boss?1.05:brute?.8:.65,18,14),mat(boss?0x812f3e:brute?0xb45a48:0x9360a8,.7));
 head.position.y=boss?3.2:2.15;head.castShadow=true;g.add(head);
 for(const sx of [-.32,.32]){
   const eye=new THREE.Mesh(new THREE.SphereGeometry(boss?.15:.11,10,8),new THREE.MeshStandardMaterial({color:0xffd27a,emissive:0xff4d24,emissiveIntensity:2}));
   eye.position.set(sx*(boss?1.2:1),boss?3.25:2.25,.65);g.add(eye);
 }
 return g;
}
function spawnEnemy(x,z,brute=false){
 const model=makeEnemyModel(brute,false);model.position.set(x,0,z);dungeonGroup.add(model);
 enemies.push({model,x,z,hp:brute?85:42,max:brute?85:42,speed:brute?1.9:2.7,brute,cd:rand(.2,1),phase:rand(0,6),hurt:0});
}
function spawnBoss(x,z){
 const model=makeEnemyModel(true,true);model.position.set(x,0,z);dungeonGroup.add(model);
 enemies.push({model,x,z,hp:650,max:650,speed:1.45,brute:true,boss:true,cd:1.2,phase:0,hurt:0});
 ui.bossBar.classList.remove("hidden");ui.bossName.textContent="THE DUNGEON DEVOURER";
}
function clearWorld(){if(playerGroup)scene.remove(playerGroup);enemies.length=0;arrows.length=0;pickups.length=0;particles.length=0;ui.bossBar.classList.add("hidden");}
function createPlayer(){
 playerGroup=new THREE.Group();scene.add(playerGroup);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.05,6,12),mat(0xd0a05d,.72));torso.position.y=1.15;torso.castShadow=true;playerGroup.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.5,18,14),mat(0xe0b16f,.72));head.position.y=2.1;head.castShadow=true;playerGroup.add(head);
 const hood=new THREE.Mesh(new THREE.ConeGeometry(.62,.85,18),mat(0x5b3828,.9));hood.position.y=2.5;hood.castShadow=true;playerGroup.add(hood);
 for(const sx of [-.22,.22]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.065,8,6),new THREE.MeshStandardMaterial({color:0x17100c,roughness:.4}));eye.position.set(sx,2.12,.45);playerGroup.add(eye);}
 bow=new THREE.Group();
 const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,-.85,0),new THREE.Vector3(.62,0,0),new THREE.Vector3(0,.85,0));
 const pts=curve.getPoints(24),geo=new THREE.BufferGeometry().setFromPoints(pts),line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x9a6035}));
 line.rotation.z=-.18;bow.add(line);
 bowString=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-.85,.01),new THREE.Vector3(0,.85,.01)]),new THREE.LineBasicMaterial({color:0xdccfb4}));
 bow.add(bowString);bow.position.set(.8,1.45,.35);bow.rotation.y=Math.PI/2;playerGroup.add(bow);
}
function startLevel(level){
 state.level=level;showScreen(null);if(document.pointerLockElement!==canvas)canvas.requestPointerLock?.();
 clearWorld();createPlayer();buildDungeon(level);playerGroup.position.set(0,0,6);yaw=0;pitch=.38;shotCD=0;ui.levelLabel.textContent="LEVEL "+level;
 say(level===3?"THE DEVOURER AWAITS...":"LEVEL "+level+" — ENTER THE DUNGEON",1600);
}
function renderLevels(){
 const wrap=document.getElementById("levelButtons");wrap.innerHTML="";
 for(let i=1;i<=3;i++){
   const b=document.createElement("button");b.className=i<=state.unlocked?"":"locked";
   b.innerHTML=i<=state.unlocked?("<strong>LEVEL "+i+"</strong><small>"+(i===3?"BOSS FLOOR":"DUNGEON DEPTH "+i)+"</small>"):("<strong>🔒 LEVEL "+i+"</strong><small>Complete the previous level</small>");
   b.disabled=i>state.unlocked;b.onclick=()=>startLevel(i);wrap.appendChild(b);
 }
}
function completeLevel(){
 if(victoryTimer)return;
 victoryTimer=setTimeout(()=>{victoryTimer=null;state.unlocked=Math.max(state.unlocked,Math.min(3,state.level+1));save(state.saveSlot);renderLevels();showScreen("levels");},1400);
 say(state.level===3?"BOSS DEFEATED!":"LEVEL COMPLETE! NEXT LEVEL UNLOCKED",1400);
}
function fireArrow(){
 if(state.screen!=="game"||shotCD>0)return;
 shotCD=.42;
 const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)).negate(),pos=playerGroup.position.clone().add(new THREE.Vector3(0,1.6,0)),dir=forward.clone();
 dir.y=Math.sin(pitch);dir.normalize();
 const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.25,8),woodMat);shaft.rotation.z=Math.PI/2;shaft.castShadow=true;
 const head=new THREE.Mesh(new THREE.ConeGeometry(.11,.3,8),goldMat);head.rotation.z=-Math.PI/2;head.position.x=.78;shaft.add(head);
 shaft.position.copy(pos);shaft.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),dir);scene.add(shaft);
 arrows.push({mesh:shaft,dir,life:2.5,speed:24});bow.scale.z=.65;setTimeout(()=>{if(bow)bow.scale.z=1},120);
}
function hitEnemy(e,damage){
 e.hp-=damage;e.hurt=.16;
 for(let i=0;i<8;i++)spawnParticle(e.model.position.clone().add(new THREE.Vector3(0,1.5,0)),0xffb34d);
 if(e.hp<=0){state.kills++;state.coins+=e.boss?50:e.brute?10:5;e.dead=true;say(e.boss?"THE DEVOURER FALLS!":"Monster defeated!");}
}
function spawnParticle(pos,color){
 const m=new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),new THREE.MeshBasicMaterial({color}));m.position.copy(pos);scene.add(m);
 particles.push({mesh:m,life:.5,v:new THREE.Vector3(rand(-3,3),rand(1,5),rand(-3,3))});
}
function updateArrows(dt){
 for(let i=arrows.length-1;i>=0;i--){
   const a=arrows[i];a.mesh.position.addScaledVector(a.dir,a.speed*dt);a.life-=dt;let hit=false;
   for(const e of enemies)if(!e.dead){
     const target=e.model.position.clone().add(new THREE.Vector3(0,1.5,0));
     if(a.mesh.position.distanceTo(target)<(e.boss?1.7:e.brute?1.25:1.0)){hitEnemy(e,e.boss?18:e.brute?30:35);hit=true;break;}
   }
   if(a.life<=0||hit){scene.remove(a.mesh);arrows.splice(i,1);}
 }
}
function updateEnemies(dt,time){
 for(let i=enemies.length-1;i>=0;i--){
   const e=enemies[i];if(e.dead){e.model.scale.multiplyScalar(Math.max(0,1-dt*3));e.model.rotation.z+=dt*4;if(e.model.scale.x<.06){scene.remove(e.model);enemies.splice(i,1);}continue;}
   e.hurt=Math.max(0,e.hurt-dt);e.cd-=dt;e.phase+=dt;
   const dx=playerGroup.position.x-e.model.position.x,dz=playerGroup.position.z-e.model.position.z,d=Math.hypot(dx,dz)||1;
   if(d>2.3){e.model.position.x+=dx/d*e.speed*dt;e.model.position.z+=dz/d*e.speed*dt;}
   else if(e.cd<=0){e.cd=e.boss?1.7:1.2;state.hp-=e.boss?16:e.brute?10:6;shakeTimer=.22;if(state.hp<=0){state.hp=100;playerGroup.position.set(0,0,6);say("You wake at the entrance...");}}
   e.model.position.y=Math.sin(e.phase*4)*.08;e.model.rotation.y=Math.atan2(dx,dz);
   if(e.boss&&Math.sin(e.phase*3)>0.96)spawnParticle(e.model.position.clone().add(new THREE.Vector3(0,1,0)),0xff4d38);
 }
}
function updatePlayer(dt,time){
 let forward=(keys.has("w")||keys.has("arrowup")?1:0)-(keys.has("s")||keys.has("arrowdown")?1:0),side=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);
 const len=Math.hypot(forward,side)||1;if(forward||side){forward/=len;side/=len;const speed=5.2,dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new THREE.Vector3(dir.z,0,-dir.x);
   playerGroup.position.addScaledVector(dir,forward*speed*dt);playerGroup.position.addScaledVector(right,side*speed*dt);playerGroup.position.y=Math.sin(time*12)*.04;
   playerGroup.rotation.y=Math.atan2((dir.x*forward+right.x*side),(dir.z*forward+right.z*side));
 }else playerGroup.position.y=Math.sin(time*3)*.025;
 playerGroup.position.x=clamp(playerGroup.position.x,-22,22);playerGroup.position.z=clamp(playerGroup.position.z,-22,22);
}
function updatePickups(time){
 for(const p of pickups){p.position.y=Math.sin(time*2+p.userData.baseY)*.15;p.rotation.y+=.015;}
 for(let i=pickups.length-1;i>=0;i--)if(playerGroup.position.distanceTo(pickups[i].position)<1.3){dungeonGroup.remove(pickups[i]);pickups.splice(i,1);state.food++;state.coins++;say("Ingredient found! +1 coin");}
}
function updateParticles(dt){
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=8*dt;p.mesh.position.addScaledVector(p.v,dt);p.mesh.scale.setScalar(Math.max(.01,p.life*2));if(p.life<=0){scene.remove(p.mesh);particles.splice(i,1);}}
}
function updateCamera(dt){
 const target=playerGroup.position.clone().add(new THREE.Vector3(0,1.65,0)),dist=7.2;
 const desired=target.clone().add(new THREE.Vector3(Math.sin(yaw)*dist*Math.cos(pitch),dist*Math.sin(pitch),Math.cos(yaw)*dist*Math.cos(pitch)));
 camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(target);
 if(state.shake&&shakeTimer>0){shakeTimer-=dt;camera.position.x+=rand(-.12,.12);camera.position.y+=rand(-.08,.08);}
}
function updateHud(){
 ui.hp.textContent=Math.max(0,Math.ceil(state.hp));ui.food.textContent=state.food;ui.coins.textContent=state.coins;ui.kills.textContent=state.kills;
 const boss=enemies.find(e=>e.boss&&!e.dead);ui.bossBar.classList.toggle("hidden",!boss);
 if(boss)ui.bossHp.style.width=(100*boss.hp/boss.max)+"%";
}
function checkVictory(){if(state.screen==="game"&&enemies.length===0&&!victoryTimer)completeLevel();}

canvas.addEventListener("click",()=>{if(state.screen==="game")canvas.requestPointerLock?.();});
document.addEventListener("mousemove",e=>{if(state.screen!=="game"||document.pointerLockElement!==canvas)return;yaw-=e.movementX*.0024*state.sensitivity;pitch=clamp(pitch-e.movementY*.0018*state.sensitivity,-.15,.85);});
document.addEventListener("mousedown",e=>{if(state.screen==="game"&&e.button===0)fireArrow();});
document.addEventListener("pointerlockchange",()=>{if(state.screen==="game"&&document.pointerLockElement!==canvas){showScreen("pause");}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&state.screen==="game"){document.exitPointerLock?.();showScreen("pause");}});
document.getElementById("playBtn").onclick=()=>{renderLevels();showScreen("levels");};
document.getElementById("continueBtn").onclick=()=>{renderLevels();showScreen("levels");};
document.getElementById("settingsBtn").onclick=()=>{applySettings();showScreen("settings");};
document.getElementById("levelBackBtn").onclick=()=>showScreen("home");
document.getElementById("resumeBtn").onclick=()=>{showScreen(null);canvas.requestPointerLock?.();};
document.getElementById("quitBtn").onclick=()=>{document.exitPointerLock?.();showScreen("home");};
document.getElementById("pauseSettingsBtn").onclick=()=>{applySettings();showScreen("settings");};
document.getElementById("settingsBackBtn").onclick=()=>{renderLevels();showScreen("home");};
document.getElementById("sens").oninput=e=>{state.sensitivity=Number(e.target.value);document.getElementById("sensValue").textContent=state.sensitivity.toFixed(2);};
document.getElementById("volume").oninput=e=>{state.volume=Number(e.target.value);document.getElementById("volumeValue").textContent=Math.round(state.volume*100)+"%";};
document.getElementById("shake").onchange=e=>state.shake=e.target.checked;
document.getElementById("saveBtn").onclick=()=>save(state.saveSlot);
document.getElementById("loadBtn").onclick=()=>load(state.saveSlot);
const slots=document.getElementById("saveSlots");
for(let i=0;i<3;i++){const b=document.createElement("button");b.textContent="SLOT "+(i+1);b.onclick=()=>{state.saveSlot=i;load(i);};slots.appendChild(b);}
applySettings();
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);}
addEventListener("resize",resize);resize();
function tick(now){
 const dt=Math.min(.033,(now-last)/1000);last=now;const time=now/1000;
 if(state.screen==="game"&&playerGroup){shotCD=Math.max(0,shotCD-dt);updatePlayer(dt,time);updateEnemies(dt,time);updateArrows(dt);updatePickups(time);updateParticles(dt);updateCamera(dt);checkVictory();updateHud();}
 if(msgTimer>0){msgTimer-=dt;if(msgTimer<=0)ui.msg.style.opacity=0;}
 renderer.render(scene,camera);requestAnimationFrame(tick);
}
showScreen("home");requestAnimationFrame(tick);
