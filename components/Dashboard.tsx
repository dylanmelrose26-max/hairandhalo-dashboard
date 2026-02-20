// @ts-nocheck
"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ComposedChart } from "recharts";

/* ═══ PWA ICON GENERATOR — matches Hair & Halo branding ═══ */
function generateAppIcon(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  /* Background — warm off-white like the brand */
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, size, size);

  /* Subtle warm border inset */
  const inset = size * 0.06;
  ctx.strokeStyle = "#e8e4df";
  ctx.lineWidth = size * 0.005;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  /* "HAIR & HALO" — clean, spaced lettering in dark charcoal */
  const mainFontSize = size * 0.105;
  ctx.font = `300 ${mainFontSize}px 'DM Sans', 'Helvetica Neue', sans-serif`;
  ctx.fillStyle = "#2d2d2d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = `${size * 0.02}px`;

  /* Draw "HAIR &" on first line, "HALO" on second */
  const centerX = size / 2;
  const topLine = size * 0.38;
  const bottomLine = size * 0.52;

  ctx.fillText("HAIR &", centerX, topLine);
  ctx.fillText("HALO", centerX, bottomLine);

  /* "studio" in cursive script below */
  const scriptSize = size * 0.12;
  ctx.font = `400 ${scriptSize}px 'Dancing Script', 'Brush Script MT', cursive`;
  ctx.fillStyle = "#4a4a4a";
  ctx.fillText("studio", centerX, size * 0.67);

  /* Thin decorative line between main text and script */
  ctx.beginPath();
  ctx.strokeStyle = "#c8c0b8";
  ctx.lineWidth = size * 0.003;
  const lineW = size * 0.18;
  ctx.moveTo(centerX - lineW, size * 0.59);
  ctx.lineTo(centerX + lineW, size * 0.59);
  ctx.stroke();

  return canvas.toDataURL("image/png");
}

function setupPWA() {
  /* Wait for fonts to load for best rendering */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      const iconDataUrl = generateAppIcon(512);
      const iconSmall = generateAppIcon(192);
      const iconFav = generateAppIcon(64);

      /* Apple touch icon */
      let appleLink = document.querySelector('link[rel="apple-touch-icon"]');
      if (!appleLink) {
        appleLink = document.createElement("link");
        appleLink.setAttribute("rel", "apple-touch-icon");
        document.head.appendChild(appleLink);
      }
      appleLink.setAttribute("href", iconDataUrl);
      appleLink.setAttribute("sizes", "512x512");

      /* Favicon */
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.setAttribute("rel", "icon");
        favicon.setAttribute("type", "image/png");
        document.head.appendChild(favicon);
      }
      favicon.setAttribute("href", iconFav);

      /* Web App Manifest (dynamically generated) */
      const manifest = {
        name: "Hair & Halo Studio",
        short_name: "Hair & Halo",
        description: "Hair & Halo Studio Dashboard",
        start_url: "/",
        display: "standalone",
        background_color: "#faf8f5",
        theme_color: "#2d2d2d",
        icons: [
          { src: iconSmall, sizes: "192x192", type: "image/png" },
          { src: iconDataUrl, sizes: "512x512", type: "image/png" },
        ],
      };
      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      let manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        manifestLink = document.createElement("link");
        manifestLink.setAttribute("rel", "manifest");
        document.head.appendChild(manifestLink);
      }
      manifestLink.setAttribute("href", manifestUrl);

      /* iOS status bar styling */
      let metaStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!metaStatus) {
        metaStatus = document.createElement("meta");
        metaStatus.setAttribute("name", "apple-mobile-web-app-status-bar-style");
        document.head.appendChild(metaStatus);
      }
      metaStatus.setAttribute("content", "black-translucent");

      let metaCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (!metaCapable) {
        metaCapable = document.createElement("meta");
        metaCapable.setAttribute("name", "apple-mobile-web-app-capable");
        document.head.appendChild(metaCapable);
      }
      metaCapable.setAttribute("content", "yes");

      let metaTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (!metaTitle) {
        metaTitle = document.createElement("meta");
        metaTitle.setAttribute("name", "apple-mobile-web-app-title");
        document.head.appendChild(metaTitle);
      }
      metaTitle.setAttribute("content", "Hair & Halo");

      /* Theme color for browser chrome */
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement("meta");
        metaTheme.setAttribute("name", "theme-color");
        document.head.appendChild(metaTheme);
      }
      metaTheme.setAttribute("content", "#0c0f1a");
    });
  }
}

/* ═══ STAFF ═══ */
const STAFF = [
  { id:1, name:"Chelsea Knight", short:"Chelsea", role:"Senior Stylist", comm:"qualified", wNet:1055, color:"#6366f1" },
  { id:2, name:"Paris Melrose", short:"Paris", role:"Director", comm:"none", wNet:0, color:"#e8b4b8" },
  { id:3, name:"Teagan Hoskin", short:"Teagan", role:"Senior Stylist / Manager", comm:"manager", wNet:1015, color:"#ec4899" },
  { id:4, name:"Leila Hill", short:"Leila", role:"Qualified Stylist", comm:"qualified", wNet:903.56, color:"#10b981" },
  { id:5, name:"Lily Lamprell", short:"Lily", role:"Apprentice", comm:"apprentice", wNet:731.70, color:"#f59e0b" },
  { id:6, name:"Demi Skinner", short:"Demi", role:"Apprentice", comm:"apprentice", wNet:627.64, color:"#8b5cf6" },
];

/* ═══ TARGETS ═══ */
const TARGETS = {
  Q1:{sales:16500,retail:1250,treatments:18,avgSpend:210,retention:65,clients:72,newClients:20},
  Q2:{sales:16500,retail:1500,treatments:22,avgSpend:210,retention:65,clients:75,newClients:20},
  Q3:{sales:16500,retail:1500,treatments:22,avgSpend:210,retention:65,clients:75,newClients:20},
  Q4:{sales:16500,retail:1500,treatments:22,avgSpend:210,retention:65,clients:75,newClients:20},
};
const getQ=m=>{const mo=parseInt(m.split("-")[1]);return mo<=3?"Q1":mo<=6?"Q2":mo<=9?"Q3":"Q4"};
const ANNUAL_TARGET=850000;

/* Manager KPI tiers */
const MGR_TREAT_TIERS=[{min:110,bonus:300},{min:90,bonus:200},{min:70,bonus:100}];
const MGR_RETAIL_TIERS=[{min:5500,bonus:400},{min:4500,bonus:200},{min:3250,bonus:100}];
function calcMgrBonus(storeTreats,storeRetail){
  let tb=0;for(const t of MGR_TREAT_TIERS){if(storeTreats>=t.min){tb=t.bonus;break;}}
  let rb=0;for(const t of MGR_RETAIL_TIERS){if(storeRetail>=t.min){rb=t.bonus;break;}}
  return{treatBonus:tb,retailBonus:rb,total:tb+rb,storeTreats,storeRetail};
}

/* Retail bonus tiers */
const RETAIL_TIERS_QUALIFIED=[{min:1000,pct:15,label:"Tier 3"},{min:750,pct:10,label:"Tier 2"},{min:600,pct:5,label:"Tier 1"}];
const RETAIL_TIERS_APPRENTICE=[{min:900,pct:15,label:"Tier 3"},{min:650,pct:10,label:"Tier 2"},{min:500,pct:5,label:"Tier 1"}];

function calcRetailBonus(total,type){
  if(type==="none")return{tier:"-",pct:0,bonus:0,tiers:[]};
  const tiers=type==="apprentice"?RETAIL_TIERS_APPRENTICE:RETAIL_TIERS_QUALIFIED;
  for(const t of tiers){if(total>=t.min)return{tier:t.label,pct:t.pct,bonus:total*t.pct/100,range:"$"+t.min+"+",tiers};}
  return{tier:"Below",pct:0,bonus:0,range:"< $"+tiers[tiers.length-1].min,tiers};
}

function calcTreatBonus(count,treatRev,type){
  if(type==="none")return{tgt:0,hit:false,bonus:0,rev:0};
  const tgt=type==="apprentice"?12:14;
  const hit=count>=tgt;
  return{tgt,hit,bonus:hit?treatRev*0.10:0,rev:treatRev};
}

/* Wage tier thresholds */
const WAGE_TIERS=[{mult:4.0,pct:25,label:"4\u00d7+"},{mult:3.5,pct:20,label:"3.5\u20134\u00d7"},{mult:3.2,pct:10,label:"3.2\u20133.5\u00d7"}];

function getTierInfo(mult){
  if(mult>=4)return{label:"4\u00d7+",pct:25,color:"#f59e0b",bg:"rgba(245,158,11,0.15)"};
  if(mult>=3.5)return{label:"3.5\u20134\u00d7",pct:20,color:"#10b981",bg:"rgba(16,185,129,0.12)"};
  if(mult>=3.2)return{label:"3.2\u20133.5\u00d7",pct:10,color:"#6366f1",bg:"rgba(99,102,241,0.12)"};
  return{label:"Below 3.2\u00d7",pct:0,color:"#475569",bg:"rgba(255,255,255,0.04)"};
}

