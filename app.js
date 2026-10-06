const $ = (id) => document.getElementById(id);
const state = {
  data:null, initial:null, blockedNodes:new Set(), blockedEdges:new Set(), closedExits:new Set(), start:null,
  selectedEdge:null, lang:'en', route:null
};

const T = {
  en:{subtitle:'Interactive evacuation route simulator',hazard:'Hazard target',help:'Help',import:'Import building',importHint:'Load a building.json file. The app validates it locally in your browser.',choose:'Choose JSON file',sample:'Load sample building',waiting:'Waiting for a building file.',controls:'Route controls',start:'Starting location',block:'Block selected',unblock:'Unblock selected',corridor:'Block corridor',openCorridor:'Unblock corridor',exit:'Close exit',openExit:'Reopen exit',reset:'↺ Reset initial state',legend:'Legend',room:'Room',junction:'Junction',exitLegend:'Exit',route:'Selected route',blocked:'Blocked',status:'Current result',load:'Load a building to calculate a route.',detail:'The lowest-cost accessible exit will appear here.',map:'Building map',live:'LIVE SIMULATION',footer:'Click a room or junction to use it as the starting location. Use the controls to simulate hazards.',safe:'Simulation only • Not certified evacuation planning',empty:'Your map appears here',emptyText:'Import building.json or load the sample building to start.',routeLabel:'Route',exitLabel:'Exit',cost:'Total cost',nodes:'nodes',corridors:'corridors',valid:'Valid building loaded.',invalid:'Invalid file:',noRoute:'No route available',blockedStart:'Starting location blocked',helpTitle:'How to use Smart Escape',helpList:['Import a valid building.json or load the sample.','Select an unblocked room or junction.','Block/unblock nodes, corridors, or exits to simulate hazards.','The route recalculates immediately using corridor costs.','Reset returns all hazards to the file’s original initial state.'],noStart:'Select a room or junction to calculate a route.',startBlocked:'The selected starting location is currently blocked.',routeFound:'Lowest-cost route found.'},
  bn:{subtitle:'ইন্টার‌্যাক্টিভ ইভাকুয়েশন রুট সিমুলেটর',hazard:'হ্যাজার্ড টার্গেট',help:'সহায়তা',import:'বিল্ডিং ইমপোর্ট',importHint:'building.json ফাইল লোড করুন। ফাইলটি ব্রাউজারেই যাচাই করা হবে।',choose:'JSON ফাইল বাছাই',sample:'স্যাম্পল বিল্ডিং লোড',waiting:'বিল্ডিং ফাইলের অপেক্ষায়।',controls:'রুট কন্ট্রোল',start:'শুরুর অবস্থান',block:'নির্বাচিতটি ব্লক',unblock:'আনব্লক',corridor:'করিডোর ব্লক',openCorridor:'করিডোর আনব্লক',exit:'এক্সিট বন্ধ',openExit:'এক্সিট খুলুন',reset:'↺ প্রাথমিক অবস্থায় রিসেট',legend:'লেজেন্ড',room:'রুম',junction:'জাংশন',exitLegend:'এক্সিট',route:'নির্বাচিত রুট',blocked:'ব্লকড',status:'বর্তমান ফলাফল',load:'রুট হিসাব করতে একটি বিল্ডিং লোড করুন।',detail:'সবচেয়ে কম খরচের ব্যবহারযোগ্য এক্সিট এখানে দেখাবে।',map:'বিল্ডিং ম্যাপ',live:'লাইভ সিমুলেশন',footer:'শুরু হিসেবে একটি রুম বা জাংশনে ক্লিক করুন। হ্যাজার্ড সিমুলেট করতে কন্ট্রোল ব্যবহার করুন।',safe:'শুধু সিমুলেশন • বাস্তব ইভাকুয়েশন পরিকল্পনার জন্য প্রত্যয়িত নয়',empty:'আপনার ম্যাপ এখানে দেখা যাবে',emptyText:'শুরু করতে building.json ইমপোর্ট করুন অথবা স্যাম্পল লোড করুন।',routeLabel:'রুট',exitLabel:'এক্সিট',cost:'মোট খরচ',nodes:'নোড',corridors:'করিডোর',valid:'বিল্ডিং সফলভাবে লোড হয়েছে।',invalid:'ভুল ফাইল:',noRoute:'কোনো রুট পাওয়া যায়নি',blockedStart:'শুরুর অবস্থান ব্লকড',helpTitle:'Smart Escape কীভাবে ব্যবহার করবেন',helpList:['একটি valid building.json ইমপোর্ট করুন বা স্যাম্পল লোড করুন।','একটি আনব্লকড রুম বা জাংশন নির্বাচন করুন।','হ্যাজার্ড সিমুলেট করতে নোড, করিডোর বা এক্সিট ব্লক/আনব্লক করুন।','করিডোরের cost ব্যবহার করে রুট তাৎক্ষণিকভাবে পুনরায় হিসাব হবে।','Reset ফাইলের প্রাথমিক initial_state ফিরিয়ে দেবে।'],noStart:'রুট হিসাব করতে একটি রুম বা জাংশন নির্বাচন করুন।',startBlocked:'নির্বাচিত শুরুর অবস্থানটি বর্তমানে ব্লকড।',routeFound:'সবচেয়ে কম খরচের রুট পাওয়া গেছে।'}
};
function t(k){return T[state.lang][k]||k}

