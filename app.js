const cases={
combat:{title:'1-lb Combat Robot',subtitle:'Berkeley Combat Robotics Club / Aug 2024–May 2026',lead:'Designed, fabricated, assembled, tested, and competed with a robot under strict mass and impact-loading constraints.',sections:[['My contribution',['CAD, FEA, structural analysis, and load-path analysis.','FEA-driven structural redesign and weight optimization while maintaining impact resistance.','Machining, 3D printing, soldering, electromechanical assembly, and competition preparation.','Piloted the robot during physical competition.']],['Engineering decisions',['Used analysis to evaluate impact-loaded structural components rather than relying on geometry alone.','Balanced structural changes against the 1-lb division constraint.','Used iterative build-test cycles to inform hardware revisions.']],['Outcome',['Completed a functioning competitive robot; placed second in the 1-lb division.']]]},
sound:{title:'ME135 Sound-Tracking Robot',subtitle:'UC Berkeley / Jan–May 2025',lead:'An ESP32-based mobile robot that estimates sound azimuth and physically reorients toward the source in real time.',sections:[['My contribution',['Designed and 3D-printed the lightweight chassis and integrated custom servo-related mechanics.','Integrated the ESP32, microphone-array sensing hardware, and servo actuation.','Worked on embedded architecture in ESP-IDF, separating audio, sensing, and control workloads.','Tuned dual-core task priorities and tested sensing and motion behavior.','Built an interactive desktop GUI for live data, commands, and debugging.']],['Engineering decisions',['Coordinated concurrent audio, sensing, and control tasks so the loops behaved deterministically enough for real-time tracking.','Used raw sensing and motion behavior to iteratively tune processing and control.','Used the GUI as a development and debugging tool.']],['Outcome',['Functional real-time sound-source localization and orientation system, completed and presented as the ME135 capstone.']]]},
music:{title:'MusicPod',subtitle:'UC Berkeley / Jan–May 2026',lead:'A compact folding tripod-mounted music and media stand, developed through physical prototyping, failure analysis, and redesign.',sections:[['My contribution',['Product concept, CAD, mechanical layout, material selection, and fit/tolerance design.','GD&T drawings and manufacturing specifications.','FDM prototyping in PLA, assembly, testing, failure analysis, and redesign.']],['Failure and redesign',['The initial prototype used 3D-printed pins that failed.','Replaced printed pins with 6061-T6 aluminum support shafts.','Redesigned the hinge geometry and interface rather than reprinting the same geometry.','Integrated a universal 1/4-20 tripod attachment.']],['Deliverables',['Physical prototype, CAD, GD&T drawings, fit/tolerance specifications, and final assembly.']]]},
cognate:{title:'Cognate',subtitle:'UC Berkeley student startup',lead:'An English-learning app built around the learner’s native language, goals, and level, with guided lessons and conversation practice.',sections:[['My role',['CFO / Financial Analyst on the founding team, working on financial analysis, projections, business-model development, and go-to-market strategy.','Programmed most of the app, alongside my finance and strategy responsibilities.','Brought an Arabic-language and Saudi perspective to the product and its initial audience.']],['Learning experience',['Onboarding tailors the learning path to native language, goals, and proficiency level.','Guided vocabulary and grammar lessons combine examples with Native/English explanations.','Learners can practice everyday scenarios, including cafés, airports, and job interviews.','The dashboard brings together recommended lessons, daily XP, and learning progress.']],['Startup',['Developed through UC Berkeley SCET BMOE Bootcamp; the team won its division.','Represented Berkeley as Global Student Startup Competition finalists in Seoul.']]]},
exoskeleton:{title:'Berkeley Nanotechnology Lab Exoskeleton',subtitle:'UC Berkeley / Wearable hardware',lead:'A wearable mechanical design project balancing functionality, fit, tolerances, and user comfort.',sections:[['My contribution',['CAD design, physical prototyping, hardware integration, and iterative build work.','FEA and structural considerations supported mechanical development.','Tested hardware on users and subjects to evaluate performance and usability.']],['Engineering decisions',['Treated fit and comfort as design requirements alongside structural function.','Used testing data and subject feedback to inform design changes.']],['Outcome',['Designed, built, and tested wearable hardware, with performance and usability feedback guiding iteration.']]]},
imaging:{title:'Computational Imaging Device',subtitle:'UC Berkeley / Jan–May 2024',lead:'A physical imaging device connecting analog light sensing with mathematical reconstruction.',sections:[['My contribution',['Designed and built the device and light-intensity-reactive circuitry on a breadboard.','Integrated Arduino Leonardo analog sensing.','Worked on sensor-matrix design and implemented reconstruction using Python, NumPy, and linear algebra.']],['Engineering decisions',['Used a limited sensor arrangement rather than a conventional full imaging sensor.','Converted analog measurements into reconstructed image information through the sensor matrix.']],['Outcome',['Built an imaging system combining physical instrumentation, circuitry, sensing, and mathematical reconstruction.']]]}
};

