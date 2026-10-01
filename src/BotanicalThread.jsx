import React,{useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';

/**
 * Human Made: botanical, layout-responsive scroll illustration.
 *
 * The vine follows real block boundaries. It alternates left/right outside
 * content, crosses only in deliberately reserved whitespace, and grows from
 * the actual viewport position in both scroll directions. A large flower
 * blooms in the clear area beneath Lea & Jessi.
 */
const IDS=['idea','foundations','project','indonesia','road','involved','people'];
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const round=n=>Number(n.toFixed(2));
const PETALS=Array.from({length:8},(_,i)=>i*45);

/* C1-continuous botanical spline. The previous segment-local control
   handles had different slopes at shared points, creating visible corners.
   Compute ONE smoothed derivative per knot, shared by its neighbours.
   Control-point y is monotone, preserving accurate upward scroll reversal. */
function organicCurve(points){
 if(points.length<2)return'';
 const slopes=points.map((p,i)=>{
  const before=points[Math.max(0,i-1)];
  const after=points[Math.min(points.length-1,i+1)];
  const span=Math.max(.25,after.y-before.y);
  const central=(after.x-before.x)/span;
  if(i===0||i===points.length-1)return central;
  const previous=(p.x-before.x)/Math.max(.25,p.y-before.y);
  const following=(after.x-p.x)/Math.max(.25,after.y-p.y);
  // Dampen abrupt direction changes instead of carrying corners into
  // the next curve. Preserve gentle reversals as round inflections.
  return previous*following<=0?central*.34:central*.83;
 });
 let d='M '+round(points[0].x)+' '+round(points[0].y);
 for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1],dy=Math.max(.1,b.y-a.y);
  // Tangent slopes are shared, so every junction is visually seamless.
  const handle=dy/3;
  const c1x=a.x+slopes[i]*handle;
  const c2x=b.x-slopes[i+1]*handle;
  d+=' C '+round(c1x)+' '+round(a.y+handle)
    +' '+round(c2x)+' '+round(b.y-handle)
    +' '+round(b.x)+' '+round(b.y);
 }
 return d;
}
function buildRoute(route){
 const root=route.getBoundingClientRect(),width=root.width;
 const compact=window.innerWidth<960;
 const sections=IDS.map((id,index)=>{
  const node=route.querySelector('#'+id);
  if(!node)return null;
  const r=node.getBoundingClientRect(),style=getComputedStyle(node);
  const inner=node.querySelector('.chapter-inner, .content-width');
  const box=inner?.getBoundingClientRect()||r;
  const innerCSS=inner?getComputedStyle(inner):null;
  const contentLeft=box.left-root.left+(parseFloat(innerCSS?.paddingLeft)||0);
  const contentRight=box.right-root.left-(parseFloat(innerCSS?.paddingRight)||0);
  // Stay close enough to the *content* to read as an illustration of
  // each block, not a fixed edge decoration, while leaving leaf room.
  const leftSpace=contentLeft,rightSpace=width-contentRight;
  const leftOffset=Math.min(122,Math.max(compact?35:78,leftSpace*.44));
  const rightOffset=Math.min(122,Math.max(78,rightSpace*.44));
  const leftLane=compact
    ? clamp(contentLeft-leftOffset,29,Math.max(37,contentLeft-32))
    : clamp(contentLeft-leftOffset,48,contentLeft-50);
  const rightLane=clamp(contentRight+rightOffset,contentRight+48,width-46);
  const top=r.top-root.top,bottom=r.bottom-root.top;
  const padTop=parseFloat(style.paddingTop)||120,padBottom=parseFloat(style.paddingBottom)||120;
  const side=compact?'left':index%2?'right':'left';
  const lane=side==='left'?leftLane:rightLane;
  // A measured safe radius; curves and leaf shoots remain in the reserved
  // gutter instead of spilling into the copy column.
  const outerSpace=side==='left'?contentLeft:width-contentRight;
  const amplitude=compact?clamp(outerSpace*.10,5,10):clamp(outerSpace*.26,22,59);
  const entry=top+padTop*.83;
  const exit=index===6?Math.min(bottom-250,bottom-padBottom*.76):bottom-padBottom*.83;
  return{id,node,index,top,bottom,entry,exit,side,lane,amplitude,contentLeft,contentRight};
 }).filter(Boolean);
 if(sections.length!==IDS.length)return null;
 const all=[],markers=[];
 const add=p=>{
  if(!all.length||p.y>all[all.length-1].y+.09)all.push({x:p.x,y:p.y});
 };
 const sectionX=(s,t)=>{
  // One broad, rounded botanical bow per section. The envelope has zero
  // derivative at both ends, so the cross-page bridge meets it smoothly.
  // Tiny asymmetry keeps it organic without repeated narrow S-kinks.
  const envelope=Math.sin(Math.PI*t)**2;
  const bow=envelope*(.73+.09*Math.sin(Math.PI*2*t+s.index*.42));
  return s.lane+(s.side==='left'?1:-1)*s.amplitude*bow;
 };
 const first=sections[0],firstLane=first.lane;
 add({x:compact?firstLane:firstLane+21,y:0});
 add({x:firstLane+Math.min(28,first.amplitude),y:30});
 add({x:firstLane-Math.min(11,first.amplitude*.38),y:Math.max(48,first.entry*.49)});
 add({x:firstLane,y:first.entry});
 sections.forEach((s,index)=>{
  const h=Math.max(80,s.exit-s.entry);
  // Several irregular bends inside each gutter. Each location is spaced
  // in y, never generating the near-straight line of the previous design.
  for(let step=1;step<=19;step++){
   const t=step/19;
   add({x:sectionX(s,t),y:s.entry+h*t});
  }
  const at=[.11,.24,.38,.52,.66,.80,.92];
  at.forEach((t,i)=>{
   if(compact&&i%2) return;
   // A little sketch cluster has two recognizable leaves and visible veins.
   // Across a page this creates a rich, but still fine, botanical drawing.
   markers.push({x:sectionX(s,t),y:s.entry+h*t,dir:s.side==='left'?-1:1,
    scale:compact?.52:.87,variant:(i+index)%3});
  });
  const next=sections[index+1];
  if(next){
   const start=s.exit,end=next.entry,gap=end-start;
   const x0=sectionX(s,1),x1=next.lane;
   // Single generous side-to-side transition across EXISTING section
   // padding: no extra blank interstitial screens and no zigzagging S-wave.
   // The cubic easing leaves both ends vertically tangent to their lanes.
   const crossX=t=>x0+(x1-x0)*ease(t);
   const crossY=t=>start+gap*t;
   for(let step=1;step<=15;step++){
    const t=step/15;
    add({x:crossX(t),y:crossY(t)});
   }
   // Minimal leaves on the bridge itself: richer foliage lives alongside
   // the content. Never cluster six sprigs in the middle of a transition.
   [0.16,.84].forEach((t,i)=>{
    markers.push({x:crossX(t),y:crossY(t),dir:i===0?(s.side==='left'?-1:1):(next.side==='left'?-1:1),
      scale:compact?.44:.7,variant:(index+i+1)%3});
   });
  }
 });
 // The lower part of the final chapter has deliberately reserved space.
 // Sweep inward below the biographies, then resolve in a large open flower.
 const last=sections[sections.length-1],flower={
  x:width*(compact?.53:.51),y:last.bottom-(compact?128:159),
  scale:compact?.73:1.27
 };
 const from=all[all.length-1],flowerBase=flower.y+91*flower.scale;
 const tail=flowerBase-from.y;
 [
  [.15,from.x+(flower.x-from.x)*.08],
  [.37,from.x+(flower.x-from.x)*.32],
  [.65,from.x+(flower.x-from.x)*.78],
  [.85,flower.x+(compact?7:-17)],
  [1,flower.x]
 ].forEach(([t,x])=>add({x,y:from.y+tail*t}));
 const d=organicCurve(all);
 return{d,width,height:root.height,sections,markers,flower,compact};
}