function validateBuilding(d){
  const err=[];
  if(!d||typeof d!=='object') return ['Root must be a JSON object.'];
  if(typeof d.building!=='string'||!d.building.trim()) err.push('building must be a non-empty string.');
  if(!Array.isArray(d.nodes)||d.nodes.length<2) err.push('nodes must be a non-empty array.');
  if(!Array.isArray(d.edges)||d.edges.length<1) err.push('edges must be a non-empty array.');
  const nodes=d.nodes||[], edges=d.edges||[], ids=new Set(), types=new Map();
  for(const n of nodes){
    if(!n||typeof n.id!=='string'||!n.id) err.push('Every node needs a unique string id.');
    if(ids.has(n?.id)) err.push(`Duplicate node id: ${n.id}`); ids.add(n?.id);
    if(!['room','junction','exit'].includes(n?.type)) err.push(`Invalid node type for ${n?.id}.`);
    if(typeof n?.label!=='string'||!n.label.trim()) err.push(`Node ${n?.id||''} needs a label.`);
    if(typeof n?.x!=='number'||typeof n?.y!=='number'||!Number.isFinite(n.x)||!Number.isFinite(n.y)) err.push(`Node ${n?.id||''} needs numeric x/y.`);
    types.set(n?.id,n?.type);
  }
  if(nodes.length<2||nodes.length>60) err.push('nodes must contain 2-60 items.');
  if(edges.length>150) err.push('edges must contain at most 150 items.');
  const edgeIds=new Set(), pairs=new Set();
  for(const e of edges){
    if(!e||typeof e.id!=='string'||!e.id) err.push('Every edge needs a unique string id.');
    if(edgeIds.has(e?.id)) err.push(`Duplicate edge id: ${e.id}`); edgeIds.add(e?.id);
    if(!ids.has(e?.from)||!ids.has(e?.to)) err.push(`Edge ${e?.id||''} references an unknown node.`);
    if(e?.from===e?.to) err.push(`Edge ${e?.id||''} cannot be a self-loop.`);
    const pair=[e?.from,e?.to].sort().join('::'); if(pairs.has(pair)) err.push(`Repeated node pair: ${e?.from}/${e?.to}`); pairs.add(pair);
    if(!Number.isInteger(e?.cost)||e.cost<=0) err.push(`Edge ${e?.id||''} cost must be a positive integer.`);
  }
  const init=d.initial_state||{};
  for(const key of ['blocked_nodes','blocked_edges','closed_exits']) if(!Array.isArray(init[key])) err.push(`initial_state.${key} must be an array.`);
  for(const id of init.blocked_nodes||[]) if(!ids.has(id)||!['room','junction'].includes(types.get(id))) err.push(`Invalid blocked node: ${id}`);
  for(const id of init.blocked_edges||[]) if(!edgeIds.has(id)) err.push(`Invalid blocked edge: ${id}`);
  for(const id of init.closed_exits||[]) if(!ids.has(id)||types.get(id)!=='exit') err.push(`Invalid closed exit: ${id}`);
  if(!nodes.some(n=>n.type==='room'||n.type==='junction')) err.push('At least one room or junction is required.');
  if(!nodes.some(n=>n.type==='exit')) err.push('At least one exit is required.');
  return [...new Set(err)];
}