cases.sound.lead='An ESP32-based mobile robot combining dual-microphone sound tracking, servo actuation, and ultrasonic obstacle avoidance.';
cases.sound.sections.splice(2,0,['System architecture',['Two MAX4466 microphones provide sound input; an HC-SR04 ultrasonic sensor supports obstacle avoidance.','FreeRTOS tasks separate drive logic, sound tracking/servo control, and UART commands. Sound tracking and drive tasks use configured periods of 40 ms and 50 ms.','The GUI provides Drive, Track, and Pause commands over a serial connection, with a log for debugging.']]);
cases.music.sections.splice(2,0,['Testing and next steps',['Testing revealed inconsistent wing/console fit across prints and unreliable magnetic retention of devices.','Next steps: refine the fit and test a broader range of tripod and device combinations.']]);
cases.tidebound={title:'Tidebound',subtitle:'UC Berkeley / Spring 2026 / Built with Alec Wild',lead:'A Java tile-based game built around procedural generation, graph traversal, and reversible state. Players explore seeded underwater worlds and collect food along the way.',sections:[['World generation',['Models rooms as a weighted graph, then uses sorted edges and weighted union-find to build a minimum spanning tree. L-shaped corridors connect the selected room pairs.','Seeded randomness makes layouts reproducible while generating non-overlapping rooms on a 2D tile grid.']],['Pathfinding',['Breadth-first search uses a queue, a visited grid, and predecessor positions to reconstruct the shortest traversable route.','Clicking previews the route; a second click moves the avatar along it, collecting food as it goes.']],['State and persistence',['Two ArrayDeque-backed stacks store GameState snapshots for undo and redo. Snapshots copy the avatar position, remaining food, and counts instead of the full tile grid.','Save/load reconstructs the world from its seed and restores the current state, restart state, and both history stacks.']]]};
cases.factoryos={title:'FactoryOS',subtitle:'Independent project / Robotics & manufacturing simulation',lead:'A robot assembly simulator with moving conveyors, camera-guided pickup, and tools for testing cell layouts and production settings.',sections:[['Why I built it',['I wanted to understand what happens when robot control, sensing, and material handling have to work together. A successful pickup is only one step: the part still needs to be seated, released, and moved out of the way.']],['What I built',['A MuJoCo simulation with a Panda robot, contact-driven conveyors, and multi-part assembly tasks.','Camera-guided pickup using simulated RGB-D images, part-pose estimation, and depth tracking.','A React and Three.js interface for running the line, editing obstacles and fixtures, and reviewing results.','Reliability tests and process-optimization tools with saved runs, failure reports, and replay.']],['Use cases',['Test obstacle and fixture placement around the existing robot and conveyor.','See how camera noise, measurement delay, and grasp conditions affect assembly.','Compare motion planners and inspect the paths they produce.','Review failed runs and test changes to process settings.']],['Under the hood',['Python and FastAPI run the simulation backend. React, TypeScript, and Three.js handle the interface and 3D view.','Grasping, seating, and release depend on physical contacts and checks in the simulation.','Built and tested in simulation; hardware validation is a next step.']]]};
cases.marketplaceos = {
 title: 'MarketplaceOS',
 subtitle: 'Independent project / Delivery operations simulation',
 lead: 'A simulator for a food delivery marketplace. Follow an order through a dinner rush, then replay the same evening with a different delivery fee, driver incentive, or service radius.',
 sections: [
  ['What I built', [
   'A discrete-event simulator for customer orders, kitchen queues, driver dispatch, and road travel.',
   'A map and timeline for inspecting drivers, orders, cancellations, and the revenue and costs behind each order.',
   'A replay that starts both policies from the same market state and shares demand opportunities and weather. The results show paired changes in deliveries and contribution, with uncertainty intervals.'
  ]],
  ['Fleet recordings', [
   'The browser can run a timed East Bay pilot before recording the full set of fictional markets.',
   'Saved recordings let you open a city, replay sampled driver positions, and trace an individual order through its event history and ledger.'
  ]],
  ['Under the hood', [
   'Python and FastAPI serve the simulation and saved records. React, TypeScript, and MapLibre handle the workspace.',
   'The markets use synthetic demand and simplified roads. The results describe those simulated evenings.'
  ]]
 ]

};
const galleries={
 marketplaceos: [
  {src:'media/marketplaceos-compare.jpg',title:'Policy comparison',alt:'Side-by-side maps showing the baseline and driver incentive at the same recorded cutoff',caption:'No action and a driver incentive, shown at the same point in the evening.'},
  {src:'media/marketplaceos-order.jpg',title:'Order replay',alt:'East Bay simulation map with the selected order’s kitchen, destination, and checkout ETA in the inspector',caption:'An order and its delivery details at the selected moment in the East Bay replay.'},
  {src:'media/marketplaceos-fleet.jpg',title:'Fleet recording',alt:'East Bay city recording with sampled driver positions, grouped markers, and a list of orders',caption:'A saved fleet recording, opened to East Bay and paused on a sample of driver positions.'}
 ],

 factoryos:[{src:'media/factoryos-overview.jpg',title:'Full cell',alt:'FactoryOS dashboard showing the Panda robot beside a long conveyor carrying assembly parts',caption:'Full cell with the robot, assembly station, and 3.2 m infeed conveyor.'},{src:'media/factoryos-robot.jpg',title:'Robot detail',alt:'Robot-focused FactoryOS dashboard showing the gripper and assembly station',caption:'A closer look at the gripper and assembly station.'},{src:'media/factoryos-layout.jpg',title:'Layout editor',alt:'FactoryOS plan view with a selected obstacle and editable position coordinates',caption:'Obstacle placement in the cell designer.'},{src:'media/factoryos-layout-run.jpg',title:'Applied layout',alt:'FactoryOS running with a turquoise obstacle next to the robot and conveyor',caption:'The applied obstacle in the 3D scene while the line runs.'}],
 tidebound:[{src:'media/tidebound-world.png',title:'World',alt:'Tile-based underwater game with connected rooms, an octopus, and scattered food',caption:'Underwater world'},{src:'media/tidebound-path.png',title:'Route planning',alt:'Underwater game with a highlighted shortest route from the octopus to food',caption:'Shortest-path navigation'}],
 cognate:[{src:'media/cognate-home.png',title:'Home',alt:'Cognate learner dashboard with a recommended lesson and daily learning progress',caption:'Learner dashboard'},{src:'media/cognate-lesson.png',title:'Bilingual lesson',alt:'Cognate lesson example with Native and English explanation controls and an Arabic learning tip',caption:'Native-language lesson explanations'}],
 combat:[{src:'media/combat-robot.jpg',title:'Assembly',alt:'One-pound combat robot on a workshop bench with its upper panel lifted, revealing the wiring, motors, and internal assembly',caption:'Robot assembly'}],
 sound:[{src:'media/sound-robot.png',title:'Hardware',alt:'Assembled sound-tracking robot with microphones, yellow drive wheels, wiring, and front ultrasonic sensor',caption:'Assembled robot'},{src:'media/sound-gui.png',title:'Interface',alt:'ESP32 Robot Control GUI showing Drive, Track, Pause, serial connection, and log',caption:'Desktop control interface'}],
 music:[{src:'media/music-folded.jpg',title:'Folded',alt:'MusicPod prototype folded closed on a table',caption:'Folded stand'},{src:'media/music-open.jpg',title:'Open',alt:'MusicPod physical prototype with both wings deployed on its tripod mount',caption:'Unfolded stand'},{src:'media/music-in-use.jpg',title:'In use',alt:'MusicPod deployed with two pages of sheet music',caption:'Stand holding sheet music'},{src:'media/music-cad.png',title:'CAD',alt:'MusicPod CAD model with center console and deployed folding wings',caption:'CAD model'},{src:'media/music-drawing.png',title:'Drawing',alt:'Center console working drawing with dimensioning and CAD view',caption:'Center console drawing'}]
};
function galleryMarkup(id){const images=galleries[id];if(!images)return '';const first=images[0];return `<section class="project-gallery gallery-${id}" aria-label="Project images"><figure><a class="full-image" href="${first.src}" target="_blank" rel="noopener" aria-label="Open full-size project image"><img id="gallery-image" src="${first.src}" alt="${first.alt}" width="${id==='marketplaceos'?1440:id==='cognate'?430:1080}" height="${id==='marketplaceos'?900:id==='cognate'?1000:id==='tidebound'?675:810}"></a><figcaption id="gallery-caption" aria-live="polite">${first.caption}</figcaption></figure><div class="gallery-controls" role="group" aria-label="Choose project image">${images.map((img,i)=>`<button data-gallery="${id}" data-image="${i}" aria-pressed="${i===0}">${img.title}</button>`).join('')}</div>${id==='music'?'<a class="video-link" href="https://youtu.be/lQAjs3NDp_w" target="_blank" rel="noopener">Watch the team demonstration</a>':''}</section>`}

