from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from PIL import Image
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'Faris_Babsail_Portfolio.pdf'
for name,file in [('Sans','NotoSans-Regular.ttf'),('Bold','NotoSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(ROOT/'vendor'/file)))
pdfmetrics.registerFont(TTFont('Serif','/System/Library/Fonts/Supplemental/Georgia.ttf'))
W,H=612,792; M=44; CW=524; ink='#202823'; muted='#566259'; accent='#385846'; paper='#FAFAF6'
c=canvas.Canvas(str(OUT),pagesize=(W,H));c.setTitle('Faris Babsail | Engineering Portfolio');c.setAuthor('Faris Babsail');c.setSubject('Selected engineering projects, November 2026')
page=0

def text(s,x,y,size=10,font='Sans',color=ink):
 c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,H-y-size,s)
def para(s,x,y,w,size=10.3,font='Sans',color=ink,leading=None):
 p=Paragraph(s,ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.5,textColor=HexColor(color)));a,h=p.wrap(w,700);p.drawOn(c,x,H-y-h);return y+h

def line(y,x=M,w=CW):
 c.setStrokeColor(HexColor('#CBD1C9'));c.setLineWidth(.5);c.line(x,H-y,x+w,H-y)
def photo(name,x,y,w,h):
 im=Image.open(ROOT/'media'/name);iw,ih=im.size;scale=min(w/iw,h/ih);ww,hh=iw*scale,ih*scale
 c.drawImage(str(ROOT/'media'/name),x+(w-ww)/2,H-y-h+(h-hh)/2,ww,hh,mask='auto')
def start(title=None,sub=None,id=None):
 global page
 page+=1;c.setFillColor(HexColor(paper));c.rect(0,0,W,H,fill=1,stroke=0)
 text('Faris Babsail',M,25,9,'Bold');text('Engineering portfolio',414,25,9,color=muted);line(48)
 if title:
  text(title,M,67,31,'Serif');text(sub,M,111,9,color=muted)
 if id:c.bookmarkPage(id);c.addOutlineEntry(title,id)
 line(745);text('fbabsail.github.io',M,757,8.3,color=muted);c.linkURL('https://fbabsail.github.io',(M,19,150,36),relative=0)
 text(f'{page:02d} / 08',529,757,8.3,color=muted)
def end():c.showPage()
def link(id,y=710,label='Project details and recordings online'):
 text(label,M,y,9,'Bold',accent);c.linkURL('https://fbabsail.github.io/#case/'+id,(M,H-y-15,350,H-y+2),relative=0)
def cols(items,y=504):
 for i,(h,b) in enumerate(items):
  x=M+i*274;text(h,x,y,12,'Bold');para(b,x,y+25,250)

start();text('Faris Babsail',M,81,43,'Serif');text('Mechanical engineering & mechatronics',M,143,15)
para('I build robots, work on mechanical design, and write code.',M,180,450,17,'Serif',leading=24)
photo('combat-robot.jpg',M,254,324,245);photo('music-open.jpg',382,254,186,245)
text('Competition hardware and a folding stand prototype.',M,509,8.3,color=muted)
line(544)
para('University of California, Berkeley<br/>B.S. Mechanical Engineering · Expected May 2027',M,563,290,10)
text('Selected work',390,563,11,'Bold')
for i,(label,num) in enumerate([('FactoryOS','02'),('Combat robotics','03'),('Sound tracking','04'),('MusicPod','05'),('MarketplaceOS','06'),('Software & product','07')]):
 text(label,390,589+i*18,9);text(num,550,589+i*18,9,color=muted)