function cloneInitial(d){return {blockedNodes:new Set(d.initial_state.blocked_nodes||[]),blockedEdges:new Set(d.initial_state.blocked_edges||[]),closedExits:new Set(d.initial_state.closed_exits||[])}}
function neighbors(id){
  const result=[]; if(!state.data) return result;
  for(const e of state.data.edges){
    if(state.blockedEdges.has(e.id)) continue;
    if(state.blockedNodes.has(e.from)||state.blockedNodes.has(e.to)) continue;
    if(state.closedExits.has(e.from)||state.closedExits.has(e.to)) continue;
    if(e.from===id) result.push({id:e.to,cost:e.cost,edge:e.id});
    else if(e.to===id) result.push({id:e.from,cost:e.cost,edge:e.id});
  }
  return result;
}
function pathCompare(a,b){
  const n=Math.min(a.length,b.length); for(let i=0;i<n;i++){if(a[i]<b[i])return -1;if(a[i]>b[i])return 1}return a.length-b.length;
}
function better(a,b){ if(!b)return true; if(a.cost!==b.cost)return a.cost<b.cost; const exA=a.exit,exB=b.exit;if(exA!==exB)return exA<exB;return pathCompare(a.path,b.path)<0 }
function calculateRoute(){
  state.route=null;
  if(!state.data||!state.start){render();return}
  if(state.blockedNodes.has(state.start)){setStatus('danger',t('blockedStart'),t('startBlocked'));render();return}
  const nodes=state.data.nodes, exits=new Set(nodes.filter(n=>n.type==='exit'&&!state.closedExits.has(n.id)&&!state.blockedNodes.has(n.id)).map(n=>n.id));
  let best=null;
  const dist=new Map([[state.start,{cost:0,path:[state.start],exit:null}]]), queue=[state.start];
  while(queue.length){
    let bi=0; for(let i=1;i<queue.length;i++){const a=dist.get(queue[i]),b=dist.get(queue[bi]);if(a.cost<b.cost||(a.cost===b.cost&&pathCompare(a.path,b.path)<0))bi=i} const u=queue.splice(bi,1)[0], cur=dist.get(u);
    if(exits.has(u)){const candidate={...cur,exit:u};if(better(candidate,best))best=candidate;continue}
    for(const nb of neighbors(u)){const cand={cost:cur.cost+nb.cost,path:[...cur.path,nb.id],exit:null};const old=dist.get(nb.id);if(!old||cand.cost<old.cost||(cand.cost===old.cost&&pathCompare(cand.path,old.path)<0)){dist.set(nb.id,cand);if(!queue.includes(nb.id))queue.push(nb.id)}}
  }
  if(best){state.route=best;setStatus('ok',t('routeFound'),`${best.exit} • ${best.cost}`)}else setStatus('danger',t('noRoute'),t('detail'));
  render();
}
function setStatus(kind,title,detail){const c=$('statusCard');c.className='status-card '+kind;$('statusText').textContent=title;$('statusDetail').textContent=detail}
function setData(d){state.data=d;state.initial=cloneInitial(d);state.blockedNodes=new Set(state.initial.blockedNodes);state.blockedEdges=new Set(state.initial.blockedEdges);state.closedExits=new Set(state.initial.closedExits);state.start=d.nodes.find(n=>n.type==='room'||n.type==='junction')?.id||null;state.selectedEdge=null;$('datasetName').textContent=d.building;$('emptyState').classList.add('hidden');$('validation').className='validation ok';$('validation').textContent=t('valid');$('resetBtn').disabled=false;populateStart();calculateRoute()}
function populateStart(){const s=$('startSelect'),h=$('hazardSelect');s.innerHTML='';h.innerHTML='';for(const n of state.data.nodes.filter(n=>n.type!=='exit')){const o=document.createElement('option');o.value=n.id;o.textContent=`${n.id} — ${n.label}`;o.disabled=state.blockedNodes.has(n.id);s.appendChild(o);const q=o.cloneNode(true);q.disabled=false;h.appendChild(q)}if(state.start&&!state.blockedNodes.has(state.start))s.value=state.start;else state.start=[...s.options].find(o=>!o.disabled)?.value||null;h.value=state.start||h.options[0]?.value||'';s.disabled=false;h.disabled=false;updateButtons()}
function updateButtons(){const has=!!state.data&&!!state.start;const target=$('hazardSelect')?.value;$('blockNodeBtn').disabled=!has||!target||state.blockedNodes.has(target);$('unblockNodeBtn').disabled=!has||!target||!state.blockedNodes.has(target);$('toggleEdgeBtn').disabled=!has;const e=state.selectedEdge;$('toggleEdgeBtn').textContent=e&&state.blockedEdges.has(e)?t('openCorridor'):t('corridor');$('toggleExitBtn').disabled=!has; if(e){const edge=state.data.edges.find(x=>x.id===e);$('toggleExitBtn').disabled=!edge||!state.data.nodes.find(n=>n.id===edge.to&&n.type==='exit')&&!state.data.nodes.find(n=>n.id===edge.from&&n.type==='exit');if(!$('toggleExitBtn').disabled){const ex=state.data.nodes.find(n=>(n.id===edge.to||n.id===edge.from)&&n.type==='exit');$('toggleExitBtn').textContent=state.closedExits.has(ex.id)?t('openExit'):t('exit')}}}
function nodeAt(id){return state.data.nodes.find(n=>n.id===id)}
function render(){
  if(!state.data)return; const svg=$('map');svg.innerHTML=''; const nodes=state.data.nodes, xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y), minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),pad=90, sx=(x)=>pad+(x-minX)/Math.max(1,maxX-minX)*(1000-2*pad), sy=(y)=>pad+(y-minY)/Math.max(1,maxY-minY)*(620-2*pad);
  for(const e of state.data.edges){const a=nodeAt(e.from),b=nodeAt(e.to);const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',sx(a.x));line.setAttribute('y1',sy(a.y));line.setAttribute('x2',sx(b.x));line.setAttribute('y2',sy(b.y));line.classList.add('edge');if(state.blockedEdges.has(e.id)||state.blockedNodes.has(e.from)||state.blockedNodes.has(e.to))line.classList.add('blocked');if(state.route&&state.route.path.includes(e.from)&&state.route.path.includes(e.to)&&Math.abs(state.route.path.indexOf(e.from)-state.route.path.indexOf(e.to))===1)line.classList.add('route');line.addEventListener('click',()=>{state.selectedEdge=e.id;updateButtons();render()});svg.appendChild(line);const tx=(sx(a.x)+sx(b.x))/2,ty=(sy(a.y)+sy(b.y))/2;const lab=document.createElementNS('http://www.w3.org/2000/svg','text');lab.setAttribute('x',tx);lab.setAttribute('y',ty-8);lab.setAttribute('class','edge-label');lab.textContent=e.cost;svg.appendChild(lab)}
  for(const n of nodes){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.classList.add('node',n.type);if(state.blockedNodes.has(n.id)||state.closedExits.has(n.id))g.classList.add('blocked');if(n.id===state.start)g.classList.add('selected');if(state.route?.path.includes(n.id))g.classList.add('route');g.addEventListener('click',()=>{if(n.type==='exit')return;state.start=n.id;$('startSelect').value=n.id;updateButtons();calculateRoute()});const x=sx(n.x),y=sy(n.y);if(n.type==='junction'){const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('x',x-17);r.setAttribute('y',y-17);r.setAttribute('width',34);r.setAttribute('height',34);r.setAttribute('rx',9);g.appendChild(r)}else{const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',n.type==='exit'?22:20);g.appendChild(c)}const label=document.createElementNS('http://www.w3.org/2000/svg','text');label.setAttribute('x',x);label.setAttribute('y',y+4);label.setAttribute('class','node-label');label.textContent=n.id;g.appendChild(label);const sub=document.createElementNS('http://www.w3.org/2000/svg','text');sub.setAttribute('x',x);sub.setAttribute('y',y+38);sub.setAttribute('class','node-type');sub.textContent=n.label;g.appendChild(sub);svg.appendChild(g)}
  $('nodeCount').textContent=`${nodes.length} ${t('nodes')}`;$('edgeCount').textContent=`${state.data.edges.length} ${t('corridors')}`;$('routeSummary').hidden=!state.route;if(state.route){$('routeNodes').textContent=state.route.path.join(' → ');$('routeExit').textContent=state.route.exit;$('routeCost').textContent=state.route.cost}updateButtons()
}
function loadJsonText(text){try{const d=JSON.parse(text), errors=validateBuilding(d);if(errors.length){$('validation').className='validation error';$('validation').textContent=`${t('invalid')} ${errors.slice(0,3).join(' ')}`;return}setData(d)}catch(e){$('validation').className='validation error';$('validation').textContent=`${t('invalid')} JSON could not be parsed.`}}
function toggleNode(block){const target=$('hazardSelect').value;if(!target)return;if(block)state.blockedNodes.add(target);else state.blockedNodes.delete(target);populateStart();if(state.start===target&&!block)state.start=target;calculateRoute()}
function toggleEdge(){if(!state.selectedEdge||!state.data)return;if(state.blockedEdges.has(state.selectedEdge))state.blockedEdges.delete(state.selectedEdge);else state.blockedEdges.add(state.selectedEdge);calculateRoute()}
function toggleExit(){if(!state.selectedEdge||!state.data)return;const e=state.data.edges.find(x=>x.id===state.selectedEdge), n1=nodeAt(e.from),n2=nodeAt(e.to), ex=n1.type==='exit'?n1:n2.type==='exit'?n2:null;if(!ex)return;if(state.closedExits.has(ex.id))state.closedExits.delete(ex.id);else state.closedExits.add(ex.id);calculateRoute()}
function applyLang(){document.documentElement.lang=state.lang;$('subtitle').textContent=t('subtitle');$('helpBtn').textContent=t('help');$('importTitle').textContent=t('import');$('importHint').textContent=t('importHint');$('fileBtnText').textContent=t('choose');$('sampleBtn').textContent=t('sample');$('controlsTitle').textContent=t('controls');$('startLabel').textContent=t('start');$('hazardLabel').textContent=t('hazard');$('legendTitle').textContent=t('legend');$('roomLegend').textContent=t('room');$('junctionLegend').textContent=t('junction');$('exitLegend').textContent=t('exitLegend');$('routeLegend').textContent=t('route');$('blockedLegend').textContent=t('blocked');$('statusTitle').textContent=t('status');$('mapEyebrow').textContent=t('live');$('mapTitle').textContent=t('map');$('footerHint').textContent=t('footer');document.querySelector('.safe-note').textContent=t('safe');$('emptyTitle').textContent=t('empty');$('emptyText').textContent=t('emptyText');$('routeLabel').textContent=t('routeLabel');$('exitLabel').textContent=t('exitLabel');$('costLabel').textContent=t('cost');$('helpTitle').textContent=t('helpTitle');$('helpList').innerHTML=t('helpList').map(x=>`<li>${x}</li>`).join('');$('langBtn').textContent=state.lang==='en'?'বাংলা':'English';if(state.data){$('validation').textContent=t('valid');populateStart();calculateRoute()}else setStatus('','',t('load'));updateButtons()}

$('fileInput').addEventListener('change',e=>{const f=e.target.files[0];if(f)f.text().then(loadJsonText)});
$('sampleBtn').addEventListener('click',()=>fetch('building.json').then(r=>r.text()).then(loadJsonText).catch(()=>alert('Could not load building.json. Please use the file picker.')));
$('startSelect').addEventListener('change',e=>{state.start=e.target.value;calculateRoute()});$('hazardSelect').addEventListener('change',updateButtons);
$('blockNodeBtn').addEventListener('click',()=>toggleNode(true));$('unblockNodeBtn').addEventListener('click',()=>toggleNode(false));$('toggleEdgeBtn').addEventListener('click',toggleEdge);$('toggleExitBtn').addEventListener('click',toggleExit);
$('resetBtn').addEventListener('click',()=>{if(!state.initial)return;state.blockedNodes=new Set(state.initial.blockedNodes);state.blockedEdges=new Set(state.initial.blockedEdges);state.closedExits=new Set(state.initial.closedExits);state.selectedEdge=null;populateStart();calculateRoute()});
$('langBtn').addEventListener('click',()=>{state.lang=state.lang==='en'?'bn':'en';applyLang()});$('helpBtn').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
$('map').addEventListener('click',()=>{});applyLang();
