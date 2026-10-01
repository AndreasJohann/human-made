import React, { useEffect, useRef, useState } from 'react';

/* Hand-drawn, scroll-grown plant: the long stem stretches with the page;
   each twig and leaf sits in its own proportional SVG so leaves stay delicate. */
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { const v=clamp(x); return v*v*(3-2*v); };
const SPRIGS = [
  { at:.075, mirror:false }, { at:.185, mirror:true },
  { at:.305, mirror:false }, { at:.425, mirror:true },
  { at:.545, mirror:false }, { at:.665, mirror:true },
  { at:.785, mirror:false }, { at:.895, mirror:true }
];
const MOTIFS = [
 {branches:[
   'M60 108 C47 94 39 76 37 58 S27 35 25 26',
   'M43 78 C57 68 72 56 85 34',
   'M51 93 C38 91 30 87 21 78'],
  leaves:[
   ['M25 26 Q9 18 14 4 Q28 11 25 26 Z','M25 26 Q22 15 15 5'],
   ['M37 58 Q17 56 17 42 Q31 43 37 58 Z','M37 58 Q27 49 18 43'],
   ['M85 34 Q90 15 108 13 Q104 31 85 34 Z','M85 34 Q97 24 107 14'],
   ['M69 51 Q69 33 84 25 Q86 42 69 51 Z','M69 51 Q78 36 84 26'],
   ['M21 78 Q8 65 10 53 Q21 59 21 78 Z','M21 78 Q16 65 11 55']]},
 {branches:[
   'M60 108 C69 91 78 77 77 56 S80 36 90 21',
   'M75 64 C55 58 45 51 37 35',
   'M67 88 C86 78 100 70 109 55'],
  leaves:[
   ['M90 21 Q91 6 108 7 Q107 23 90 21 Z','M90 21 Q98 13 107 8'],
   ['M77 56 Q66 41 76 30 Q86 40 77 56 Z','M77 56 Q77 43 76 31'],
   ['M37 35 Q18 34 14 19 Q32 22 37 35 Z','M37 35 Q24 26 15 20'],
   ['M51 52 Q40 40 47 24 Q57 37 51 52 Z','M51 52 Q50 38 47 25'],
   ['M109 55 Q105 37 117 27 Q123 44 109 55 Z','M109 55 Q118 42 117 28']]},
 {branches:[
   'M60 108 C57 88 48 73 53 58 S67 34 70 14',
   'M54 71 C36 66 23 61 17 47',
   'M57 90 C77 86 89 76 97 65'],
  leaves:[
   ['M70 14 Q62 4 69 0 Q80 4 70 14 Z','M70 14 Q71 7 69 1'],
   ['M53 58 Q38 46 43 31 Q55 39 53 58 Z','M53 58 Q50 43 44 32'],
   ['M17 47 Q5 39 10 25 Q22 34 17 47 Z','M17 47 Q14 32 11 26'],
   ['M34 63 Q20 67 10 58 Q23 50 34 63 Z','M34 63 Q19 59 11 58'],
   ['M97 65 Q97 46 113 41 Q111 60 97 65 Z','M97 65 Q105 54 112 42']]}
];
function DrawnStroke({d, progress, className}) {
  const ref = useRef(null);
  const [length, setLength] = useState(200);
  useEffect(() => {
    if (ref.current) setLength(ref.current.getTotalLength());
  }, [d]);
  return <path ref={ref} d={d} className={className}
    style={{strokeDasharray:length, strokeDashoffset:length*(1-ease(progress))}} />;
}
function Sprig({at,mirror,kind,progress,reduced}) {
  const motif=MOTIFS[kind];
  const grown=reduced || progress>at+.071;
  const branch=reduced?1:clamp((progress-at)/.048);
  return <div className={'botanical-sprig'+(grown?' grown':'')}
    style={{top:(at*100)+'%'}}>
    <svg viewBox="0 0 140 128" aria-hidden="true">
      <g transform={mirror?'translate(120 0) scale(-1 1)':undefined}>
        {motif.branches.map((d,i)=><DrawnStroke key={i} d={d}
          className="sprig-twig"
          progress={reduced?1:clamp((branch-i*.14)/(.8-i*.08))}/>)}
        {motif.leaves.map(([outline,vein],i)=>{
          const g=reduced?1:clamp((progress-at-.02-i*.007)/.054);
          return <g key={i}>
            <DrawnStroke d={outline} className="sprig-leaf" progress={g}/>
            <DrawnStroke d={vein} className="sprig-vein"
              progress={reduced?1:clamp((g-.55)/.45)}/>
          </g>;
        })}
      </g>
    </svg>
  </div>;
}
export default function BotanicalThread({progress,reduced}) {
  const path=useRef(null);
  const [length,setLength]=useState(1550);
  useEffect(()=>{if(path.current)setLength(path.current.getTotalLength())},[]);
  return <div className="botanical-thread" aria-hidden="true" data-growth={Math.round(progress*100)}>
    <svg className="botanical-spine" viewBox="0 0 140 1200"
      preserveAspectRatio="none" aria-hidden="true">
      <path ref={path} className="thread-stem"
        d="M60 -4 C72 102 43 185 57 278 S76 422 58 530 S41 682 61 777 S81 933 57 1036 S48 1140 60 1205"
        style={{strokeDasharray:length,
          strokeDashoffset:reduced?0:length*(1-ease(progress))}}/>
    </svg>
    {SPRIGS.map(({at,mirror},i)=><Sprig key={at} at={at}
      mirror={mirror} kind={i%3} progress={progress} reduced={reduced}/>)}
  </div>;
}