const marketplaceRecordings = [
 {name:'replay',poster:'compare',label:'Inspecting an order and comparing two delivery policies',caption:'Follow a driver to its order, replay the two policies together, and open the results across paired evenings.'},
 {name:'fleet',poster:'fleet',label:'Opening East Bay and replaying driver positions from the recorded fleet',caption:'Open East Bay from the completed fleet recording and play back sampled driver positions.'}
];

function recordingsMarkup(id) {
 if (id === 'marketplaceos') {
  const clips = marketplaceRecordings.map(({name, poster, label, caption}) => {
   const src = `media/marketplaceos-${name}.mp4`;
   return `<figure><video controls playsinline preload="none" width="1440" height="900" poster="media/marketplaceos-${poster}.jpg" aria-label="${label}"><source src="${src}" type="video/mp4">Your browser does not support embedded video. <a href="${src}">Watch the recording</a>.</video><figcaption>${caption}</figcaption></figure>`;
  }).join('');
  return `<section class="project-recordings" aria-labelledby="recordings-title"><h3 id="recordings-title">See it in action</h3>${clips}</section>`;
 }
 return factoryRecordingsMarkup(id);
}
function factoryRecordingsMarkup(id){if(id!=='factoryos')return '';return `<section class="project-recordings" aria-labelledby="recordings-title"><h3 id="recordings-title">See it in action</h3><figure><video controls playsinline preload="none" poster="media/factoryos-pickup-poster.jpg" aria-label="Screen recording of camera-guided robot pickup in FactoryOS"><source src="media/factoryos-pickup.mp4" type="video/mp4">Your browser does not support embedded video. <a href="media/factoryos-pickup.mp4">Watch the pickup recording</a>.</video><figcaption>Camera-guided pickup: tracking a moving part, gripping, and checking the lift.</figcaption></figure><figure><video controls playsinline preload="none" poster="media/factoryos-layout-run.jpg" aria-label="Screen recording of adding an obstacle, applying the layout, and running the simulation in FactoryOS"><source src="media/factoryos-layout.mp4" type="video/mp4">Your browser does not support embedded video. <a href="media/factoryos-layout.mp4">Watch the layout recording</a>.</video><figcaption>Adding an obstacle, applying the layout, and running the line with the obstacle in the 3D scene.</figcaption></figure></section>`;}
const dialog=document.querySelector('#case-dialog'),content=document.querySelector('#case-content');
let opener=null;
const order=['factoryos','combat','sound','cognate','marketplaceos','music','tidebound','exoskeleton','imaging'];
function openCase(id){
 const p=cases[id];if(!p)return;
 content.querySelectorAll("video").forEach(video=>video.pause());
 const pos=order.indexOf(id);
 content.innerHTML=`<p class="project-meta">${p.subtitle}</p><h2 id="case-title">${p.title}</h2><p class="case-intro">${p.lead}</p>${galleryMarkup(id)}${recordingsMarkup(id)}${p.sections.map(([heading,items])=>`<section class="case-section"><h3>${heading}</h3><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul></section>`).join('')}<nav class="case-nav" aria-label="Case study navigation"><a href="#case/${order[(pos+order.length-1)%order.length]}">Previous project</a><a href="#case/${order[(pos+1)%order.length]}">Next project</a></nav>`;
 if(!dialog.open){opener=document.activeElement;dialog.showModal();document.body.classList.add('dialog-open')}
 dialog.scrollTop=0;
}
function syncHash(){const m=location.hash.match(/^#case\/(.+)$/);if(m&&cases[m[1]])openCase(m[1]);else if(dialog.open)dialog.close()}
function closeCase(){history.replaceState(null,'','#'+(dialog.dataset.origin||'work'));dialog.close()}
document.querySelectorAll('[data-case]').forEach(a=>a.addEventListener('click',()=>dialog.dataset.origin=a.closest('article').id));
document.querySelector('#close-case').addEventListener('click',closeCase);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeCase()});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeCase()}});
dialog.addEventListener('close',()=>{content.querySelectorAll('video').forEach(video=>video.pause());document.body.classList.remove('dialog-open');if(opener instanceof HTMLElement&&opener!==document.body)opener.focus({preventScroll:true})});
addEventListener('hashchange',syncHash);syncHash();