/* ═══ MONTH DATA ═══ */
const MD = {
  "2026-01": {
    totalRevenue:68543, grossProfit:52000, netProfit:11667, parisDrawings:6750,
    serviceRevenue:47171, retailRevenue:4092, extensionRevenue:10458, treatmentRevenue:2610,
    weeksInMonth:4,
    weeklyScorecard:[
      {wk:"05 Jan",sales:12375,retail:1021,treatments:14,clients:75,newClients:14,retention:47.8,avgSpend:161.79},
      {wk:"12 Jan",sales:15053,retail:1138,treatments:12,clients:83,newClients:20,retention:47.5,avgSpend:160.65},
      {wk:"19 Jan",sales:17744,retail:1085,treatments:17,clients:100,newClients:28,retention:59,avgSpend:162.87},
      {wk:"26 Jan",sales:18408,retail:566,treatments:23,clients:87,newClients:16,retention:56.9,avgSpend:213.38},
    ],
    staff:[
      {sid:1,sales:15159,retail:693,treats:19,treatRev:741,clients:76,newC:5,retC:71},
      {sid:2,sales:14889,retail:924,treats:12,treatRev:468,clients:58,newC:4,retC:54},
      {sid:3,sales:7896,retail:252,treats:6,treatRev:234,clients:43,newC:10,retC:33,note:"Partial month \u2013 on leave"},
      {sid:4,sales:10512,retail:670,treats:5,treatRev:195,clients:67,newC:21,retC:46},
      {sid:5,sales:8067,retail:766,treats:12,treatRev:468,clients:54,newC:22,retC:32},
      {sid:6,sales:7036,retail:502,treats:13,treatRev:507,clients:40,newC:18,retC:22},
    ],
    notes:"Teagan on leave for part of January. First month of new tracking.",
  }
};

const fmt=v=>"$"+Math.round(v).toLocaleString("en-AU");
const fmtPct=v=>v.toFixed(1)+"%";
const fmtMth=m=>{const[y,mo]=m.split("-");return new Date(+y,+mo-1).toLocaleDateString("en-AU",{month:"short",year:"numeric"})};
const ROSE="#e8b4b8";
const CATS=[{key:"serviceRevenue",label:"Services",color:"#6366f1"},{key:"retailRevenue",label:"Retail",color:"#10b981"},{key:"extensionRevenue",label:"Extensions",color:"#f59e0b"},{key:"treatmentRevenue",label:"Treatments",color:"#ec4899"}];
const MONTH_OPTIONS=[];
for(let y=2026;y<=2027;y++){for(let m=1;m<=12;m++){MONTH_OPTIONS.push(y+"-"+String(m).padStart(2,"0"))}}

