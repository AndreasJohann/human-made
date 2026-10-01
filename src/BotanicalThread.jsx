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

/* Monotone-y cubic joins preserve a genuinely organic silhouette without
   rendering the viewport-to-path lookup ambiguous on reverse scrolling. */
function organicCurve(points){
 if(points.length<2)return'';
 let d='M '+round(points[0].x)+' '+round(points[0].y);
 for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1],prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+2)];
  const dy=Math.max(.1,b.y-a.y);
  const t1=(b.x-prev.x)*.20,t2=(next.x-a.x)*.20;
  d+=' C '+round(a.x+t1)+' '+round(a.y+dy*.34)
    +' '+round(b.x-t2)+' '+round(b.y-dy*.34)
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
  const entry=top+padTop*.52;
  const exit=index===6?Math.min(bottom-250,bottom-padBottom*.76):bottom-padBottom*.50;
  return{id,node,index,top,bottom,entry,exit,side,lane,amplitude,contentLeft,contentRight};
 }).filter(Boolean);
 if(sections.length!==IDS.length)return null;
 const all=[],markers=[];
 const add=p=>{
  if(!all.length||p.y>all[all.length-1].y+.09)all.push({x:p.x,y:p.y});
 };
 const sectionX=(s,t)=>{
  const drift=Math.sin(t*Math.PI*4.4+s.index*.54)*s.amplitude*.91;
  const slow=Math.sin(t*Math.PI*2.25+s.index*.67)*s.amplitude*.22;
  // A left gutter moves towards the edge; right gutter mirrors the shape.
  return s.lane+(s.side==='left'?1:-1)*(drift+slow);
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
  for(let step=1;step<=13;step++){
   const t=step/13;
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
   // Page transitions only inhabit the extra whitespace between sections.
   // Multiple waves make them feel like a growing branch, not a diagonal
   // connector. All y positions ascend, so upward scrolling truly reverses.
   const crossX=t=>{
    const main=x0+(x1-x0)*ease(t);
    const sway=(compact?16:clamp(gap*.20,36,108));
    const wave=Math.sin(t*Math.PI*3.4)*Math.sin(t*Math.PI)*sway;
    return main+wave;
   };
   // A second, smaller vertical wave removes the ruler-straight
   // diagonal without violating monotone-y progress needed on scroll-up.
   const crossY=t=>start+gap*t+
     Math.sin(t*Math.PI*2.4)*Math.sin(t*Math.PI)*Math.min(49,gap*.075);
   for(let step=1;step<=15;step++){
    const t=step/15;
    add({x:crossX(t),y:crossY(t)});
   }
   [0.18,.31,.45,.57,.70,.83].forEach((t,i)=>{
    if(compact&&i%2) return;
    markers.push({x:crossX(t),y:crossY(t),dir:i%2?-1:1,
      scale:compact?.46:.83,variant:(index+i+1)%3});
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
  let raf=0;
  const draw=()=>{
   raf=0;
   if(!routeRef.current||!main.current)return;
   const tipY=reduced?layout.height:
     clamp(window.innerHeight*.86-routeRef.current.getBoundingClientRect().top,0,layout.height);
   let drawn=total;
   if(!reduced){
    // Every cubic segment has strictly increasing y; an actual path-length
    // lookup eliminates the pauses produced by generic page percentages.
    let low=0,high=total;
    for(let i=0;i<19;i++){
     const middle=(low+high)*.5;
     if(el.getPointAtLength(middle).y<tipY)low=middle;else high=middle;
    }
    drawn=(low+high)*.5;
   }
   el.style.strokeDashoffset=String(Math.max(0,total-drawn));
   for(const entry of segments){
    const {node,len,group,start,end}=entry;
    const startY=Number(group.dataset.growY);
    const span=Number(group.dataset.growSpan);
    const p=reduced?1:clamp((tipY-startY)/span);
    const fraction=ease((p-start)/Math.max(.02,end-start));
    const offset=len*(1-fraction);
    if(entry.lastOffset===offset)continue;
    node.style.strokeDashoffset=String(offset);
    entry.lastOffset=offset;
   }
   const center=root.querySelector('[data-flower-center]');
   if(center){
    const flower=root.querySelector('.big-botanical-bloom');
    const p=reduced?1:clamp((tipY-Number(flower.dataset.growY))/
       Number(flower.dataset.growSpan));
    center.style.opacity=String(ease((p-.83)/.17));
   }
   root.dataset.scrollTip=String(Math.round(tipY));
   root.dataset.mainDrawn=String(Math.round(100*drawn/Math.max(1,total)));
  };
  const request=()=>{if(!raf)raf=requestAnimationFrame(draw)};
  request();
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request);
  return()=>{cancelAnimationFrame(raf);
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