content.addEventListener('click',e=>{const b=e.target.closest('[data-gallery]');if(!b)return;const images=galleries[b.dataset.gallery],item=images[Number(b.dataset.image)];const img=document.querySelector('#gallery-image');img.src=item.src;img.alt=item.alt;if(!paused&&!reducedMotion.matches)img.animate([{opacity:.45},{opacity:1}],{duration:220,easing:'ease-out'});document.querySelector('.full-image').href=item.src;document.querySelector('#gallery-caption').textContent=item.caption;content.querySelectorAll('[data-gallery]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reducedMotion.matches;
const motionToggle=document.querySelector('#motion-toggle');
function updateMotion(){document.body.classList.toggle('motion-paused',paused);motionToggle.textContent=paused?'Enable motion':'Pause motion';motionToggle.setAttribute('aria-pressed',String(paused));}
motionToggle.addEventListener('click',()=>{paused=!paused;updateMotion()});reducedMotion.addEventListener('change',e=>{paused=e.matches;updateMotion()});updateMotion();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('project-entered');observer.unobserve(entry.target)}})},{threshold:.3});document.querySelectorAll('.work-list article').forEach(row=>observer.observe(row));}


if('IntersectionObserver' in window){const visualObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('visual-active',entry.isIntersecting)),{threshold:.25});document.querySelectorAll('.project-visual').forEach(tile=>visualObserver.observe(tile));}




