import BotanicalThread from './BotanicalThread.jsx';
import React, {useEffect, useRef, useState} from 'react';

const HERO = '/assets/Meerblick.jpg';
const COAST = HERO;
const ASSET = '/assets/';
const clamp = (v,min=0,max=1) => Math.min(max,Math.max(min,v));
const copy = {
  en:{
    idea:'The idea',principles:'Foundations',project:'The project',indonesia:'Indonesia',participate:'Get involved',people:'Our story',navCTA:'Participate',
    heroTag:'AN ARCHITECTURE & PARTICIPATION INITIATIVE',headline:'Building places together.',intro:'Human Made is an architecture project in Indonesia. Local knowledge, natural materials and shared work are at the heart of how a place takes shape.',explore:'Explore the idea',join:'Be part of it',discover:'SCROLL TO DISCOVER',
    ideaEye:'01 / THE IDEA',ideaTitle:'Architecture begins with people.',ideaIntro:'What if the people who will shape and use a place become part of its creation?',ideaBody:'Human Made connects local building cultures, practical learning and contemporary needs. Instead of imagining a finished building first, we begin with the relationships, skills and materials that already exist.',ideaQuote:'Weaving together people, place, knowledge and making.',
    foundEye:'02 / THREE FOUNDATIONS',foundTitle:'Rooted in place. Made together.',foundIntro:'These principles connect the material, social and long-term life of a place.',found:[
      ['Material ecology','Working with nature, locally available resources and knowledge of wood, earth and natural fibres.','Icon Natur.png'],
      ['Social autonomy','People contribute their knowledge and labour; planning and learning become a collective process.','Icon Mensch.png'],
      ['Circular life & care','Building and living are connected from the outset, including long-term repair, maintenance and care.','Icon Zusammenarbeit.png']
    ],
    projectEye:'03 / THE PROJECT',projectTitle:'Work together. Live together.',projectBody:'The first project is a cluster in Indonesia: a shared place for workshops, building, gathering and living. Architecture grows alongside the people who participate.',projectLink:'Discover ways to participate',
    indoEye:'04 / CONTEXT',indoTitle:'Learning from the place.',indoBody:'Landscape, climate, building traditions and local materials shape the project. Drawings and photographs offer different views of the same process.',
    roadEye:'05 / THE ROAD AHEAD',roadTitle:'A shared journey.',road:[['NOW — NOV 2026','Concept and preparation','Project framing, connections on site and first partnerships.'],['NOV 2026','Public presentation','Introducing Human Made and opening further conversations.'],['DEC 2026 — JAN 2027','Developing together','Design development, participation and material planning.'],['FROM FEB 2027','Start on site','Planned local preparation and participation.']],
    joinEye:'06 / GET INVOLVED',joinTitle:'There is more than one way in.',joinIntro:'Choose how you might contribute. The next step is simply a conversation.',ways:[['Build together','Take part in hands-on making.'],['Share knowledge','Bring skills and support workshops.'],['Offer land','Suggest a place or local connection.'],['Offer resources','Contribute materials, tools or financial support.'],['Document & share','Help photograph, film or tell the story.']],chosen:'selected',start:'Start a conversation',formIntro:'Your message starts with your selected interests. You can edit it freely.',yourName:'Name',yourEmail:'Email',yourMessage:'Message',reset:'Restore suggested message',send:'Prepare email',emailHint:'Your email app opens. Nothing is submitted automatically.',
    peopleEye:'THE PEOPLE',peopleTitle:'Lea & Jessi',peopleBody:'Having studied architecture together and spent time in Indonesia, Lea and Jessi are exploring what architecture can learn from local materials, the climate and collaborative work.',footer:'An open architecture initiative by Lea & Jessi · Studio Less',skip:'Skip animated introduction',reduce:'Reduced motion: static introduction'
  },
  de:{
    idea:'Die Idee',principles:'Grundlagen',project:'Das Projekt',indonesia:'Indonesien',participate:'Mitmachen',people:'Über uns',navCTA:'Mitmachen',
    heroTag:'ARCHITEKTUR & GEMEINSAME GESTALTUNG',headline:'Orte gemeinsam gestalten.',intro:'Human Made ist ein Architekturprojekt in Indonesien. Lokales Wissen, natürliche Materialien und gemeinsames Arbeiten bestimmen, wie ein Ort entsteht.',explore:'Die Idee entdecken',join:'Teil davon werden',discover:'SCROLLEN & ENTDECKEN',
    ideaEye:'01 / DIE IDEE',ideaTitle:'Architektur beginnt mit Menschen.',ideaIntro:'Was entsteht, wenn die Menschen, die einen Ort prägen und nutzen, auch an seiner Entstehung beteiligt sind?',ideaBody:'Human Made verbindet lokale Bautraditionen, praktisches Lernen und heutige Bedürfnisse. Nicht das fertige Gebäude steht am Anfang, sondern die Beziehungen, Fähigkeiten und Materialien, die bereits vorhanden sind.',ideaQuote:'Menschen, Orte, Wissen und gemeinsames Machen verbinden.',
    foundEye:'02 / DREI GRUNDLAGEN',foundTitle:'Am Ort verwurzelt. Gemeinsam geschaffen.',foundIntro:'Diese Prinzipien verbinden Materialien, gesellschaftliches Miteinander und das langfristige Leben an einem Ort.',found:[
      ['Materialökologie','Mit der Natur, lokal verfügbaren Ressourcen und dem Wissen über Holz, Lehm und Naturfasern arbeiten.','Icon Natur.png'],
      ['Soziale Autonomie','Menschen bringen ihr Wissen und ihre Arbeit ein; Planung und Lernen werden zum gemeinsamen Prozess.','Icon Mensch.png'],
      ['Kreislauf & Pflege','Bauen und Leben gehören von Anfang an zusammen – einschließlich Reparatur, Instandhaltung und Pflege.','Icon Zusammenarbeit.png']
    ],
    projectEye:'03 / DAS PROJEKT',projectTitle:'Gemeinsam arbeiten. Gemeinsam leben.',projectBody:'Das erste Projekt ist ein Gebäudeverbund in Indonesien: ein gemeinsamer Ort für Workshops, Bauen, Begegnungen und Wohnen. Die Architektur entwickelt sich mit den Menschen, die sich beteiligen.',projectLink:'Möglichkeiten zum Mitmachen',
    indoEye:'04 / DER ORT',indoTitle:'Vom Ort lernen.',indoBody:'Landschaft, Klima, Bautraditionen und lokale Materialien prägen das Projekt. Zeichnungen und Fotografien zeigen unterschiedliche Perspektiven auf denselben Prozess.',
    roadEye:'05 / DER WEITERE WEG',roadTitle:'Ein gemeinsamer Weg.',road:[['JETZT — NOV 2026','Konzept & Vorbereitung','Projektrahmen, Kontakte vor Ort und erste Partnerschaften.'],['NOV 2026','Öffentliche Vorstellung','Human Made vorstellen und weitere Gespräche ermöglichen.'],['DEZ 2026 — JAN 2027','Gemeinsam entwickeln','Entwurf, Beteiligung und Materialplanung.'],['AB FEB 2027','Start vor Ort','Geplante Vorbereitungen und Beteiligung vor Ort.']],
    joinEye:'06 / MITMACHEN',joinTitle:'Es gibt mehr als einen Weg hinein.',joinIntro:'Wähle, wie du dich einbringen möchtest. Der nächste Schritt ist zunächst nur ein Gespräch.',ways:[['Gemeinsam bauen','Beim praktischen Bauen mithelfen.'],['Wissen teilen','Fähigkeiten einbringen und Workshops unterstützen.'],['Land anbieten','Einen Ort oder lokale Kontakte vorschlagen.'],['Ressourcen anbieten','Materialien, Werkzeuge oder finanzielle Mittel beisteuern.'],['Dokumentieren & teilen','Fotografieren, filmen oder die Geschichte erzählen.']],chosen:'ausgewählt',start:'Gespräch beginnen',formIntro:'Deine Nachricht enthält bereits deine Auswahl. Du kannst sie frei bearbeiten.',yourName:'Name',yourEmail:'E-Mail',yourMessage:'Nachricht',reset:'Vorgeschlagene Nachricht wiederherstellen',send:'E-Mail vorbereiten',emailHint:'Dein E-Mail-Programm öffnet sich. Die Seite versendet nichts automatisch.',
    peopleEye:'DIE MENSCHEN',peopleTitle:'Lea & Jessi',peopleBody:'Nach ihrem gemeinsamen Architekturstudium und Aufenthalten in Indonesien beschäftigen sich Lea und Jessi damit, was Architektur von lokalen Materialien, Klima und Zusammenarbeit lernen kann.',footer:'Eine offene Architekturinitiative von Lea & Jessi · Studio Less',skip:'Animierten Einstieg überspringen',reduce:'Reduzierte Bewegung: statischer Einstieg'
  }
};