/* Each motif consists of two elongated, closed leaf contours that emerge
   from twigs, with a finer midrib. This deliberately echoes fine pencil
   botanical illustrations rather than generic icon-shaped foliage. */
const MOTIFS=[
 {branch:['M0 0 C-8 -8 -20 -12 -30 -27','M-7 -6 C-8 -24 -2 -33 7 -46'],
  leaves:[
   ['M-30 -27 C-46 -33 -57 -45 -56 -60 C-39 -59 -28 -46 -30 -27 Z','M-30 -27 Q-42 -44 -55 -59'],
   ['M7 -46 C3 -58 7 -72 19 -82 C29 -63 22 -51 7 -46 Z','M7 -46 Q18 -65 19 -81']
  ]},
 {branch:['M0 0 C-9 -9 -15 -22 -12 -39','M-2 -9 C-17 -10 -29 -20 -41 -33'],
  leaves:[
   ['M-12 -39 C-25 -52 -22 -67 -13 -78 C1 -62 -2 -48 -12 -39 Z','M-12 -39 Q-13 -60 -13 -76'],
   ['M-41 -33 C-59 -37 -70 -49 -71 -63 C-53 -61 -39 -51 -41 -33 Z','M-41 -33 Q-55 -52 -70 -62']
  ]},
 {branch:['M0 0 C-9 -10 -11 -24 -21 -35','M-9 -10 C-13 -16 -30 -15 -41 -22'],
  leaves:[
   ['M-21 -35 C-38 -46 -42 -58 -38 -74 C-18 -64 -15 -50 -21 -35 Z','M-21 -35 Q-32 -56 -37 -72'],
   ['M-41 -22 C-53 -19 -68 -24 -78 -37 C-60 -46 -46 -39 -41 -22 Z','M-41 -22 Q-60 -31 -76 -37']
  ]}
];
function Sprig({marker}){
 const {x,y,dir,scale,variant}=marker,m=MOTIFS[variant];
 return <g data-grow-y={y} data-grow-span="176"
   transform={'translate('+x+' '+y+') scale('+(-dir*scale)+' '+scale+')'}>
   {m.branch.map((d,i)=><path key={'b'+i} d={d} className="drawn-twig"
      data-stroke-start={i*.11} data-stroke-end={.49+i*.12}/>)}
   {m.leaves.map(([outline,vein],i)=><g key={'l'+i}>
      <path d={outline} className="drawn-leaf"
       data-stroke-start={.26+i*.17} data-stroke-end={.82+i*.11}/>
      <path d={vein} className="drawn-vein"
       data-stroke-start={.64+i*.12} data-stroke-end={.99}/>
    </g>)}
 </g>;
}
function Flower({x,y,scale}){
 return <g data-grow-y={y-175*scale} data-grow-span={255*scale}
   transform={'translate('+x+' '+y+') scale('+scale+')'}
   className="big-botanical-bloom">
   <path d="M0 91 C-22 74 -7 45 0 19" className="drawn-twig"
     data-stroke-start="0" data-stroke-end=".34"/>
   <path d="M-6 69 C-35 67 -45 51 -46 37 C-21 40 -10 48 -6 69 Z"
     className="drawn-leaf" data-stroke-start=".1" data-stroke-end=".42"/>
   {PETALS.map((angle,i)=><g key={angle} transform={'rotate('+angle+')'}>
     <path d="M0 -8 C-35 -28 -46 -68 -14 -89 Q-1 -104 14 -89 C46 -69 34 -30 0 -8 Z"
       className="drawn-petal" data-stroke-start={.23+i*.066}
       data-stroke-end={.66+i*.038}/>
     <path d="M0 -12 C-4 -36 -4 -65 0 -85"
       className="drawn-vein" data-stroke-start={.53+i*.041} data-stroke-end=".98"/>
    </g>)}
   <circle cx="0" cy="0" r="8.5" fill="#a49c76"
     data-flower-center="true" opacity="0"/>
 </g>;
}