const resumeDialog=document.querySelector('#resume-dialog');
let resumeOpener=null;
document.querySelector('[data-resume]').addEventListener('click',e=>{e.preventDefault();resumeOpener=e.currentTarget;resumeDialog.showModal();document.body.classList.add('dialog-open');});
function closeResume(){resumeDialog.close();}
document.querySelector('#close-resume').addEventListener('click',closeResume);
resumeDialog.addEventListener('close',()=>{if(!dialog.open)document.body.classList.remove('dialog-open');resumeOpener?.focus({preventScroll:true});});
resumeDialog.addEventListener('click',e=>{if(e.target===resumeDialog){const r=resumeDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeResume();}});


// Stop decorative motion in background tabs; playback remains visitor controlled.
function updateVisibility(){document.body.classList.toggle('page-hidden',document.hidden);if(document.hidden)content.querySelectorAll('video').forEach(video=>video.pause());}
document.addEventListener('visibilitychange',updateVisibility);updateVisibility();

// One workpiece travels through feed, grip, transfer, release, and outfeed.
(function animateFactoryCard(){
 const tile=document.querySelector('.factoryos-visual');if(!tile)return;
 const find=name=>tile.querySelector(`[data-cell="${name}"]`);
 const outline=find('arm-outline'),body=find('arm-body'),elbow=find('elbow'),hub=find('elbow-hub'),tool=find('tool'),gripper=find('gripper'),part=find('part'),infeed=find('infeed'),outfeed=find('outfeed');
 const poses=[[0,101,45],[.12,101,45],[.26,84,67],[.35,84,67],[.45,84,43],[.59,132,43],[.69,132,67],[.76,132,67],[.86,132,43],[.97,101,45],[1,101,45]];
 const clamp=v=>Math.max(0,Math.min(1,v));
 const smooth=v=>{const u=clamp(v);return u*u*u*(10+u*(-15+6*u));};
 function draw(t){
  let i=1;while(i<poses.length-1&&t>poses[i][0])i++;
  const a=poses[i-1],b=poses[i],u=smooth((t-a[0])/(b[0]-a[0])),x=a[1]+(b[1]-a[1])*u,y=a[2]+(b[2]-a[2])*u;
  const dx=x-36,dy=y-78,d=Math.hypot(dx,dy),upper=48,lower=58;
  const theta=Math.atan2(dy,dx)-Math.acos(Math.max(-1,Math.min(1,(upper*upper+d*d-lower*lower)/(2*upper*d)))),ex=36+upper*Math.cos(theta),ey=78+upper*Math.sin(theta);
  const arm=`M36 78L${ex} ${ey}L${x} ${y}`;
  outline.setAttribute('d',arm);body.setAttribute('d',arm);elbow.setAttribute('cx',ex);elbow.setAttribute('cy',ey);hub.setAttribute('cx',ex);hub.setAttribute('cy',ey);tool.setAttribute('transform',`translate(${x} ${y})`);
  const closing=smooth((t-.28)/.05),opening=smooth((t-.70)/.045),gap=6-1.7*closing+1.7*opening;
  gripper.setAttribute('d',`M0 3V10M${-gap} 10H${gap}M${-gap} 10V21M${gap} 10V21`);
  let px,py;
  if(t<.33){px=52+32*smooth(t/.18);py=84;}
  else if(t<.725){px=x;py=y+17;}
  else{px=132+48*smooth((t-.79)/.21);py=84;}
  part.setAttribute('x',px-3.5);part.setAttribute('y',py-3.5);
  infeed.setAttribute('transform',`translate(${(32*smooth(t/.18))%8} 0)`);
  outfeed.setAttribute('transform',`translate(${(48*smooth((t-.79)/.21))%8} 0)`);
 }
 let visible=false,frame=0,last=0,elapsed=0;
 function tick(now){if(last)elapsed+=Math.min(now-last,50);last=now;draw((elapsed%10000)/10000);frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!paused&&!document.hidden&&!reducedMotion.matches)frame=requestAnimationFrame(tick);else if(reducedMotion.matches)draw(.08);}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15}).observe(tile);
 motionToggle.addEventListener('click',sync);reducedMotion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);draw(.08);
})();


