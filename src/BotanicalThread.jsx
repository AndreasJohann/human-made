import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';

/**
 * Layout-aware living line for Human Made.
 *
 * The SVG occupies the entire narrative, NOT the viewport. The curve is
 * rebuilt from measured section boundaries; inside each section it stays
 * in the reserved outer gutter. Left/right transitions happen ONLY in
 * the empty vertical padding between adjacent sections.
 * A position-based reveal draws continuously at the scroll position;
 * the leaves and the final flower bloom as the growing tip reaches them.
 */
const IDS=['idea','foundations','project','indonesia','road','involved','people'];
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const LEAVES=[
 {d:'M0 0 C-11 -14 -22 -22 -31 -21 C-28 -5 -13 2 0 0 Z',vein:'M0 0 Q-16 -12 -30 -20'},
 {d:'M0 0 C11 -20 20 -26 31 -24 C25 -8 13 0 0 0 Z',vein:'M0 0 Q17 -16 30 -23'},
 {d:'M0 0 C-15 -10 -22 -9 -30 -7 C-22 5 -8 8 0 0 Z',vein:'M0 0 Q-13 -3 -29 -7'}
];
function strokeStyle(total,progress){return{strokeDasharray:total,strokeDashoffset:total*(1-ease(progress))};}
function FineStroke({d,progress,kind='leaf'}){
 const ref=useRef(null);const [length,setLength]=useState(92);
 useEffect(()=>{if(ref.current)setLength(ref.current.getTotalLength())},[d]);
 return <path ref={ref} d={d} className={'drawn-'+kind} style={strokeStyle(length,progress)}/>;
}
function LeafCluster({x,y,side,progress,scale=.9,variant=0}){
 const data=LEAVES[variant%LEAVES.length];
 const unfurl=clamp(progress);
 // A small fork grows first. The single, veined outline unfolds
 // immediately afterward, rather than appearing as a complete symbol.
 const mirror=side==='right'?-1:1;
 return <g transform={'translate('+x+' '+y+') scale('+(mirror*scale)+' '+scale+')'}>
   <FineStroke d="M0 0 C-7 -7 -13 -16 -16 -29" progress={clamp(unfurl/.54)} kind="twig"/>
   <g transform="translate(-16 -29) rotate(-16)">
     <FineStroke d={data.d} progress={clamp((unfurl-.20)/.65)}/>
     <FineStroke d={data.vein} progress={clamp((unfurl-.63)/.37)} kind="vein"/>
   </g>
 </g>;
}
const PETALS=[0,60,120,180,240,300];
function Bloom({x,y,progress}){
 const p=clamp(progress);
 return <g className="final-bloom" transform={'translate('+x+' '+y+')'}>
   <FineStroke d="M0 45 C-3 24 -6 12 0 0" progress={clamp(p/.27)} kind="twig"/>
   <g>
     {PETALS.map((angle,i)=><g key={angle} transform={'rotate('+angle+' 0 -5)'}>
       <FineStroke d="M0 -5 C-11 -13 -11 -30 0 -37 C11 -28 11 -13 0 -5" progress={clamp((p-.21-i*.065)/.4)} kind="petal"/>
       <FineStroke d="M0 -7 L0 -24" progress={clamp((p-.55-i*.035)/.4)} kind="vein"/>
     </g>)}
     <circle cx="0" cy="-5" r={3.5*ease((p-.72)/.25)} className="flower-center"/>
   </g>
 </g>;
}
function calculateLayout(route){
 const box=route.getBoundingClientRect(),width=box.width;
 const compact=window.innerWidth<800;
 const left=compact?Math.max(29,Math.min(44,width*.085)):
    Math.max(56,(width-1280)/2+60);
 const right=width-left;
 const geometry=IDS.map((id,index)=>{
   const node=route.querySelector('#'+id);
   if(!node)return null;
   const r=node.getBoundingClientRect();
   const cs=getComputedStyle(node);
   const pt=parseFloat(cs.paddingTop)||96;
   const pb=parseFloat(cs.paddingBottom)||96;
   const top=r.top-box.top,bottom=r.bottom-box.top;
   const side=compact?'left':index%2===0?'left':'right';
   // Both entry and exit are in the EMPTY PADDING of the section.
   return{id,top,bottom,entry:top+Math.min(73,pt*.42),
     exit:bottom-Math.min(82,pb*.42),side,x:side==='left'?left:right};
 }).filter(Boolean);
 if(!geometry.length)return null;
 let d='M '+(left+7).toFixed(1)+' 0';
 // Curved handoff from the now-small hero image to the first chapter.
 d+=' C '+(left+16)+' 38 '+(left-8)+' 57 '+left+' '+geometry[0].entry.toFixed(1);
 const leaves=[];
 geometry.forEach((section,index)=>{
   const {x,entry,exit,side}=section;
   const height=Math.max(30,exit-entry);
   const sway=compact?10:17;
   // Organic but constrained to the EMPTY LEFT/RIGHT GUTTER.
   d+=' C '+(x+(side==='left'?sway:-sway)).toFixed(1)+' '+(entry+height*.23).toFixed(1)
      +' '+(x+(side==='left'?-sway:sway)).toFixed(1)+' '+(entry+height*.74).toFixed(1)
      +' '+x.toFixed(1)+' '+exit.toFixed(1);
   const locations=index===0?[.19,.56]:index===6?[.25]:index%2===0?[.38,.79]:[.49];
   locations.forEach((t,i)=>{
     leaves.push({y:entry+height*t,x:x+(i%2===0?4:-5),side,variant:(index+i)%3,scale:compact?.64:.87});
   });
   const next=geometry[index+1];
   if(next){
     const gap=Math.max(12,next.entry-exit);
     if(compact){
       const swing=(index%2?-13:13);
       // Retain winding movement on mobile, where crossing the page
       // would otherwise obscure the single-column copy.
       d+=' C '+(x+swing)+' '+(exit+gap*.3).toFixed(1)
         +' '+(x-swing)+' '+(next.entry-gap*.28).toFixed(1)
         +' '+next.x+' '+next.entry.toFixed(1);
     }else{
       // CROSS SIDE ONLY through the blank inter-chapter whitespace.
       // The two control points introduce a slow, asymmetric S-turn.
       const bend=(next.x-x)*.29;
       d+=' C '+(x+bend*.23).toFixed(1)+' '+(exit+gap*.55).toFixed(1)
        +' '+(next.x-bend*.9).toFixed(1)+' '+(next.entry-gap*.58).toFixed(1)
        +' '+next.x.toFixed(1)+' '+next.entry.toFixed(1);
     }
   }
 });
 const last=geometry[geometry.length-1];
 const flower={x:last.x,y:last.exit-1};
 // Finish by running into the flower, not abruptly ending at a border.
 d+=' C '+(last.x+6)+' '+(last.exit+12)
  +' '+(flower.x-5)+' '+(flower.y+39)
  +' '+flower.x+' '+(flower.y+45);
 return{d,width,height:box.height,leaves,flower,compact,sections:geometry};
}
export default function BotanicalThread({routeRef,progress,reduced}){
 const [layout,setLayout]=useState(null);
 const [length,setLength]=useState(2000);
 const path=useRef(null);
 const compute=useCallback(()=>{
   const route=routeRef.current;if(!route)return;
   setLayout(calculateLayout(route));
 },[routeRef]);
 useEffect(()=>{
   let raf=0;
   const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(compute)};
   const route=routeRef.current;
   if(!route)return;
   const resize=new ResizeObserver(schedule);
   resize.observe(route);
   IDS.forEach(id=>{const s=route.querySelector('#'+id);if(s)resize.observe(s)});
   document.fonts?.ready.then(schedule);
   route.querySelectorAll('img').forEach(img=>img.addEventListener('load',schedule));
   window.addEventListener('resize',schedule);
   schedule();
   return()=>{
     cancelAnimationFrame(raf);resize.disconnect();
     window.removeEventListener('resize',schedule);
     route.querySelectorAll('img').forEach(img=>img.removeEventListener('load',schedule));
   };
 },[compute,routeRef]);
 useEffect(()=>{if(path.current){setLength(path.current.getTotalLength())}},[layout?.d]);
 const totalY=layout?.height||1000;
 const vh=typeof window!=='undefined'?window.innerHeight:800;
 // Route's scroll fraction is converted back to local viewport position:
 // no artificial pauses when the curve travels horizontally between sides.
 const tipY=reduced?totalY:clamp(progress*(totalY-vh*.74)+vh*.53,0,totalY);
 const [visibleLength,setVisibleLength]=useState(0);
 useEffect(()=>{
   if(!path.current||!layout)return;
   if(reduced){setVisibleLength(length);return}
   let low=0,high=length;
   // Path advances monotonically down the page; find the exact
   // length of the position presently reached by the scrolling viewport.
   for(let i=0;i<17;i++){
     const mid=(low+high)/2;
     const point=path.current.getPointAtLength(mid);
     if(point.y<tipY)low=mid;else high=mid;
   }
   setVisibleLength((low+high)/2);
 },[tipY,length,layout?.d,reduced]);
 if(!layout)return null;
 return <svg className="botanical-map"
    viewBox={'0 0 '+layout.width+' '+Math.max(1,layout.height)}
    preserveAspectRatio="none" role="presentation" aria-hidden="true"
    data-vine-visible={Math.round(visibleLength/Math.max(1,length)*100)}
    data-vine-crossings={layout.compact?0:layout.sections.length-1}>
   <path ref={path} className="botanical-main-path" d={layout.d}
      style={{strokeDasharray:length,strokeDashoffset:reduced?0:Math.max(0,length-visibleLength)}}/>
   {layout.leaves.map((leaf,i)=><LeafCluster key={i}
      {...leaf} progress={reduced?1:clamp((tipY-leaf.y)/115)}/>)}
   <Bloom {...layout.flower}
      progress={reduced?1:clamp((tipY-(layout.flower.y-170))/220)}/>
 </svg>;
}