/* ═══ APP ═══ */
export default function App(){
  /* Setup PWA icon on mount */
  useEffect(()=>{setupPWA()},[]);

  const[tab,setTab]=useState("financial");
  const[selMonth,setSelMonth]=useState("2026-01");
  const months=Object.keys(MD);
  const data=MD[selMonth];
  const q=getQ(selMonth);
  const tgt=TARGETS[q];
  const wks=data?.weeklyScorecard||[];
  const nW=wks.length;
  const weeksInMonth=data?.weeksInMonth||nW;

  /* True net profit = Xero net - Paris wage */
  const trueNet=data?(data.netProfit-data.parisDrawings):0;

  const store=useMemo(()=>{
    if(!data?.staff)return null;
    const s=data.staff.reduce((a,p)=>({sales:a.sales+p.sales,retail:a.retail+p.retail,treats:a.treats+p.treats,clients:a.clients+p.clients,newC:a.newC+p.newC,retC:a.retC+p.retC}),{sales:0,retail:0,treats:0,clients:0,newC:0,retC:0});
    s.retention=s.clients>0?s.retC/s.clients*100:0;
    s.avgSpend=s.clients>0?s.sales/s.clients:0;
    const estBuyers=Math.min(s.clients,Math.round(s.retail/35));
    s.retailAttach=s.clients>0?(estBuyers/s.clients)*100:0;
    return s;
  },[data]);

  const prevMonth=useMemo(()=>{const idx=months.indexOf(selMonth);return idx>0?MD[months[idx-1]]:null},[selMonth,months]);
  const prevTrueNet=prevMonth?(prevMonth.netProfit-prevMonth.parisDrawings):null;
  const ytd=useMemo(()=>{
    const yr=selMonth.split("-")[0];
    const yrMonths=months.filter(m=>m.startsWith(yr));
    const total=yrMonths.reduce((s,m)=>s+MD[m].totalRevenue,0);
    const count=yrMonths.length;
    return{total,projected:count>0?(total/count)*12:0};
  },[selMonth,months]);

  const[weekData,setWeekData]=useState(()=>{const d={};STAFF.forEach(s=>{d[s.id]=[0,0,0,0,0]});return d});

  const commResults=useMemo(()=>{
    return STAFF.filter(s=>s.comm!=="none").map(s=>{
      const weeks=weekData[s.id]||[0,0,0,0,0];
      const wCalc=weeks.map((sales,i)=>{
        if(sales<=0) return null;
        const mult=s.wNet>0?sales/s.wNet:0;
        const tier=getTierInfo(mult);
        const over=sales>s.wNet*3.2?sales-s.wNet*3.2:0;
        return{wk:i+1,sales,mult,...tier,over,bonus:over*(tier.pct/100)};
      }).filter(Boolean);
      const wBonus=wCalc.reduce((s,w)=>s+w.bonus,0);
      const perf=data?.staff?.find(p=>p.sid===s.id);
      const commType=s.comm==="manager"?"qualified":s.comm;
      const rb=calcRetailBonus(perf?.retail||0,commType);
      const tb=calcTreatBonus(perf?.treats||0,perf?.treatRev||0,commType);
      const chartData=weeks.map((sales,i)=>({wk:"Wk"+(i+1),sales:sales||0})).filter((_,i)=>weeks[i]>0||i<weeksInMonth);
      const mgr=s.comm==="manager"&&store?calcMgrBonus(store.treats,store.retail):null;
      const monthlyTarget=s.wNet*3.2*weeksInMonth;
      const totalSales=perf?.sales||0;
      return{staff:s,wCalc,wBonus,rb,tb,mgr,total:wBonus+rb.bonus+tb.bonus+(mgr?mgr.total:0),chartData,monthlyTarget,totalSales};
    });
  },[weekData,data,weeksInMonth,store]);

  const commNonMgr=commResults.filter(cr=>cr.staff.comm!=="manager");
  const commMgr=commResults.filter(cr=>cr.staff.comm==="manager");

  /* ═══ ENTRY STATE ═══ */
  const[entryMonth,setEntryMonth]=useState(()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")});
  const[entryData,setEntryData]=useState({
    totalRevenue:"",grossProfit:"",netProfit:"",parisDrawings:"",
    serviceRevenue:"",retailRevenue:"",extensionRevenue:"",treatmentRevenue:"",
    weeksInMonth:"4",notes:"",
    staff:STAFF.map(s=>({sid:s.id,name:s.short,sales:"",retail:"",treats:"",treatRev:"",clients:"",newC:"",retC:""})),
    weeklySales:STAFF.filter(s=>s.comm!=="none").map(s=>({sid:s.id,name:s.short,wk1:"",wk2:"",wk3:"",wk4:"",wk5:""})),
    weeklyScorecard:Array.from({length:5},()=>({wk:"",sales:"",retail:"",treatments:"",clients:"",newClients:"",retention:"",avgSpend:""})),
  });
  const[saveStatus,setSaveStatus]=useState(null);
  const[collapsed,setCollapsed]=useState({financials:true,staffPerf:true,weeklyData:true});
  const[commWeekOpen,setCommWeekOpen]=useState(false);
  const toggleSection=key=>setCollapsed(p=>({...p,[key]:!p[key]}));
  const updateEntry=(field,val)=>setEntryData(p=>({...p,[field]:val}));
  const updateStaffEntry=(idx,field,val)=>setEntryData(p=>({...p,staff:p.staff.map((s,i)=>i===idx?{...s,[field]:val}:s)}));
  const updateWeeklySales=(idx,field,val)=>setEntryData(p=>({...p,weeklySales:p.weeklySales.map((s,i)=>i===idx?{...s,[field]:val}:s)}));
  const updateScorecard=(idx,field,val)=>setEntryData(p=>({...p,weeklyScorecard:p.weeklyScorecard.map((s,i)=>i===idx?{...s,[field]:val}:s)}));

  const handleSave=useCallback(async()=>{
    setSaveStatus("saving");
    try{
      const e=entryData;
      const monthData={month:entryMonth,totalRevenue:parseFloat(e.totalRevenue)||0,grossProfit:parseFloat(e.grossProfit)||0,netProfit:parseFloat(e.netProfit)||0,parisDrawings:parseFloat(e.parisDrawings)||0,serviceRevenue:parseFloat(e.serviceRevenue)||0,retailRevenue:parseFloat(e.retailRevenue)||0,extensionRevenue:parseFloat(e.extensionRevenue)||0,treatmentRevenue:parseFloat(e.treatmentRevenue)||0,weeksInMonth:parseInt(e.weeksInMonth)||4,notes:e.notes};
      const staffData=e.staff.map(s=>({month:entryMonth,sid:s.sid,sales:parseFloat(s.sales)||0,retail:parseFloat(s.retail)||0,treats:parseInt(s.treats)||0,treatRev:parseFloat(s.treatRev)||0,clients:parseInt(s.clients)||0,newC:parseInt(s.newC)||0,retC:parseInt(s.retC)||0}));
      const weeklyData=e.weeklySales.map(s=>({month:entryMonth,sid:s.sid,weeks:[s.wk1,s.wk2,s.wk3,s.wk4,s.wk5].map(v=>parseFloat(v)||0)}));
      const scorecardData=e.weeklyScorecard.filter(w=>w.wk).map(w=>({month:entryMonth,wk:w.wk,sales:parseFloat(w.sales)||0,retail:parseFloat(w.retail)||0,treatments:parseInt(w.treatments)||0,clients:parseInt(w.clients)||0,newClients:parseInt(w.newClients)||0,retention:parseFloat(w.retention)||0,avgSpend:parseFloat(w.avgSpend)||0}));
      if(typeof window!=="undefined"&&window.__supabase){
        const sb=window.__supabase;
        await sb.from("monthly_financials").upsert({month:monthData.month,total_revenue:monthData.totalRevenue,gross_profit:monthData.grossProfit,net_profit:monthData.netProfit,paris_drawings:monthData.parisDrawings,service_revenue:monthData.serviceRevenue,retail_revenue:monthData.retailRevenue,extension_revenue:monthData.extensionRevenue,treatment_revenue:monthData.treatmentRevenue,weeks_in_month:monthData.weeksInMonth,notes:monthData.notes},{onConflict:"month"});
        for(const s of staffData){await sb.from("staff_performance").upsert({month:s.month,staff_id:s.sid,total_sales:s.sales,retail_sales:s.retail,treatments:s.treats,treatment_revenue:s.treatRev,total_clients:s.clients,new_clients:s.newC,returning_clients:s.retC},{onConflict:"month,staff_id"});}
        for(const w of weeklyData){await sb.from("weekly_sales").upsert({month:w.month,staff_id:w.sid,week1:w.weeks[0],week2:w.weeks[1],week3:w.weeks[2],week4:w.weeks[3],week5:w.weeks[4]},{onConflict:"month,staff_id"});}
        for(const sc of scorecardData){await sb.from("weekly_scorecard").upsert({month:sc.month,week_label:sc.wk,total_sales:sc.sales,retail_sales:sc.retail,treatments:sc.treatments,total_clients:sc.clients,new_clients:sc.newClients,retention_rate:sc.retention,avg_spend:sc.avgSpend},{onConflict:"month,week_label"});}
        setSaveStatus("saved");
      } else {
        const staffForMD=staffData.map(s=>({sid:s.sid,sales:s.sales,retail:s.retail,treats:s.treats,treatRev:s.treatRev,clients:s.clients,newC:s.newC,retC:s.retC,note:""}));
        MD[entryMonth]={totalRevenue:monthData.totalRevenue,grossProfit:monthData.grossProfit,netProfit:monthData.netProfit,parisDrawings:monthData.parisDrawings,serviceRevenue:monthData.serviceRevenue,retailRevenue:monthData.retailRevenue,extensionRevenue:monthData.extensionRevenue,treatmentRevenue:monthData.treatmentRevenue,weeksInMonth:monthData.weeksInMonth,weeklyScorecard:scorecardData.map(sc=>({wk:sc.wk,sales:sc.sales,retail:sc.retail,treatments:sc.treatments,clients:sc.clients,newClients:sc.newClients,retention:sc.retention,avgSpend:sc.avgSpend})),staff:staffForMD,notes:monthData.notes};
        weeklyData.forEach(w=>{setWeekData(p=>({...p,[w.sid]:w.weeks}))});
        setSaveStatus("saved");
      }
      setTimeout(()=>setSaveStatus(null),3000);
    }catch(err){console.error("Save error:",err);setSaveStatus("error");setTimeout(()=>setSaveStatus(null),4000);}
  },[entryData,entryMonth]);

  const cd={borderRadius:13,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"};
  const cdP={...cd,padding:"16px 14px"};
  const lb={fontSize:9,color:"#64748b",textTransform:"uppercase",letterSpacing:1};
  const bn={fontSize:22,fontWeight:700,fontFamily:"'DM Sans'"};

  const TierBadge=({label,pct,color,bg})=>(<span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:4,background:bg,color,letterSpacing:0.3}}>{pct>0?label+" \u00b7 "+pct+"%":"No bonus"}</span>);

  const KPI=({l,actual,target,unit,icon,sub})=>{const mTarget=target*nW;const good=actual>=mTarget;const vari=actual-mTarget;return(<div style={{...cdP,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:good?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f87171)"}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}><div style={lb}>{icon} {l}</div><span style={{fontSize:8,color:"#475569",background:"rgba(255,255,255,0.04)",padding:"2px 6px",borderRadius:4}}>{nW}wk</span></div><div style={{...bn,color:"#f1f5f9",marginTop:6}}>{unit==="$"?fmt(actual):actual}</div>{sub&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{sub}</div>}<div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}><span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:good?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",color:good?"#34d399":"#f87171"}}>{vari>=0?"\u25b2":"\u25bc"} {unit==="$"?fmt(Math.abs(vari)):Math.abs(Math.round(vari))}</span><span style={{fontSize:9,color:"#64748b"}}>vs {unit==="$"?fmt(mTarget):mTarget} target</span></div></div>)};

  const GrowthCard=({l,actual,target,icon,prevActual})=>{const mTarget=target*nW;const good=actual>=mTarget;const vari=actual-mTarget;const hasPrev=typeof prevActual==="number"&&prevActual>0;const momPct=hasPrev?((actual-prevActual)/prevActual)*100:null;return(<div style={{...cdP,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:good?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f87171)"}}/><div style={lb}>{icon} {l}</div><div style={{...bn,color:"#f1f5f9",marginTop:6}}>{actual}</div><div style={{display:"flex",alignItems:"center",gap:5,marginTop:4,flexWrap:"wrap"}}><span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:good?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",color:good?"#34d399":"#f87171"}}>{vari>=0?"\u25b2":"\u25bc"} {Math.abs(Math.round(vari))} vs target</span>{momPct!==null&&(<span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:momPct>=0?"rgba(99,102,241,0.12)":"rgba(245,158,11,0.12)",color:momPct>=0?"#a5b4fc":"#fbbf24"}}>{momPct>=0?"\u25b2":"\u25bc"} {fmtPct(Math.abs(momPct))} vs last month</span>)}</div></div>)};

  const EInput=({label,value,onChange,prefix,placeholder})=>(<div style={{flex:1,minWidth:80}}>{label&&<div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6,marginBottom:3}}>{label}</div>}<div style={{position:"relative"}}>{prefix&&<span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#64748b",pointerEvents:"none"}}>{prefix}</span>}<input type="number" value={value} placeholder={placeholder||"0"} onChange={e=>onChange(e.target.value)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#f1f5f9",fontSize:11,padding:prefix?"7px 8px 7px 18px":"7px 8px",width:"100%",outline:"none",fontFamily:"inherit"}}/></div></div>);

  const EntrySection=({id,title,color,children})=>(<div style={{...cd,marginBottom:12,overflow:"hidden"}}><button onClick={()=>toggleSection(id)} style={{width:"100%",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",borderBottom:collapsed[id]?"none":"1px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:12,fontWeight:600,color:color||"#94a3b8"}}>{title}</span><span style={{fontSize:10,color:"#64748b",transition:"transform 0.2s",transform:collapsed[id]?"rotate(0deg)":"rotate(180deg)"}}>{"\u25bc"}</span></button>{!collapsed[id]&&<div style={{padding:16}}>{children}</div>}</div>);

  /* ═══ COMMISSION CARD ═══ */
  const CommCard=({cr,style:xs})=>{
    const perf=data?.staff?.find(p=>p.sid===cr.staff.id);
    const t32=cr.staff.wNet*3.2;
    const hasData=cr.wCalc.length>0;
    const maxSales=Math.max(t32*1.3,...cr.chartData.map(d=>d.sales));
    const isMgr=cr.staff.comm==="manager";
    const hitTarget=cr.totalSales>=cr.monthlyTarget;
    const variance=cr.totalSales-cr.monthlyTarget;
    return(
    <div style={{...cdP,position:"relative",overflow:"hidden",...xs}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:cr.staff.color}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <div><div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{cr.staff.name}</div><div style={{fontSize:8,color:cr.staff.color}}>{cr.staff.role}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:17,fontWeight:700,color:"#10b981"}}>{fmt(cr.total)}</div><div style={{fontSize:8,color:"#64748b"}}>Total Commission</div></div>
      </div>

      {/* Monthly revenue target */}
      <div style={{padding:"5px 8px",borderRadius:6,background:hitTarget?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.06)",border:"1px solid "+(hitTarget?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.15)"),marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,color:hitTarget?"#34d399":"#f87171"}}>{hitTarget?"Monthly target hit":"Below monthly target"} {"\u00b7"} {fmt(cr.totalSales)} / {fmt(cr.monthlyTarget)}</span>
        <span style={{fontSize:9,fontWeight:600,color:hitTarget?"#34d399":"#f87171"}}>{variance>=0?"+":""}{fmt(variance)}</span>
      </div>

      {/* Sparkline chart */}
      <div style={{marginBottom:10}}>
        {hasData?(<ResponsiveContainer width="100%" height={90}><ComposedChart data={cr.chartData} margin={{top:5,right:5,bottom:0,left:5}}><XAxis dataKey="wk" tick={{fill:"#64748b",fontSize:8}} axisLine={false} tickLine={false}/><YAxis hide domain={[0,maxSales]}/><Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8"}} formatter={(v)=>[fmt(v),"Sales"]}/><ReferenceLine y={t32} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}/><Bar dataKey="sales" radius={[4,4,0,0]} barSize={28}>{cr.chartData.map((d,j)=>(<Cell key={j} fill={d.sales>=t32?cr.staff.color:cr.staff.color+"55"}/>))}</Bar></ComposedChart></ResponsiveContainer>):(<div style={{height:90,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.02)",borderRadius:8}}><span style={{fontSize:10,color:"#475569"}}>Enter weekly sales above to see chart</span></div>)}
        {hasData&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}><div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:12,height:2,background:"#f59e0b",borderRadius:1}}/><span style={{fontSize:8,color:"#64748b"}}>3.2{"\u00d7"} target ({fmt(t32)})</span></div><div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:8,height:8,borderRadius:2,background:cr.staff.color}}/><span style={{fontSize:8,color:"#64748b"}}>Above</span></div><div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:8,height:8,borderRadius:2,background:cr.staff.color+"55"}}/><span style={{fontSize:8,color:"#64748b"}}>Below</span></div></div>}
      </div>

      {/* Wage Bonus — Tier Ladder + Weekly Detail */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"8px 10px",marginBottom:7}}>
        <div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.7,marginBottom:5}}>Wage Bonus {"\u2013"} {fmt(cr.wBonus)}</div>
        {/* Tier thresholds */}
        <div style={{marginBottom:6,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
          {WAGE_TIERS.map(wt=>{const threshold=cr.staff.wNet*wt.mult;return(<div key={wt.mult} style={{display:"flex",justifyContent:"space-between",padding:"1px 0",fontSize:9,color:"#64748b"}}><span>{wt.label} = {fmt(threshold)}/wk</span><span>{wt.pct}% of overage</span></div>)})}
        </div>
        {/* Weekly breakdown */}
        {cr.wCalc.length>0?cr.wCalc.map(w=>(<div key={w.wk} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",fontSize:9}}><span style={{color:"#94a3b8"}}>Wk{w.wk}: {fmt(w.sales)} <span style={{color:"#64748b"}}>({w.mult.toFixed(2)}{"\u00d7"})</span></span><div style={{display:"flex",alignItems:"center",gap:5}}><TierBadge label={w.label} pct={w.pct} color={w.color} bg={w.bg}/>{w.pct>0&&<span style={{color:"#34d399",fontWeight:600,fontSize:9}}>{fmt(w.bonus)}</span>}</div></div>)):<div style={{fontSize:9,color:"#f59e0b"}}>{"\u26a0\ufe0f"} Enter weekly sales above to calculate wage bonus</div>}
      </div>

      {/* Retail Bonus — Tier Ladder */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"8px 10px",marginBottom:7}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.7}}>Retail Bonus</div>
          <div style={{fontSize:10,fontWeight:600,color:"#f1f5f9",padding:"2px 8px",borderRadius:4,background:"rgba(255,255,255,0.06)"}}>{fmt(perf?.retail||0)} sold</div>
        </div>
        {cr.rb.tiers&&cr.rb.tiers.length>0&&cr.rb.tiers.map(t=>{
          const hit=(perf?.retail||0)>=t.min;
          const isActive=cr.rb.pct===t.pct&&hit;
          return(<div key={t.min} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:9,color:isActive?"#34d399":"#64748b",fontWeight:isActive?700:400}}><span>${t.min}+ {"\u2192"} {t.pct}%</span><span>{isActive?fmt((perf?.retail||0)*t.pct/100):""}</span></div>);
        })}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,paddingTop:4,borderTop:"1px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:9,fontWeight:600,color:cr.rb.pct>0?"#34d399":"#475569"}}>{cr.rb.pct>0?cr.rb.tier:"Below threshold"}</span><span style={{fontSize:12,fontWeight:700,color:cr.rb.pct>0?"#10b981":"#475569"}}>{fmt(cr.rb.bonus)}</span></div>
      </div>

      {/* Treatment Bonus */}
      <div style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"8px 10px",marginBottom:isMgr?7:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.7}}>Treatment Bonus</div>
          <div style={{fontSize:10,fontWeight:600,color:"#f1f5f9",padding:"2px 8px",borderRadius:4,background:"rgba(255,255,255,0.06)"}}>{perf?.treats||0} treatments</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:9,color:cr.tb.hit?"#34d399":"#64748b",fontWeight:cr.tb.hit?700:400}}><span>{cr.tb.tgt}+ treatments {"\u2192"} 10% of revenue</span><span>{cr.tb.hit?fmt(cr.tb.bonus):""}</span></div>
        <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>{perf?.treats||0}/{cr.tb.tgt} treatments{cr.tb.hit?" \u00b7 "+fmt(cr.tb.rev)+" rev":""}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,paddingTop:4,borderTop:"1px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:9,fontWeight:600,color:cr.tb.hit?"#34d399":"#475569"}}>{cr.tb.hit?"Threshold met":"Below threshold"}</span><span style={{fontSize:12,fontWeight:700,color:cr.tb.hit?"#10b981":"#475569"}}>{fmt(cr.tb.bonus)}</span></div>
      </div>

      {/* Manager KPIs — Teagan only */}
      {isMgr&&cr.mgr&&(<div style={{marginTop:7,padding:"10px 10px",borderRadius:8,background:"rgba(236,72,153,0.06)",border:"1px solid rgba(236,72,153,0.15)"}}>
        <div style={{fontSize:8,color:"#ec4899",textTransform:"uppercase",letterSpacing:0.7,fontWeight:700,marginBottom:8}}>{"\ud83d\udc51"} Manager KPIs {"\u2013"} Store Totals</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontSize:7,color:"#64748b",textTransform:"uppercase"}}>Store Treatments</div><div style={{fontSize:9,fontWeight:600,color:"#f1f5f9",padding:"1px 6px",borderRadius:4,background:"rgba(255,255,255,0.06)"}}>{cr.mgr.storeTreats}</div></div>{MGR_TREAT_TIERS.map(t=>{const hit=cr.mgr.storeTreats>=t.min;const isA=cr.mgr.treatBonus===t.bonus&&hit;return(<div key={t.min} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:9,color:isA?"#34d399":"#64748b",fontWeight:isA?700:400}}><span>{t.min}+</span><span>{fmt(t.bonus)}</span></div>)})}<div style={{fontSize:11,fontWeight:700,color:cr.mgr.treatBonus>0?"#10b981":"#475569",marginTop:4}}>{fmt(cr.mgr.treatBonus)}</div></div>
          <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontSize:7,color:"#64748b",textTransform:"uppercase"}}>Store Retail</div><div style={{fontSize:9,fontWeight:600,color:"#f1f5f9",padding:"1px 6px",borderRadius:4,background:"rgba(255,255,255,0.06)"}}>{fmt(cr.mgr.storeRetail)}</div></div>{MGR_RETAIL_TIERS.map(t=>{const hit=cr.mgr.storeRetail>=t.min;const isA=cr.mgr.retailBonus===t.bonus&&hit;return(<div key={t.min} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:9,color:isA?"#34d399":"#64748b",fontWeight:isA?700:400}}><span>{fmt(t.min)}+</span><span>{fmt(t.bonus)}</span></div>)})}<div style={{fontSize:11,fontWeight:700,color:cr.mgr.retailBonus>0?"#10b981":"#475569",marginTop:4}}>{fmt(cr.mgr.retailBonus)}</div></div>
        </div>
        <div style={{borderTop:"1px solid rgba(236,72,153,0.15)",marginTop:8,paddingTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,color:"#ec4899",fontWeight:600}}>Manager Bonus Total</span><span style={{fontSize:14,fontWeight:700,color:"#10b981"}}>{fmt(cr.mgr.total)}</span></div>
      </div>)}
    </div>
  )};

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#0c0f1a 0%,#111827 40%,#0f172a 100%)",color:"#e2e8f0",fontFamily:"'DM Sans',-apple-system,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&family=Dancing+Script:wght@400;500&display=swap');@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes fi{from{opacity:0}to{opacity:1}}*{box-sizing:border-box;margin:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}input[type=number]{-moz-appearance:textfield}input[type=number]:focus{border-color:rgba(232,180,184,0.4)!important}input::-webkit-inner-spin-button,input::-webkit-outer-spin-button{-webkit-appearance:none}select{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#f1f5f9;font-size:11px;padding:7px 8px;outline:none;font-family:inherit}select:focus{border-color:rgba(232,180,184,0.4)}select option{background:#1e293b;color:#f1f5f9}textarea{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#f1f5f9;font-size:11px;padding:7px 8px;outline:none;font-family:inherit;resize:vertical;width:100%}textarea:focus{border-color:rgba(232,180,184,0.4)}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g2c{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.hdr-nav{display:flex;gap:2px;background:rgba(255,255,255,0.04);border-radius:8px;padding:2px}
.hdr-wrap{display:flex;justify-content:space-between;align-items:center}
.cat-row{display:flex;align-items:center;gap:14px}
.scroll-x{overflow-x:visible}
.content-area{padding:18px 22px}
.entry-grid8{display:grid;grid-template-columns:90px repeat(7,1fr);gap:6px;align-items:center}
.entry-grid6{display:grid;grid-template-columns:90px repeat(5,1fr);gap:6px;align-items:center}
.entry-grid-sc{display:grid;grid-template-columns:80px repeat(7,1fr);gap:5px;align-items:center}
.comm-grid{display:grid;grid-template-columns:130px repeat(5,1fr);gap:7px;align-items:center}
.lb-row{display:flex;align-items:center;gap:10px}
@media(max-width:768px){
.g4{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
.g3{grid-template-columns:1fr!important;gap:8px!important}
.g2{grid-template-columns:1fr!important;gap:10px!important}
.g2c{grid-template-columns:1fr!important;gap:10px!important}
.hdr-wrap{flex-direction:column;gap:10px;align-items:stretch}
.hdr-nav{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-shrink:0}
.hdr-nav button{white-space:nowrap;flex-shrink:0}
.cat-row{flex-direction:column}
.scroll-x{overflow-x:auto;-webkit-overflow-scrolling:touch}
.scroll-x>div{min-width:600px}
.content-area{padding:14px 12px!important}
.entry-grid8,.entry-grid6,.entry-grid-sc,.comm-grid{min-width:600px}
.lb-row{gap:6px}
.lb-row>div:nth-child(2){flex:0 0 80px!important}
}`}</style>

      <header style={{padding:"13px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:10,background:"rgba(12,15,26,0.95)",backdropFilter:"blur(12px)"}}><div className="hdr-wrap">
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1}}><span style={{fontSize:14,fontWeight:300,letterSpacing:4,color:"#f1f5f9",fontFamily:"'DM Sans'"}}>HAIR & HALO</span><span style={{fontSize:13,fontFamily:"'Dancing Script',cursive",color:"#f1f5f9",marginTop:-1,letterSpacing:1}}>studio</span></div>
          <div style={{width:1,height:28,background:"rgba(255,255,255,0.08)",marginLeft:4}}/>
          <span style={{fontSize:8,color:"#64748b",letterSpacing:1.5,textTransform:"uppercase"}}>{fmtMth(selMonth)}</span>
        </div>
        <nav className="hdr-nav">
          {[{id:"financial",l:"\ud83d\udcca Financials"},{id:"team",l:"\ud83d\udc65 Team"},{id:"commission",l:"\ud83d\udcb0 Commission"},{id:"entry",l:"\u270f\ufe0f Entry"}].map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 13px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:tab===t.id?600:500,background:tab===t.id?ROSE+"22":"transparent",color:tab===t.id?ROSE:"#94a3b8",transition:"all 0.2s"}}>{t.l}</button>))}
        </nav>
      </div></header>

      {/* ═══ FINANCIALS ═══ */}
      {tab==="financial"&&data&&store&&(<div className="content-area" style={{padding:"18px 22px",maxWidth:1180,margin:"0 auto",animation:"fi 0.3s ease"}}>
        <div style={{display:"flex",gap:4,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><span style={{...lb,marginRight:4}}>MONTH:</span>{months.map(m=>(<button key={m} onClick={()=>setSelMonth(m)} style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:500,border:"1px solid",cursor:"pointer",borderColor:selMonth===m?ROSE+"66":"rgba(255,255,255,0.08)",background:selMonth===m?ROSE+"18":"transparent",color:selMonth===m?ROSE:"#64748b"}}>{fmtMth(m)}</button>))}</div>

        {/* Row 1: Revenue, Gross Profit, Net Profit (after Paris wage), Annual Projection */}
        <div className="g4" style={{marginBottom:18}}>
          <div style={{...cdP,animation:"fu 0.3s ease 0s both"}}><div style={lb}>Total Revenue</div><div style={{...bn,color:"#10b981",marginTop:5}}>{fmt(data.totalRevenue)}</div>{prevMonth&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{(()=>{const pct=((data.totalRevenue-prevMonth.totalRevenue)/prevMonth.totalRevenue)*100;return<span style={{color:pct>=0?"#34d399":"#f87171"}}>{pct>=0?"\u25b2":"\u25bc"} {fmtPct(Math.abs(pct))} vs last month</span>})()}</div>}</div>
          <div style={{...cdP,animation:"fu 0.3s ease 0.04s both"}}><div style={lb}>Gross Profit</div><div style={{...bn,color:"#6366f1",marginTop:5}}>{fmt(data.grossProfit)}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{fmtPct(data.grossProfit/data.totalRevenue*100)} margin</div><div style={{fontSize:8,color:"#64748b",marginTop:1}}>Excl. commissions paid</div></div>
          <div style={{...cdP,animation:"fu 0.3s ease 0.08s both"}}><div style={lb}>Net Profit</div><div style={{...bn,color:trueNet>=0?"#10b981":"#ef4444",marginTop:5}}>{fmt(trueNet)}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{fmtPct(trueNet/data.totalRevenue*100)}</div></div>
          <div style={{...cdP,animation:"fu 0.3s ease 0.12s both"}}><div style={lb}>Annual Projection</div><div style={{fontSize:11,color:"#f1f5f9",fontWeight:600,marginTop:5}}>YTD: {fmt(ytd.total)}</div><div style={{...bn,color:ytd.projected>=ANNUAL_TARGET?"#10b981":"#f59e0b",marginTop:2,fontSize:18}}>{fmt(ytd.projected)}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>vs {fmt(ANNUAL_TARGET)} target</div><div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,(ytd.total/ANNUAL_TARGET)*100)+"%",background:ytd.projected>=ANNUAL_TARGET?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#f59e0b,#fbbf24)",borderRadius:3,transition:"width 0.5s ease"}}/></div><div style={{fontSize:8,color:"#64748b",marginTop:3,textAlign:"right"}}>{fmtPct(ytd.total/ANNUAL_TARGET*100)} of annual</div></div>
        </div>

        <h2 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>{"\ud83c\udfaf"} KPIs vs {q} Targets</h2>
        <div className="g3" style={{marginBottom:18}}>
          <KPI l="Total Sales" actual={store.sales} target={tgt.sales} unit="$" icon={"\ud83d\udcb0"}/>
          <KPI l="Retail Sales" actual={store.retail} target={tgt.retail} unit="$" icon={"\ud83d\uded2"} sub={fmt(store.retail)+" sold across "+store.clients+" clients"}/>
          <KPI l="Treatments" actual={store.treats} target={tgt.treatments} unit="" icon={"\ud83d\udc86"} sub={store.treats+" sold \u00b7 "+fmt(data.treatmentRevenue)+" revenue"}/>
        </div>

        <h2 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>{"\ud83d\udcca"} Business Health</h2>
        <div className="g3" style={{marginBottom:18}}>
          {[{l:"Avg Spend",v:fmt(store.avgSpend),good:store.avgSpend>=210,tl:"vs $210 target",icon:"\ud83c\udfab"},{l:"Retention",v:fmtPct(store.retention),good:store.retention>=65,tl:"vs 65% target",icon:"\ud83d\udd04"},{l:"Retail Attach Rate",v:fmtPct(store.retailAttach),good:store.retailAttach>=30,tl:"% of clients buying product",icon:"\ud83d\uded2"}].map((k,i)=>(<div key={k.l} style={{...cdP,position:"relative",overflow:"hidden",animation:"fu 0.3s ease "+(0.1+i*0.04)+"s both"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:k.good?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f87171)"}}/><div style={lb}>{k.icon} {k.l}</div><div style={{fontSize:20,fontWeight:700,color:"#f1f5f9",marginTop:5}}>{k.v}</div><div style={{fontSize:9,color:k.good?"#34d399":"#f87171",marginTop:3}}>{k.good?"\u2714 On target":"\u2717 Below target"} {"\u00b7"} {k.tl}</div></div>))}
        </div>

        <h2 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>{"\ud83d\udcc8"} Growth Indicators</h2>
        <div className="g3" style={{marginBottom:20}}>
          <GrowthCard l="Total Clients" actual={store.clients} target={tgt.clients} icon={"\ud83d\udc65"} prevActual={null}/>
          <GrowthCard l="New Clients" actual={store.newC} target={tgt.newClients} icon={"\ud83c\udd95"} prevActual={null}/>
          <GrowthCard l="Returning Clients" actual={store.retC} target={Math.round(tgt.clients*0.65)} icon={"\ud83d\udd04"} prevActual={null}/>
        </div>

        {/* Charts Row 1: Weekly Revenue + Revenue by Category */}
        <div className="g2" style={{marginBottom:16}}>
          <div style={{...cd,padding:16}}><h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Weekly Revenue Trend</h3>{wks.length>0?(<ResponsiveContainer width="100%" height={170}><ComposedChart data={wks.map(w=>({wk:w.wk,sales:w.sales}))}><XAxis dataKey="wk" tick={{fill:"#64748b",fontSize:8}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"}/><Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8"}} formatter={v=>fmt(v)}/><ReferenceLine y={tgt.sales} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}/><Bar dataKey="sales" name="Sales" radius={[4,4,0,0]} barSize={28}>{wks.map((w,i)=><Cell key={i} fill={w.sales>=tgt.sales?"#10b981":"#6366f1"}/>)}</Bar></ComposedChart></ResponsiveContainer>):(<div style={{height:170,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,color:"#475569"}}>No weekly data</span></div>)}</div>
          <div style={{...cd,padding:16}}><h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Revenue by Category</h3><div className="cat-row"><ResponsiveContainer width="42%" height={170}><PieChart><Pie data={CATS.map(c=>({name:c.label,value:data[c.key]||0}))} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">{CATS.map(c=><Cell key={c.key} fill={c.color}/>)}</Pie><Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8"}} formatter={v=>fmt(v)}/></PieChart></ResponsiveContainer><div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>{CATS.map(c=>{const val=data[c.key]||0;const total=CATS.reduce((s,ct)=>s+(data[ct.key]||0),0);const pct=total>0?val/total*100:0;return(<div key={c.key} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:2,background:c.color,flexShrink:0}}/><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:"#f1f5f9",fontWeight:500}}>{c.label}</span><span style={{fontSize:11,color:"#f1f5f9",fontWeight:600}}>{fmt(val)}</span></div><div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:3}}><div style={{height:"100%",width:pct+"%",background:c.color,borderRadius:2}}/></div></div><span style={{fontSize:10,color:"#94a3b8",width:32,textAlign:"right"}}>{pct.toFixed(0)}%</span></div>)})}</div></div></div>
        </div>

        {/* Charts Row 2: Revenue Trend + Net Profit Trend */}
        <div className="g2" style={{marginBottom:20}}>
          <div style={{...cd,padding:16}}><h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Revenue Trend</h3>{months.length>1?(<ResponsiveContainer width="100%" height={120}><AreaChart data={months.map(m=>({month:fmtMth(m),rev:MD[m].totalRevenue}))}><defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="month" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"}/><Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8"}} formatter={v=>fmt(v)}/><Area type="monotone" dataKey="rev" name="Revenue" stroke="#10b981" fill="url(#gr)" strokeWidth={2}/></AreaChart></ResponsiveContainer>):(<div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}><div style={{fontSize:28,fontWeight:700,color:"#10b981"}}>{fmt(data.totalRevenue)}</div><div style={{fontSize:11,color:"#64748b"}}>Trend builds from next month</div></div>)}</div>
          <div style={{...cd,padding:16}}><h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Net Profit Trend</h3>{months.length>1?(<ResponsiveContainer width="100%" height={120}><AreaChart data={months.map(m=>({month:fmtMth(m),np:MD[m].netProfit-MD[m].parisDrawings}))}><defs><linearGradient id="gnp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="month" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"}/><Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8"}} formatter={v=>fmt(v)}/><Area type="monotone" dataKey="np" name="Net Profit" stroke="#10b981" fill="url(#gnp)" strokeWidth={2}/></AreaChart></ResponsiveContainer>):(<div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}><div style={{fontSize:28,fontWeight:700,color:trueNet>=0?"#10b981":"#ef4444"}}>{fmt(trueNet)}</div><div style={{fontSize:10,color:"#64748b"}}>Trend builds from next month</div></div>)}</div>
        </div>

        <div style={{padding:16,borderRadius:12,background:ROSE+"08",border:"1px solid "+ROSE+"20"}}><h3 style={{fontSize:10,fontWeight:600,color:ROSE,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{"\ud83d\udca1"} Quick Insights</h3><div style={{display:"flex",flexDirection:"column",gap:5,fontSize:11,color:"#cbd5e1",lineHeight:1.6}}>{data.grossProfit/data.totalRevenue*100>=70?<div>{"\u2705"} Gross margin at <strong>{fmtPct(data.grossProfit/data.totalRevenue*100)}</strong> {"\u2014"} healthy</div>:<div>{"\u26a0\ufe0f"} Gross margin at <strong>{fmtPct(data.grossProfit/data.totalRevenue*100)}</strong> {"\u2014"} below 70%</div>}{store.sales>=tgt.sales*nW?<div>{"\u2705"} Store sales hit {nW}-week target of {fmt(tgt.sales*nW)}</div>:<div>{"\u26a0\ufe0f"} Store sales {fmt(store.sales)} is <strong>{fmt(tgt.sales*nW-store.sales)}</strong> below {fmt(tgt.sales*nW)} target</div>}{store.retention>=65?<div>{"\u2705"} Retention at <strong>{fmtPct(store.retention)}</strong></div>:<div>{"\u26a0\ufe0f"} Retention at <strong>{fmtPct(store.retention)}</strong> {"\u2014"} below 65%. Focus on rebooking.</div>}{data.extensionRevenue>0&&<div>{"\ud83d\udc87"} Extensions: <strong>{fmt(data.extensionRevenue)}</strong> ({fmtPct(data.extensionRevenue/data.totalRevenue*100)} of revenue)</div>}<div>{"\ud83d\udcb0"} Net profit (after Paris wage): <strong>{fmt(trueNet)}</strong></div>{data.notes&&<div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>{"\ud83d\udcdd"} {data.notes}</div>}</div></div>
      </div>)}

      {/* ═══ TEAM ═══ */}
      {tab==="team"&&data&&store&&(<div className="content-area" style={{padding:"18px 22px",maxWidth:1180,margin:"0 auto",animation:"fi 0.3s ease"}}>
        <div style={{display:"flex",gap:4,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><span style={{...lb,marginRight:4}}>MONTH:</span>{months.map(m=>(<button key={m} onClick={()=>setSelMonth(m)} style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:500,border:"1px solid",cursor:"pointer",borderColor:selMonth===m?ROSE+"66":"rgba(255,255,255,0.08)",background:selMonth===m?ROSE+"18":"transparent",color:selMonth===m?ROSE:"#64748b"}}>{fmtMth(m)}</button>))}</div>

        <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>Revenue Leaderboard</h3>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:18}}>
          {data.staff.map(p=>({...p,s:STAFF.find(s=>s.id===p.sid)})).sort((a,b)=>b.sales-a.sales).map((p,i)=>{const pct=store.sales>0?p.sales/store.sales*100:0;return(<div className="lb-row" key={p.sid} style={{padding:"9px 12px",...cd,animation:"fu 0.3s ease "+i*0.03+"s both"}}><div style={{width:24,height:24,borderRadius:6,background:i===0?"linear-gradient(135deg,#f59e0b,#d97706)":i===1?"linear-gradient(135deg,#94a3b8,#64748b)":i===2?"linear-gradient(135deg,#b45309,#92400e)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:i<3?"#fff":"#64748b",flexShrink:0}}>{i+1}</div><div style={{flex:"0 0 100px"}}><div style={{fontSize:11,fontWeight:600,color:"#f1f5f9"}}>{p.s.name}</div><div style={{fontSize:8,color:p.s.color,fontWeight:500}}>{p.s.role}</div></div><div style={{flex:1,height:20,background:"rgba(255,255,255,0.04)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:"linear-gradient(90deg,"+p.s.color+","+p.s.color+"88)",borderRadius:4,display:"flex",alignItems:"center",paddingLeft:6}}><span style={{fontSize:9,fontWeight:600,color:"#fff"}}>{fmt(p.sales)}</span></div></div><span style={{fontSize:9,color:"#94a3b8",width:30,textAlign:"right"}}>{pct.toFixed(0)}%</span></div>)})}
        </div>

        <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>Individual Performance</h3>
        <div className="g3" style={{marginBottom:18}}>
          {data.staff.map(p=>({...p,s:STAFF.find(s=>s.id===p.sid)})).sort((a,b)=>b.sales-a.sales).map((p,i)=>{
            const avg=p.clients>0?p.sales/p.clients:0;
            const retailAttachPct=p.clients>0?(Math.min(p.clients,Math.round(p.retail/35))/p.clients)*100:0;
            const monthlyTarget=p.s.wNet*3.2*weeksInMonth;
            const hitTarget=p.sales>=monthlyTarget;
            const variance=p.sales-monthlyTarget;
            const isDir=p.s.comm==="none";
            const isApp=p.s.comm==="apprentice";
            const retailTgt=isDir?0:isApp?500:600;
            const retailPct=retailTgt>0?(p.retail/retailTgt)*100:0;
            const treatTgt=isDir?0:isApp?12:14;
            const treatPct=treatTgt>0?(p.treats/treatTgt)*100:0;
            return(<div key={p.sid} style={{...cdP,position:"relative",overflow:"hidden",animation:"fu 0.3s ease "+i*0.04+"s both"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:p.s.color}}/>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div><div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{p.s.short}</div><div style={{fontSize:8,color:p.s.color}}>{p.s.role}{p.note?" \u00b7 "+p.note:""}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:700,color:p.s.color}}>{fmt(p.sales)}</div></div></div>
              {!isDir&&(<div style={{padding:"5px 8px",borderRadius:6,background:hitTarget?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.06)",border:"1px solid "+(hitTarget?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.15)"),marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,color:hitTarget?"#34d399":"#f87171"}}>{hitTarget?"Above target by "+fmt(variance):"Below target by "+fmt(Math.abs(variance))}</span><span style={{fontSize:9,fontWeight:600,color:"#64748b"}}>Target {fmt(monthlyTarget)}</span></div>)}
              {isDir&&(<div style={{padding:"5px 8px",borderRadius:6,background:ROSE+"0a",border:"1px solid "+ROSE+"25",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,color:ROSE}}>Director {"\u00b7"} {p.clients} clients served</span><span style={{fontSize:9,color:ROSE,fontWeight:600}}>{fmt(avg)} avg spend</span></div>)}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {(isDir?[
                  {l:"Retail",v:fmt(p.retail),s:fmtPct(p.sales>0?p.retail/p.sales*100:0)+" of sales",hit:null},
                  {l:"Treatments",v:p.treats,s:fmt(p.treatRev||0)+" revenue",hit:null},
                  {l:"Average Client Spend",v:fmt(avg),s:p.clients+" clients",hit:null},
                  {l:"Retail Attach Rate",v:fmtPct(retailAttachPct),s:fmt(p.retail)+" across "+p.clients+" clients",hit:null},
                ]:[
                  {l:"Retail",v:fmt(p.retail),s:"Target "+fmt(retailTgt)+" \u00b7 "+fmtPct(Math.min(retailPct,999))+" achieved",hit:retailPct>=100},
                  {l:"Treatments",v:p.treats,s:"Target "+treatTgt+" \u00b7 "+fmtPct(Math.min(treatPct,999))+" achieved",hit:treatPct>=100},
                  {l:"Average Client Spend",v:fmt(avg),s:p.clients+" clients",hit:null},
                  {l:"Retail Attach Rate",v:fmtPct(retailAttachPct),s:fmt(p.retail)+" across "+p.clients+" clients",hit:null},
                ]).map(m=>(<div key={m.l} style={{background:m.hit===true?"rgba(16,185,129,0.08)":m.hit===false?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.03)",border:m.hit===true?"1px solid rgba(16,185,129,0.2)":m.hit===false?"1px solid rgba(239,68,68,0.15)":"1px solid transparent",borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:7,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6}}>{m.l}</div><div style={{fontSize:12,fontWeight:700,color:m.hit===true?"#34d399":m.hit===false?"#f87171":"#f1f5f9",marginTop:1}}>{m.v}</div><div style={{fontSize:7,color:"#94a3b8"}}>{m.s}</div></div>))}
              </div>
            </div>)})}
        </div>

        <div className="g2">
          <div style={{...cd,padding:16}}><h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:12}}>Retail Sales by Stylist</h3><ResponsiveContainer width="100%" height={150}><BarChart data={data.staff.map(p=>({name:STAFF.find(s=>s.id===p.sid)?.short,retail:p.retail,color:STAFF.find(s=>s.id===p.sid)?.color})).sort((a,b)=>b.retail-a.retail)} layout="vertical" margin={{left:60}}><XAxis type="number" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+v}/><YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} width={60}/><Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8"}} formatter={v=>fmt(v)}/><Bar dataKey="retail" radius={[0,4,4,0]} barSize={16}>{data.staff.sort((a,b)=>b.retail-a.retail).map(p=><Cell key={p.sid} fill={STAFF.find(s=>s.id===p.sid)?.color}/>)}</Bar></BarChart></ResponsiveContainer></div>
          <div style={{...cd,padding:16}}><h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:12}}>Treatments by Stylist</h3><ResponsiveContainer width="100%" height={150}><BarChart data={data.staff.map(p=>({name:STAFF.find(s=>s.id===p.sid)?.short,treats:p.treats,color:STAFF.find(s=>s.id===p.sid)?.color})).sort((a,b)=>b.treats-a.treats)} layout="vertical" margin={{left:60}}><XAxis type="number" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} width={60}/><Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} itemStyle={{color:"#e2e8f0"}} labelStyle={{color:"#94a3b8"}} formatter={v=>v+" treatments"}/><Bar dataKey="treats" radius={[0,4,4,0]} barSize={16}>{data.staff.sort((a,b)=>b.treats-a.treats).map(p=><Cell key={p.sid} fill={STAFF.find(s=>s.id===p.sid)?.color}/>)}</Bar></BarChart></ResponsiveContainer></div>
        </div>
      </div>)}

      {/* ═══ COMMISSION ═══ */}
      {tab==="commission"&&data&&(<div className="content-area" style={{padding:"18px 22px",maxWidth:1200,margin:"0 auto",animation:"fi 0.3s ease"}}>
        <h2 style={{fontSize:17,fontWeight:700,fontFamily:"'Playfair Display',serif",color:"#f1f5f9",marginBottom:2}}>Commission Calculator</h2>
        <p style={{fontSize:11,color:"#64748b",marginBottom:16}}>Enter weekly sales (excl. extensions, but include extension GP). Retail & treatment data pulled from monthly entry.</p>

        <div style={{...cd,marginBottom:20,overflow:"hidden"}}>
          <button onClick={()=>setCommWeekOpen(p=>!p)} style={{width:"100%",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",borderBottom:commWeekOpen?"1px solid rgba(255,255,255,0.06)":"none"}}><span style={{fontSize:11,fontWeight:600,color:"#f59e0b"}}>Weekly Sales {"\u2013"} {fmtMth(selMonth)}</span><span style={{fontSize:10,color:"#64748b",transition:"transform 0.2s",transform:commWeekOpen?"rotate(180deg)":"rotate(0deg)"}}>{"\u25bc"}</span></button>
          {commWeekOpen&&<div style={{padding:16}}><div className="scroll-x"><div>
          <div className="comm-grid" style={{marginBottom:6}}><div style={{fontSize:8,color:"#64748b"}}>STYLIST</div>{[1,2,3,4,5].map(w=><div key={w} style={{fontSize:8,color:"#64748b",textAlign:"center"}}>WK {w}</div>)}</div>
          {STAFF.filter(s=>s.comm!=="none").map(s=>(<div key={s.id} className="comm-grid" style={{marginBottom:5}}><div><span style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{s.short}</span><span style={{fontSize:8,color:"#f59e0b",marginLeft:5}}>{fmt(s.wNet*3.2)}</span></div>{[0,1,2,3,4].map(wi=>(<div key={wi} style={{position:"relative"}}><span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#64748b",pointerEvents:"none"}}>$</span><input type="number" value={weekData[s.id][wi]||""} placeholder="0" onChange={e=>{const v=parseFloat(e.target.value)||0;setWeekData(p=>({...p,[s.id]:p[s.id].map((x,j)=>j===wi?v:x)}))}} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#f1f5f9",fontSize:11,padding:"7px 8px 7px 20px",width:"100%",outline:"none",fontFamily:"inherit"}}/></div>))}</div>))}
          </div></div>
          <div style={{fontSize:9,color:"#475569",marginTop:8}}>Gold numbers = 3.2{"\u00d7"} weekly target. Tiers: 3.2{"\u2013"}3.5{"\u00d7"} = 10% {"\u00b7"} 3.5{"\u2013"}4{"\u00d7"} = 20% {"\u00b7"} 4{"\u00d7"}+ = 25%</div>
          <div style={{fontSize:9,color:"#f59e0b",marginTop:6,padding:"5px 8px",borderRadius:5,background:"rgba(245,158,11,0.06)"}}>{"\u26a0\ufe0f"} Include the gross profit from extensions (sale price minus cost price) in weekly totals. Wage bonus is calculated from weekly data {"\u2014"} monthly target uses total staff sales.</div>
          </div>}
        </div>

        <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>Commission Results</h3>
        <div className="g2c" style={{marginBottom:12}}>
          {commNonMgr.map((cr,i)=><CommCard key={cr.staff.id} cr={cr} style={{animation:"fu 0.3s ease "+i*0.04+"s both"}}/>)}
        </div>
        {commMgr.map(cr=><CommCard key={cr.staff.id} cr={cr} style={{animation:"fu 0.3s ease 0.2s both"}}/>)}
      </div>)}

      {/* ═══ ENTRY ═══ */}
      {tab==="entry"&&(<div className="content-area" style={{padding:"18px 22px",maxWidth:900,margin:"0 auto",animation:"fi 0.3s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div><h2 style={{fontSize:17,fontWeight:700,fontFamily:"'Playfair Display',serif",color:"#f1f5f9",marginBottom:2}}>Monthly Data Entry</h2><p style={{fontSize:11,color:"#64748b"}}>Enter data from Xero & Timely.</p></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <select value={entryMonth} onChange={e=>setEntryMonth(e.target.value)}>{MONTH_OPTIONS.map(m=><option key={m} value={m}>{fmtMth(m)}</option>)}</select>
            <button onClick={handleSave} disabled={saveStatus==="saving"} style={{padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:saveStatus==="saved"?"#10b981":saveStatus==="error"?"#ef4444":"linear-gradient(135deg,#6366f1,#4f46e5)",color:"#fff",opacity:saveStatus==="saving"?0.6:1,transition:"all 0.2s"}}>{saveStatus==="saving"?"Saving...":saveStatus==="saved"?"\u2714 Saved!":saveStatus==="error"?"Error \u2013 retry":"Save Month"}</button>
          </div>
        </div>

        <EntrySection id="financials" title="Monthly Financials" color="#6366f1">
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:"#6366f1",fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8}}>From Xero</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <EInput label="Total Revenue" value={entryData.totalRevenue} onChange={v=>updateEntry("totalRevenue",v)} prefix="$"/>
              <EInput label="Gross Profit" value={entryData.grossProfit} onChange={v=>updateEntry("grossProfit",v)} prefix="$"/>
              <EInput label="Net Profit (before Paris)" value={entryData.netProfit} onChange={v=>updateEntry("netProfit",v)} prefix="$"/>
              <EInput label="Paris Wage" value={entryData.parisDrawings} onChange={v=>updateEntry("parisDrawings",v)} prefix="$"/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:"#10b981",fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8}}>From Timely</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <EInput label="Service Revenue" value={entryData.serviceRevenue} onChange={v=>updateEntry("serviceRevenue",v)} prefix="$"/>
              <EInput label="Retail Revenue" value={entryData.retailRevenue} onChange={v=>updateEntry("retailRevenue",v)} prefix="$"/>
              <EInput label="Extension Revenue" value={entryData.extensionRevenue} onChange={v=>updateEntry("extensionRevenue",v)} prefix="$"/>
              <EInput label="Treatment Revenue" value={entryData.treatmentRevenue} onChange={v=>updateEntry("treatmentRevenue",v)} prefix="$"/>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
            <EInput label="Weeks in Month" value={entryData.weeksInMonth} onChange={v=>updateEntry("weeksInMonth",v)} placeholder="4"/>
            <div style={{flex:3}}><div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6,marginBottom:3}}>Notes</div><textarea rows={2} value={entryData.notes} onChange={e=>updateEntry("notes",e.target.value)} placeholder="Any context for this month (leave, holidays, staff changes...)"/></div>
          </div>
        </EntrySection>

        <EntrySection id="staffPerf" title="Staff Performance" color={ROSE}>
          <div className="scroll-x"><div>
          <div className="entry-grid8" style={{marginBottom:6}}><div style={{fontSize:7,color:"#64748b"}}>STYLIST</div>{["Sales","Retail","Treats","Treat $","Clients","New","Return"].map(h=><div key={h} style={{fontSize:7,color:"#64748b",textAlign:"center"}}>{h}</div>)}</div>
          {entryData.staff.map((s,i)=>(<div key={s.sid} className="entry-grid8" style={{marginBottom:4}}><div style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{s.name}</div><EInput value={s.sales} onChange={v=>updateStaffEntry(i,"sales",v)} prefix="$" placeholder="0"/><EInput value={s.retail} onChange={v=>updateStaffEntry(i,"retail",v)} prefix="$" placeholder="0"/><EInput value={s.treats} onChange={v=>updateStaffEntry(i,"treats",v)} placeholder="0"/><EInput value={s.treatRev} onChange={v=>updateStaffEntry(i,"treatRev",v)} prefix="$" placeholder="0"/><EInput value={s.clients} onChange={v=>updateStaffEntry(i,"clients",v)} placeholder="0"/><EInput value={s.newC} onChange={v=>updateStaffEntry(i,"newC",v)} placeholder="0"/><EInput value={s.retC} onChange={v=>updateStaffEntry(i,"retC",v)} placeholder="0"/></div>))}
          </div></div>
        </EntrySection>

        <EntrySection id="weeklyData" title="Weekly Data" color="#f59e0b">
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,color:"#f59e0b",fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8}}>Commission Sales (include extension GP, excl. extension cost price)</div>
            <div className="scroll-x"><div>
            <div className="entry-grid6" style={{marginBottom:6}}><div style={{fontSize:7,color:"#64748b"}}>STYLIST</div>{[1,2,3,4,5].map(w=><div key={w} style={{fontSize:7,color:"#64748b",textAlign:"center"}}>WK {w}</div>)}</div>
            {entryData.weeklySales.map((s,i)=>(<div key={s.sid} className="entry-grid6" style={{marginBottom:4}}><div style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{s.name}</div><EInput value={s.wk1} onChange={v=>updateWeeklySales(i,"wk1",v)} prefix="$"/><EInput value={s.wk2} onChange={v=>updateWeeklySales(i,"wk2",v)} prefix="$"/><EInput value={s.wk3} onChange={v=>updateWeeklySales(i,"wk3",v)} prefix="$"/><EInput value={s.wk4} onChange={v=>updateWeeklySales(i,"wk4",v)} prefix="$"/><EInput value={s.wk5} onChange={v=>updateWeeklySales(i,"wk5",v)} prefix="$"/></div>))}
            </div></div>
          </div>
          <div>
            <div style={{fontSize:9,color:"#ec4899",fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8}}>Store Weekly Scorecard</div>
            <div className="scroll-x"><div>
            <div className="entry-grid-sc" style={{marginBottom:6}}><div style={{fontSize:7,color:"#64748b"}}>WEEK</div>{["Sales","Retail","Treats","Clients","New","Ret %","Avg $"].map(h=><div key={h} style={{fontSize:7,color:"#64748b",textAlign:"center"}}>{h}</div>)}</div>
            {entryData.weeklyScorecard.map((w,i)=>(<div key={i} className="entry-grid-sc" style={{marginBottom:4}}><input type="text" value={w.wk} placeholder="e.g. 05 Feb" onChange={e=>updateScorecard(i,"wk",e.target.value)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#f1f5f9",fontSize:10,padding:"7px 6px",outline:"none",fontFamily:"inherit"}}/><EInput value={w.sales} onChange={v=>updateScorecard(i,"sales",v)} prefix="$"/><EInput value={w.retail} onChange={v=>updateScorecard(i,"retail",v)} prefix="$"/><EInput value={w.treatments} onChange={v=>updateScorecard(i,"treatments",v)} placeholder="0"/><EInput value={w.clients} onChange={v=>updateScorecard(i,"clients",v)} placeholder="0"/><EInput value={w.newClients} onChange={v=>updateScorecard(i,"newClients",v)} placeholder="0"/><EInput value={w.retention} onChange={v=>updateScorecard(i,"retention",v)} placeholder="%"/><EInput value={w.avgSpend} onChange={v=>updateScorecard(i,"avgSpend",v)} prefix="$"/></div>))}
            </div></div>
          </div>
        </EntrySection>

        <div style={{padding:13,borderRadius:10,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)"}}><p style={{fontSize:11,color:"#6ee7b7",margin:0,marginBottom:6}}><strong>How saving works:</strong></p><div style={{fontSize:10,color:"#94a3b8",lineHeight:1.6}}>Each month is saved separately. Select the month from the dropdown, fill in the data, and hit Save. The Financials, Team, and Commission tabs will automatically update with the new data.</div></div>
      </div>)}
    </div>
  );
}