function useReducedMotion(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(m.matches);update();m.addEventListener?.('change',update);return()=>m.removeEventListener?.('change',update)},[]);
  return reduced;
}
function useScrollProgress(ref,calculate){
  const [progress,setProgress]=useState(0);
  useEffect(()=>{
    let raf=0;const onScroll=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(ref.current)setProgress(calculate(ref.current))})};
    onScroll();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);
    return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);cancelAnimationFrame(raf)}
  },[ref,calculate]);
  return progress;
}
const heroProgress = el => {const r=el.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-window.innerHeight))};
const storyProgress = el => {const r=el.getBoundingClientRect();return clamp((window.innerHeight*.13-r.top)/Math.max(1,r.height-window.innerHeight*.74))};
function Easing(v){return v*v*(3-2*v)}

function Intro({t,reduced,lang,stageRef}){
  const localStage=useRef(null);
  const stage=stageRef||localStage;
  const raw=useScrollProgress(stage,heroProgress);
  const p=reduced?1:raw;
  const shrink=Easing(clamp((p-.045)/.55));
  const reveal=Easing(clamp((p-.41)/.31));
  const initial=clamp(1-(p-.14)/.32);
  const screen=typeof window!=='undefined'&&window.innerWidth<=680;
  const top=shrink*(screen?13:15);
  const left=shrink*(screen?5:6);
  const right=shrink*(screen?5:52);
  const bottom=shrink*(screen?45:23);
  const frameStyle={top:top+'%',left:left+'%',right:right+'%',bottom:bottom+'%',borderRadius:(shrink*26)+'px',boxShadow:'0 '+(shrink*26)+'px '+(shrink*70)+'px rgba(27,43,30,'+(shrink*.2)+')'};
  return <section ref={stage} className={'intro-stage'+(reduced?' reduced':'')} id="home" aria-label="Human Made introduction">
    <div className="intro-sticky">
      <div className="image-frame" style={frameStyle}>
        <img className="hero-photo" src={HERO} alt="" style={{transform:'scale('+(1.15-shrink*.15)+')'}} />
        <div className="hero-scrim" style={{opacity:1-shrink*.45}}/>
        <h1 className="hero-wordmark" style={{opacity:initial,transform:'translate(-50%,-50%) scale('+(1-shrink*.17)+')'}}>HUMAN<br/>MADE</h1>
        {!reduced&&<span className="hero-scroll-cue" style={{opacity:initial}}>{t.discover} <span aria-hidden="true">↓</span></span>}
      </div>
      <div className="intro-reveal" style={{opacity:reveal,transform:'translateY('+((1-reveal)*38)+'px)',pointerEvents:reveal>.85?'auto':'none'}}>
        <p className="eyebrow">{t.heroTag}</p><h2>{t.headline}</h2><p>{t.intro}</p>
        <div className="intro-buttons"><a className="btn solid" href="#idea">{t.explore}<span aria-hidden="true">↗</span></a><a className="text-link" href="#involved">{t.join} <span aria-hidden="true">→</span></a></div>
        <span className="intro-facts">INDONESIA <i/> 2027 <i/> STUDIO LESS</span>
      </div>
      {!reduced&&<button className="skip-intro" onClick={()=>document.querySelector('#idea')?.scrollIntoView({behavior:'smooth'})} style={{opacity:1-reveal}}>{t.skip} ↓</button>}
    </div>
  </section>
}
function Header({t,lang,setLang,visible}){
  const [open,setOpen]=useState(false);
  return <header className={'site-header'+(visible?' is-visible':'')}><a className="site-brand" href="#home" aria-label="Human Made home"><span className="brand-leaf" aria-hidden="true">⌁</span> HUMAN MADE</a><nav className={'main-nav'+(open?' open':'')} aria-label="Primary navigation">
    {[['#idea',t.idea],['#foundations',t.principles],['#project',t.project],['#indonesia',t.indonesia],['#people',t.people]].map(([href,label])=><a key={href} href={href} onClick={()=>setOpen(false)}>{label}</a>)}
  </nav><div className="nav-actions"><button className="lang-toggle" aria-label={lang==='en'?'Switch to German':'Zu Englisch wechseln'} onClick={()=>setLang(lang==='en'?'de':'en')}>{lang.toUpperCase()} <span aria-hidden="true">⌄</span></button><a className="btn solid header-cta" href="#involved">{t.navCTA} ↗</a><button aria-label={open?'Close menu':'Open menu'} aria-expanded={open} className="menu" onClick={()=>setOpen(!open)}>{open?'×':'☰'}</button></div></header>
}
function Reveal({children,className=''}) {
  const ref=useRef(null);const [visible,setVisible]=useState(false);
  useEffect(()=>{const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){setVisible(true);ob.unobserve(e.target)}}),{threshold:.12});if(ref.current)ob.observe(ref.current);return()=>ob.disconnect()},[]);
  return <div ref={ref} className={'reveal '+(visible?'on ':'')+className}>{children}</div>
}
function Journey({t}){
  return <div className="journey" id="story">
    <section className="chapter idea-chapter" id="idea"><div className="chapter-inner grid-pair">
      <Reveal className="copy"><span className="eyebrow">{t.ideaEye}</span><h2>{t.ideaTitle}</h2><p className="standfirst">{t.ideaIntro}</p><p>{t.ideaBody}</p><blockquote>{t.ideaQuote}</blockquote></Reveal>
      <Reveal className="illustration-frame"><img src={ASSET+'Vision.png'} alt="Axonometric hand drawing of the Human Made communal building concept"/><small>HUMAN MADE / CONCEPT DRAWING</small></Reveal>
    </div></section>
    <section className="chapter foundation-chapter" id="foundations"><div className="chapter-inner">
      <Reveal className="chapter-heading"><span className="eyebrow">{t.foundEye}</span><h2>{t.foundTitle}</h2><p>{t.foundIntro}</p></Reveal>
      <div className="foundation-grid">{t.found.map(([title,body,image],i)=><Reveal key={image} className="foundation"><span className="foundation-number">0{i+1}</span><div className="foundation-art"><img src={ASSET+encodeURIComponent(image)} alt="" /></div><h3>{title}</h3><p>{body}</p></Reveal>)}</div>
    </div></section>
    <section className="chapter project-chapter" id="project"><div className="chapter-inner grid-pair reverse">
      <Reveal className="illustration-frame large-drawing"><img src={ASSET+'Vision.png'} alt="Architectural drawing of the proposed Indonesian cluster"/></Reveal>
      <Reveal className="copy"><span className="eyebrow">{t.projectEye}</span><h2>{t.projectTitle}</h2><p className="standfirst">{t.projectBody}</p><a className="text-link" href="#involved">{t.projectLink} ↗</a></Reveal>
    </div></section>
  </div>
}
function LaterChapters({t,lang}){
  const [selected,setSelected]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [draft,setDraft]=useState(null);
  const suggestions=()=>{
    const activities=selected.map(i=>t.ways[i][0]).join(', ');
    return lang==='de'?'Hallo Lea und Jessi,\\n\\nich interessiere mich für Human Made und möchte mich gerne in diesen Bereichen einbringen: '+activities+'.\\n\\nIch freue mich auf ein Gespräch.\\n\\nViele Grüße':'Hi Lea and Jessi,\\n\\nI am interested in Human Made and would love to contribute in these areas: '+activities+'.\\n\\nI would be happy to start a conversation.\\n\\nBest wishes';
  };
  const [name,setName]=useState(''),[email,setEmail]=useState('');
  const toggle=i=>{setSelected(a=>a.includes(i)?a.filter(n=>n!==i):[...a,i]);if(draft===null)setDraft(null)};
  const mail=ev=>{ev.preventDefault();const body=(draft??suggestions())+'\\n\\n'+name+'\\n'+email;location.href='mailto:info@studioless-arc.com?subject='+encodeURIComponent('Human Made — '+name)+'&body='+encodeURIComponent(body)};
  return <>
    <section className="later-section indonesia-section" id="indonesia"><div className="content-width split-editorial"><Reveal className="copy"><span className="eyebrow">{t.indoEye}</span><h2>{t.indoTitle}</h2><p className="standfirst">{t.indoBody}</p></Reveal><Reveal className="context-image"><img src={ASSET+'MAP%20Sumbawa.png'} alt="Hand-drawn map of the Indonesian islands"/></Reveal></div></section>
    <section className="later-section timeline-section" id="road"><div className="content-width"><Reveal><span className="eyebrow">{t.roadEye}</span><h2>{t.roadTitle}</h2></Reveal><div className="timeline">{t.road.map(([time,title,desc],i)=><Reveal className={'time-step '+(i===0?'current':'')} key={time}><span className="timeline-point"/><span className="time-label">{time}</span><h3>{title}</h3><p>{desc}</p>{i===0&&<span className="now-chip">{lang==='de'?'HIER STEHEN WIR':'WE ARE HERE'}</span>}</Reveal>)}</div></div></section>
    <section className="later-section get-involved" id="involved"><div className="content-width"><Reveal className="join-heading"><span className="eyebrow">{t.joinEye}</span><h2>{t.joinTitle}</h2><p>{t.joinIntro}</p></Reveal><div className="ways">{t.ways.map(([title,desc],i)=><button key={title} type="button" className={'way '+(selected.includes(i)?'selected':'')} aria-pressed={selected.includes(i)} onClick={()=>toggle(i)}><span className="way-icon" aria-hidden="true">{['⌁','✳','⌖','◌','▣'][i]}</span><b>{title}</b><span>{desc}</span><span className="check">{selected.includes(i)?'✓':'+'}</span></button>)}</div><div className="join-action"><span aria-live="polite">{selected.length} {t.chosen}</span><button className="btn solid" disabled={!selected.length} onClick={()=>setShowForm(true)}>{t.start} ↗</button></div>{showForm&&<form className="contact-form" onSubmit={mail}><div><h3>{t.start}</h3><p>{t.formIntro}</p></div><div className="fields"><label>{t.yourName}<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>{t.yourEmail}<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>{t.yourMessage}<textarea value={draft??suggestions()} onChange={e=>setDraft(e.target.value)} rows={6}/></label><button type="button" className="text-link reset" onClick={()=>setDraft(null)}>{t.reset}</button><button className="btn solid" type="submit">{t.send} ↗</button><small>{t.emailHint}</small></div></form>}</div></section>
    <section className="later-section people-section" id="people"><div className="content-width people-split"><Reveal><span className="eyebrow">{t.peopleEye}</span><h2>{t.peopleTitle}</h2><p className="standfirst">{t.peopleBody}</p><a className="text-link" href="mailto:info@studioless-arc.com">info@studioless-arc.com ↗</a></Reveal><Reveal className="people-illustration"><img src={ASSET+'Icon%20Mensch.png'} alt="Hand-drawn people, a Human Made motif"/></Reveal></div></section>
  </>
}
const MemoJourney=React.memo(Journey);
const MemoLaterChapters=React.memo(LaterChapters);
function NarrativeRoute({t,lang,routeRef}){
  return <div ref={routeRef} className="narrative-route">
    <div className="narrative-content">
      <MemoJourney t={t}/>
      <MemoLaterChapters t={t} lang={lang}/>
    </div>
  </div>;
}
export default function App(){
  const pageRef=useRef(null);
  const introRef=useRef(null);
  const routeRef=useRef(null);
  const [lang,setLang]=useState('en');
  const [headerVisible,setHeaderVisible]=useState(false);
  const reduced=useReducedMotion();const t=copy[lang];
  useEffect(()=>{
    const update=()=>setHeaderVisible(reduced||window.scrollY>window.innerHeight*.7);
    update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update)
  },[reduced]);
  useEffect(()=>{document.documentElement.lang=lang},[lang]);
  return <><a className="skip-link" href="#idea">Skip to content</a><Header t={t} lang={lang} setLang={setLang} visible={headerVisible}/><main ref={pageRef} className="living-page">
    <Intro t={t} reduced={reduced} lang={lang} stageRef={introRef}/>
    <NarrativeRoute t={t} lang={lang} routeRef={routeRef}/>
    <BotanicalThread pageRef={pageRef} introRef={introRef}
      routeRef={routeRef} reduced={reduced}/>
   </main><footer><div className="content-width"><b>HUMAN MADE</b><p>{t.footer}</p><a href="#home">↑</a></div></footer></>
}