// A delivery follows the street corners, pauses at each stop, then returns.
(function animateDeliveryCard() {
 const tile = document.querySelector('.marketplaceos-visual');
 const car = tile.querySelector('[data-delivery="car"]');
 const parcel = tile.querySelector('[data-delivery="parcel"]');
 const done = tile.querySelector('[data-delivery="done"]');
 const stops = [[0,32,73,0],[.08,32,73,0],[.26,119,73,0],
  [.29,119,73,-90],[.36,119,45,-90],[.39,119,45,0],
  [.47,150,45,0],[.59,150,45,0],[.63,150,45,180],
  [.71,119,45,180],[.74,119,45,90],[.81,119,73,90],
  [.84,119,73,180],[.97,32,73,180],[1,32,73,360]];
 function draw(t) {
  let i = 1;
  while (i < stops.length - 1 && t > stops[i][0]) i++;
  const a = stops[i - 1], b = stops[i];
  const progress = (t - a[0]) / (b[0] - a[0]);
  const u = progress * progress * (3 - 2 * progress);
  const x = a[1] + (b[1] - a[1]) * u;
  const y = a[2] + (b[2] - a[2]) * u;
  car.setAttribute('transform', `translate(${x} ${y}) rotate(${a[3] + (b[3] - a[3]) * u})`);
  parcel.setAttribute('opacity', t < .07 || t > .98 ? '1' : '0');
  done.setAttribute('opacity', t > .49 && t < .63 ? '1' : '0');
 }
 let visible = false, frame = 0, last = 0, elapsed = 0;
 function tick(now) {
  if (last) elapsed += Math.min(now - last, 50);
  last = now;
  draw((elapsed % 14000) / 14000);
  frame = requestAnimationFrame(tick);
 }
 function sync() {
  cancelAnimationFrame(frame);
  last = 0;
  if (visible && !paused && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick);
  else if (reducedMotion.matches) draw(.25);
 }
 new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .15 }).observe(tile);
 motionToggle.addEventListener('click', sync);
 reducedMotion.addEventListener('change', sync);
 document.addEventListener('visibilitychange', sync);
 draw(0);
})();