/* Browser measurements and SVG drawing are deliberately decoupled.
   Scroll events mutate stroke dash-offsets in requestAnimationFrame,
   without React state updates that could restart a long drawing. */
export default function BotanicalThread({routeRef,reduced}){
 const [layout,setLayout]=useState(null);
 const svg=useRef(null),main=useRef(null),lengths=useRef({total:0,segments:[]});
 const measure=useCallback(()=>{
  if(!routeRef.current)return;
  const next=buildRoute(routeRef.current);
  if(next)setLayout(previous=>{
   if(previous&&previous.d===next.d&&previous.height===next.height
      &&previous.width===next.width)return previous;
   return next;
  });
 },[routeRef]);
 useEffect(()=>{
  const route=routeRef.current;if(!route)return;
  let frame=0;
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure)};
  const observer=new ResizeObserver(schedule);
  observer.observe(route);
  IDS.forEach(id=>{const el=route.querySelector('#'+id);if(el)observer.observe(el)});
  window.addEventListener('resize',schedule);
  document.fonts?.ready.then(schedule);
  const images=[...route.querySelectorAll('img')];
  images.forEach(img=>img.addEventListener('load',schedule));
  schedule();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();
   window.removeEventListener('resize',schedule);
   images.forEach(img=>img.removeEventListener('load',schedule));
  };
 },[routeRef,measure]);
 useLayoutEffect(()=>{
  const el=main.current,root=svg.current;
  if(!el||!root||!layout)return;
  const total=el.getTotalLength();
  const segments=[...root.querySelectorAll('path[data-stroke-start]')].map(node=>{
   const len=node.getTotalLength();
   node.style.strokeDasharray=String(len);
   node.style.strokeDashoffset=String(len);
   return{node,len,group:node.closest('[data-grow-y]'),lastOffset:null,
     start:Number(node.dataset.strokeStart),end:Number(node.dataset.strokeEnd)};
  });
  lengths.current={total,segments};
  el.style.strokeDasharray=String(total);
  let raf=0,displayedY=null,previousFrame=0,alive=true;
  const center=root.querySelector('[data-flower-center]');
  const flower=root.querySelector('.big-botanical-bloom');
  const draw=(time=0)=>{
   raf=0;
   if(!alive||!routeRef.current||!main.current)return;
   // Animate Y rather than path length: where the route crosses the
   // screen, its LONG horizontal arc can advance faster automatically,
   // while the surrounding content retains a normal scroll rhythm.
   const targetY=reduced?layout.height:
     clamp(window.innerHeight*.69-routeRef.current.getBoundingClientRect().top,0,layout.height);
   if(displayedY===null){
     // Direct anchor navigation starts from the correct visible position.
     displayedY=targetY;
   }else if(reduced){
     displayedY=layout.height;
   }else{
     const elapsed=previousFrame?clamp((time-previousFrame)/1000,0,.05):1/60;
     const follow=1-Math.exp(-elapsed/.095);
     displayedY+= (targetY-displayedY)*follow;
     if(Math.abs(targetY-displayedY)<.65)displayedY=targetY;
   }
   previousFrame=time;
   let drawn=total;
   if(!reduced){
     let low=0,high=total;
     for(let i=0;i<19;i++){
       const mid=(low+high)*.5;
       if(el.getPointAtLength(mid).y<displayedY)low=mid;else high=mid;
     }
     drawn=(low+high)*.5;
   }
   el.style.strokeDashoffset=String(Math.max(0,total-drawn));
   // Sprigs grow only once the MAIN drawn tip reaches their attachment;
   // slowing the vine therefore also slows its foliage and final bloom.
   const drawnTipY=el.getPointAtLength(drawn).y;
   for(const entry of segments){
    const {node,len,group,start,end}=entry;
    const startY=Number(group.dataset.growY);
    const span=Number(group.dataset.growSpan);
    const p=reduced?1:clamp((drawnTipY-startY)/span);
    const fraction=ease((p-start)/Math.max(.02,end-start));
    const offset=len*(1-fraction);
    if(Math.abs((entry.lastOffset??-9999)-offset)<.025)continue;
    node.style.strokeDashoffset=String(offset);
    entry.lastOffset=offset;
   }
   if(center&&flower){
    const p=reduced?1:clamp((drawnTipY-Number(flower.dataset.growY))/
      Number(flower.dataset.growSpan));
    center.style.opacity=String(ease((p-.83)/.17));
   }
   root.dataset.scrollTip=String(Math.round(drawnTipY));
   root.dataset.mainDrawn=String(Math.round(100*drawn/Math.max(1,total)));
   // Keep drawing during catch-up even after a touchpad swipe ends.
   if(!reduced&&Math.abs(targetY-displayedY)>.65)request();
  };
  const request=()=>{if(alive&&!raf)raf=requestAnimationFrame(draw)};
  request();
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request);
  return()=>{alive=false;cancelAnimationFrame(raf);
   window.removeEventListener('scroll',request);
   window.removeEventListener('resize',request);
  };
 },[layout,reduced,routeRef]);
 if(!layout)return null;
 return <svg ref={svg} className="botanical-map"
  viewBox={'0 0 '+round(layout.width)+' '+round(layout.height)}
  preserveAspectRatio="none" role="presentation" aria-hidden="true"
  data-layout-aware="true" data-side-switches={layout.compact?0:6}>
   <path ref={main} d={layout.d} className="botanical-main-path"/>
   {layout.markers.map((m,i)=><Sprig key={i} marker={m}/>)}
   <Flower {...layout.flower}/>
 </svg>;
}