para('CAD and fabrication, embedded control,<br/>simulation, and software.',M,626,300,11,color=muted)
text('fbabsail@gmail.com',M,703,10,'Bold',accent);c.linkURL('mailto:fbabsail@gmail.com',(M,73,240,91))
end()
start('FactoryOS','Independent project · Robotics and manufacturing simulation','factoryos')
para('Making the whole assembly cell work together.',M,143,CW,19,'Serif')
photo('factoryos-overview.jpg',M,192,CW,294)
text('Panda robot, assembly station, and a 3.2 m infeed conveyor in simulation.',M,491,8.2,color=muted)
cols([('The system','I built a MuJoCo assembly simulator with contact-driven conveyors, camera-guided pickup, and multi-part assembly tasks. Simulated RGB-D images support part-pose estimation and depth tracking.'),('The engineering question','A successful pickup is only the beginning. The part must be seated, released, and cleared. Layout editing, saved runs, failure reports, and replay make those interactions easier to inspect.')],527)
para('Python / FastAPI / React / TypeScript / Three.js<br/>Built and tested in simulation; hardware validation is a next step.',M,662,CW,9,color=muted)
link('factoryos',710);end()
start('1-lb Combat Robot','Berkeley Combat Robotics Club · Aug 2024-May 2026','combat')
para('Designing for impact, with every gram accounted for.',M,143,CW,19,'Serif')
photo('combat-robot.jpg',M,192,CW,341)
text('The assembled robot on the bench, with wiring and drive components exposed.',M,541,8.2,color=muted)
cols([('My contribution','CAD, FEA, load-path analysis, and structural redesign. I machined, printed, soldered, and assembled components, then piloted the robot in competition.'),('Tradeoff and result','Structural changes had to preserve impact resistance while staying within the 1-lb limit. Iterative build-test cycles informed revisions. The robot placed second in its division.')],578)
link('combat');end()
start('Sound-Tracking Robot','UC Berkeley ME135 capstone · Jan-May 2025','sound')
para('From microphone signals to physical movement.',M,143,CW,19,'Serif')
photo('sound-robot.png',M,192,324,264);photo('sound-gui.png',386,192,182,264)
text('Integrated robot hardware and the serial control/debugging interface.',M,468,8.2,color=muted)
cols([('Hardware and control','I designed and printed the chassis and integrated the ESP32, dual MAX4466 microphones, and servo mechanics. An HC-SR04 sensor supports obstacle avoidance.'),('Embedded architecture','FreeRTOS tasks separate drive logic, sound tracking and servo control, and UART commands. Tracking and drive tasks use configured periods of 40 ms and 50 ms.')],511)
para('I built the desktop GUI for live data, Drive / Track / Pause commands, and debugging. The completed system was presented as the ME135 capstone.',M,656,CW,10)
link('sound');end()
start('MusicPod','UC Berkeley · Jan-May 2026','music')
para('A failed printed pin led to a better joint.',M,143,CW,19,'Serif')
photo('music-folded.jpg',M,190,155,245);photo('music-open.jpg',210,190,155,245);photo('music-in-use.jpg',376,190,192,245)
text('Folded, deployed, and carrying sheet music.',M,447,8.2,color=muted)
cols([('Prototype to redesign','I worked on the concept, CAD, materials, fit and tolerances, GD&T drawings, and FDM prototyping. When printed pins failed, I replaced them with 6061-T6 aluminum support shafts and revised the hinge.'),('What testing exposed','The stand uses a universal 1/4-20 tripod interface. Testing also revealed inconsistent wing/console fit across prints and unreliable magnetic retention. Refining those interfaces remains the next step.')],488)
photo('music-drawing.png',M,645,150,75);para('CAD, working drawings, physical prototypes, and fit specifications supported the design through fabrication and revision.',218,655,350,9,color=muted)
link('music',724,label='View the project and team demonstration');end()
start('MarketplaceOS','Independent project · Delivery operations simulation','marketplaceos')
para('Replay the same evening. Change the policy.',M,143,CW,19,'Serif')
photo('marketplaceos-compare.jpg',M,190,CW,328)
text('Baseline and driver-incentive policies at the same recorded cutoff.',M,525,8.2,color=muted)
cols([('What I built','A discrete-event simulator for orders, kitchen queues, dispatch, and road travel. The map and timeline connect driver movement to individual order histories, cancellations, revenue, and costs.'),('A controlled comparison','Paired replays begin from the same market state and share demand opportunities and weather. Results report changes in deliveries and contribution with uncertainty intervals.')],560)
para('Python / FastAPI / React / TypeScript / MapLibre<br/>Synthetic demand and simplified roads; results describe simulated evenings.',M,675,CW,9,color=muted)
link('marketplaceos',719);end()
start('Software & product','Language learning and procedural worlds','software')
text('Cognate',M,150,23,'Serif')
para('English learning shaped around the learner.',M,188,315,12,'Bold')
para('As CFO / Financial Analyst on the founding team, I worked on projections, the business model, and go-to-market strategy. I also programmed most of the app, bringing an Arabic-language and Saudi perspective to its initial audience.',M,219,315,10.3)
para('The team won its division at Berkeley\'s SCET BMOE Bootcamp and represented Berkeley as finalists in the Global Student Startup Competition in Seoul.',M,328,315,10.3)
photo('cognate-home.png',395,150,76,238);photo('cognate-lesson.png',487,150,76,238)
c.linkURL('https://fbabsail.github.io/#case/cognate',(M,H-180,180,H-145))
line(421)
text('Tidebound',M,445,23,'Serif');text('UC Berkeley · Spring 2026 · Built with Alec Wild',M,484,9,color=muted)
photo('tidebound-path.png',M,518,258,162)
para('A Java game engine with seeded world generation, minimum-spanning-tree room connections, and breadth-first search for shortest routes.',325,518,243,10.3)
para('Deque-backed state snapshots support undo and redo. Save/load restores the world seed, current state, and history stacks.',325,609,243,10.3)
link('tidebound',710,label='Explore the game and implementation');end()
start('Beyond the projects','Experience, research, and technical practice','experience')
text('Experience',M,153,21,'Serif')
for y,title,meta,body in [(197,'Oliver Wyman','Consultant Intern · Riyadh · Jun-Sep 2026','Collections analytics, cohort pilots, Excel dashboards, and implementation coordination. Helped standardize legal-case reporting with defined data sources and owners.'),(303,'Saudi Industrial Development Fund','Project Analyst Intern · Riyadh · Jun-Aug 2025','Technical and financial analysis of manufacturing automation. Modeled automation ROI and supported industrial project appraisals.'),(409,'KAUST','Research Assistant · Jul 2022-Jan 2023','Ultra-lean hydrogen combustion research using CHEMKIN and PCC technology, including laminar flame speed and ignition-delay analysis.')]:
 text(title,M,y,12,'Bold');text(meta,M,y+21,8.7,color=muted);para(body,274,y,294,10)
line(500)
text('Additional engineering work',M,521,18,'Serif')
para('<b>Wearable exoskeleton</b><br/>CAD, structural considerations, prototyping, and user testing at Berkeley Nanotechnology Lab.',M,559,250,10)
para('<b>Computational imaging</b><br/>Arduino Leonardo light sensing, a sensor matrix, and image reconstruction in Python and NumPy.',318,559,250,10)
line(646)
text('Let’s build something.',M,669,22,'Serif')
text('fbabsail@gmail.com',M,710,10,'Bold',accent);text('linkedin.com/in/fbabsail',355,710,10,color=accent)
c.linkURL('mailto:fbabsail@gmail.com',(M,63,230,84));c.linkURL('https://www.linkedin.com/in/fbabsail',(355,63,568,84))
end();c.save()
print(OUT)
