"use client";
// @ts-nocheck
import { useState, useMemo, useCallback } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ComposedChart } from "recharts";

/* ═══ STAFF ═══ */
const STAFF = [
  { id:1, name:"Chelsea Knight", short:"Chelsea", role:"Senior Stylist", comm:"qualified", wNet:1055, color:"#6366f1" },
  { id:2, name:"Paris Melrose", short:"Paris", role:"Director", comm:"none", wNet:0, color:"#e8b4b8" },
  { id:3, name:"Teagan Hoskin", short:"Teagan", role:"Senior Stylist / Manager", comm:"qualified", wNet:1015, color:"#ec4899" },
  { id:4, name:"Leila Hill", short:"Leila", role:"Qualified Stylist", comm:"qualified", wNet:903.56, color:"#10b981" },
  { id:5, name:"Lily Lamprell", short:"Lily", role:"Apprentice", comm:"apprentice", wNet:731.70, color:"#f59e0b" },
  { id:6, name:"Demi Skinner", short:"Demi", role:"Apprentice", comm:"apprentice", wNet:627.64, color:"#8b5cf6" },
];

/* ═══ QUARTERLY TARGETS (per week, store-wide) ═══ */
/* $850k annual ÷ 12 = ~$70,833/month. At ~4.33 weeks/month = ~$17,500/week */
const TARGETS = {
  Q1:{sales:17500,retail:1250,treatments:18,avgSpend:210,retention:65,clients:72,newClients:20},
  Q2:{sales:17500,retail:1500,treatments:22,avgSpend:210,retention:65,clients:75,newClients:20},
  Q3:{sales:17500,retail:1500,treatments:22,avgSpend:210,retention:65,clients:75,newClients:20},
  Q4:{sales:17500,retail:1500,treatments:22,avgSpend:210,retention:65,clients:75,newClients:20},
};
const getQ=m=>{const mo=parseInt(m.split("-")[1]);return mo<=3?"Q1":mo<=6?"Q2":mo<=9?"Q3":"Q4"};

/* ═══ MONTH DATA ═══ */
/* treatRev = per-stylist treatment revenue (estimated proportionally for now — replace with Timely actuals) */
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
      {sid:3,sales:7896,retail:252,treats:6,treatRev:234,clients:43,newC:10,retC:33},
      {sid:4,sales:10512,retail:670,treats:5,treatRev:195,clients:67,newC:21,retC:46},
      {sid:5,sales:8067,retail:766,treats:12,treatRev:468,clients:54,newC:22,retC:32},
      {sid:6,sales:7036,retail:502,treats:13,treatRev:507,clients:40,newC:18,retC:22},
    ],
    notes:"Teagan on leave for part of January. First month of new tracking. Treatment revenue estimated proportionally — update with Timely actuals.",
  }
};

/* ═══ HELPERS ═══ */
const fmt=v=>"$"+Math.round(v).toLocaleString("en-AU");
const fmtPct=v=>v.toFixed(1)+"%";
const fmtMth=m=>{const[y,mo]=m.split("-");return new Date(+y,+mo-1).toLocaleDateString("en-AU",{month:"short",year:"numeric"})};
const ROSE="#e8b4b8";
const CATS=[{key:"serviceRevenue",label:"Services",color:"#6366f1"},{key:"retailRevenue",label:"Retail",color:"#10b981"},{key:"extensionRevenue",label:"Extensions",color:"#f59e0b"},{key:"treatmentRevenue",label:"Treatments",color:"#ec4899"}];

function calcRetailBonus(total,type){
  if(type==="none")return{tier:"-",pct:0,bonus:0};
  const t=type==="apprentice"?[500,650,900]:[600,750,1000];
  if(total>=t[2])return{tier:`Tier 3`,pct:15,bonus:total*0.15,range:`$${t[2]}+`};
  if(total>=t[1])return{tier:`Tier 2`,pct:10,bonus:total*0.10,range:`$${t[1]}-$${t[2]}`};
  if(total>=t[0])return{tier:`Tier 1`,pct:5,bonus:total*0.05,range:`$${t[0]}-$${t[1]}`};
  return{tier:"Below",pct:0,bonus:0,range:`< $${t[0]}`};
}

/* FIXED: Treatment bonus now calculates 10% of treatment REVENUE when threshold is met */
function calcTreatBonus(count,treatRev,type){
  if(type==="none")return{tgt:0,hit:false,bonus:0,rev:0};
  const tgt=type==="apprentice"?12:14;
  const hit=count>=tgt;
  const bonus=hit?treatRev*0.10:0;
  return{tgt,hit,bonus,rev:treatRev};
}

/* Wage tier label and color */
function getTierInfo(mult){
  if(mult>=4)return{label:"4×+",pct:25,color:"#f59e0b",bg:"rgba(245,158,11,0.15)"};
  if(mult>=3.5)return{label:"3.5–4×",pct:20,color:"#10b981",bg:"rgba(16,185,129,0.12)"};
  if(mult>=3.2)return{label:"3.2–3.5×",pct:10,color:"#6366f1",bg:"rgba(99,102,241,0.12)"};
  return{label:"Below 3.2×",pct:0,color:"#475569",bg:"rgba(255,255,255,0.04)"};
}

/* Month options for entry */
const MONTH_OPTIONS=[];
for(let y=2026;y<=2027;y++){for(let m=1;m<=12;m++){MONTH_OPTIONS.push(`${y}-${String(m).padStart(2,"0")}`)}}

/* ═══ APP ═══ */
export default function App(){
  const[tab,setTab]=useState("financial");
  const[selMonth,setSelMonth]=useState("2026-01");
  const months=Object.keys(MD);
  const data=MD[selMonth];
  const q=getQ(selMonth);
  const tgt=TARGETS[q];
  const wks=data?.weeklyScorecard||[];
  const nW=wks.length;
  const weeksInMonth=data?.weeksInMonth||nW;

  const store=useMemo(()=>{
    if(!data?.staff)return null;
    const s=data.staff.reduce((a,p)=>({sales:a.sales+p.sales,retail:a.retail+p.retail,treats:a.treats+p.treats,clients:a.clients+p.clients,newC:a.newC+p.newC,retC:a.retC+p.retC}),{sales:0,retail:0,treats:0,clients:0,newC:0,retC:0});
    s.retention=s.clients>0?s.retC/s.clients*100:0;
    s.avgSpend=s.clients>0?s.sales/s.clients:0;
    const estBuyers=Math.min(s.clients, Math.round(s.retail/35));
    s.retailAttach=s.clients>0?(estBuyers/s.clients)*100:0;
    return s;
  },[data]);

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
      const rb=calcRetailBonus(perf?.retail||0,s.comm);
      const tb=calcTreatBonus(perf?.treats||0,perf?.treatRev||0,s.comm);
      const chartData=weeks.map((sales,i)=>({wk:`Wk${i+1}`,sales:sales||0,target:s.wNet*3.2})).filter((_,i)=>weeks[i]>0||i<weeksInMonth);
      return{staff:s,wCalc,wBonus,rb,tb,total:wBonus+rb.bonus+tb.bonus,chartData};
    });
  },[weekData,data,weeksInMonth]);

  /* ═══ ENTRY STATE ═══ */
  const[entryMonth,setEntryMonth]=useState(()=>{
    const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  const[entryData,setEntryData]=useState({
    totalRevenue:"",grossProfit:"",netProfit:"",parisDrawings:"",
    serviceRevenue:"",retailRevenue:"",extensionRevenue:"",treatmentRevenue:"",
    weeksInMonth:"4",notes:"",
    staff:STAFF.map(s=>({sid:s.id,name:s.short,sales:"",retail:"",treats:"",treatRev:"",clients:"",newC:"",retC:""})),
    weeklySales:STAFF.filter(s=>s.comm!=="none").map(s=>({sid:s.id,name:s.short,wk1:"",wk2:"",wk3:"",wk4:"",wk5:""})),
    weeklyScorecard:[
      {wk:"",sales:"",retail:"",treatments:"",clients:"",newClients:"",retention:"",avgSpend:""},
      {wk:"",sales:"",retail:"",treatments:"",clients:"",newClients:"",retention:"",avgSpend:""},
      {wk:"",sales:"",retail:"",treatments:"",clients:"",newClients:"",retention:"",avgSpend:""},
      {wk:"",sales:"",retail:"",treatments:"",clients:"",newClients:"",retention:"",avgSpend:""},
      {wk:"",sales:"",retail:"",treatments:"",clients:"",newClients:"",retention:"",avgSpend:""},
    ],
  });
  const[saveStatus,setSaveStatus]=useState(null); // null | "saving" | "saved" | "error"

  const updateEntry=(field,val)=>setEntryData(p=>({...p,[field]:val}));
  const updateStaffEntry=(idx,field,val)=>setEntryData(p=>({...p,staff:p.staff.map((s,i)=>i===idx?{...s,[field]:val}:s)}));
  const updateWeeklySales=(idx,field,val)=>setEntryData(p=>({...p,weeklySales:p.weeklySales.map((s,i)=>i===idx?{...s,[field]:val}:s)}));
  const updateScorecard=(idx,field,val)=>setEntryData(p=>({...p,weeklyScorecard:p.weeklyScorecard.map((s,i)=>i===idx?{...s,[field]:val}:s)}));

  const handleSave=useCallback(async()=>{
    setSaveStatus("saving");
    try{
      /* Build the data object to save */
      const e=entryData;
      const monthData={
        month:entryMonth,
        totalRevenue:parseFloat(e.totalRevenue)||0,
        grossProfit:parseFloat(e.grossProfit)||0,
        netProfit:parseFloat(e.netProfit)||0,
        parisDrawings:parseFloat(e.parisDrawings)||0,
        serviceRevenue:parseFloat(e.serviceRevenue)||0,
        retailRevenue:parseFloat(e.retailRevenue)||0,
        extensionRevenue:parseFloat(e.extensionRevenue)||0,
        treatmentRevenue:parseFloat(e.treatmentRevenue)||0,
        weeksInMonth:parseInt(e.weeksInMonth)||4,
        notes:e.notes,
      };
      const staffData=e.staff.map(s=>({
        month:entryMonth,sid:s.sid,
        sales:parseFloat(s.sales)||0,retail:parseFloat(s.retail)||0,
        treats:parseInt(s.treats)||0,treatRev:parseFloat(s.treatRev)||0,
        clients:parseInt(s.clients)||0,newC:parseInt(s.newC)||0,retC:parseInt(s.retC)||0,
      }));
      const weeklyData=e.weeklySales.map(s=>({
        month:entryMonth,sid:s.sid,
        weeks:[s.wk1,s.wk2,s.wk3,s.wk4,s.wk5].map(v=>parseFloat(v)||0),
      }));
      const scorecardData=e.weeklyScorecard.filter(w=>w.wk).map(w=>({
        month:entryMonth,wk:w.wk,
        sales:parseFloat(w.sales)||0,retail:parseFloat(w.retail)||0,
        treatments:parseInt(w.treatments)||0,clients:parseInt(w.clients)||0,
        newClients:parseInt(w.newClients)||0,retention:parseFloat(w.retention)||0,avgSpend:parseFloat(w.avgSpend)||0,
      }));

      /* Save to Supabase if available */
      if(typeof window!=="undefined"&&window.__supabase){
        const sb=window.__supabase;
        /* Upsert monthly financials */
        await sb.from("monthly_financials").upsert({
          month:monthData.month,total_revenue:monthData.totalRevenue,gross_profit:monthData.grossProfit,
          net_profit:monthData.netProfit,paris_drawings:monthData.parisDrawings,
          service_revenue:monthData.serviceRevenue,retail_revenue:monthData.retailRevenue,
          extension_revenue:monthData.extensionRevenue,treatment_revenue:monthData.treatmentRevenue,
          weeks_in_month:monthData.weeksInMonth,notes:monthData.notes,
        },{onConflict:"month"});
        /* Upsert staff performance */
        for(const s of staffData){
          await sb.from("staff_performance").upsert({
            month:s.month,staff_id:s.sid,total_sales:s.sales,retail_sales:s.retail,
            treatments:s.treats,treatment_revenue:s.treatRev,total_clients:s.clients,
            new_clients:s.newC,returning_clients:s.retC,
          },{onConflict:"month,staff_id"});
        }
        /* Upsert weekly sales */
        for(const w of weeklyData){
          await sb.from("weekly_sales").upsert({
            month:w.month,staff_id:w.sid,
            week1:w.weeks[0],week2:w.weeks[1],week3:w.weeks[2],week4:w.weeks[3],week5:w.weeks[4],
          },{onConflict:"month,staff_id"});
        }
        /* Upsert weekly scorecard */
        for(const sc of scorecardData){
          await sb.from("weekly_scorecard").upsert({
            month:sc.month,week_label:sc.wk,total_sales:sc.sales,retail_sales:sc.retail,
            treatments:sc.treatments,total_clients:sc.clients,new_clients:sc.newClients,
            retention_rate:sc.retention,avg_spend:sc.avgSpend,
          },{onConflict:"month,week_label"});
        }
        setSaveStatus("saved");
      } else {
        /* No Supabase — save to local state (preview mode) */
        const staffForMD=staffData.map(s=>{
          const orig=e.staff.find(x=>x.sid===s.sid);
          return{sid:s.sid,sales:s.sales,retail:s.retail,treats:s.treats,treatRev:s.treatRev,clients:s.clients,newC:s.newC,retC:s.retC,note:""};
        });
        MD[entryMonth]={
          totalRevenue:monthData.totalRevenue,grossProfit:monthData.grossProfit,
          netProfit:monthData.netProfit,parisDrawings:monthData.parisDrawings,
          serviceRevenue:monthData.serviceRevenue,retailRevenue:monthData.retailRevenue,
          extensionRevenue:monthData.extensionRevenue,treatmentRevenue:monthData.treatmentRevenue,
          weeksInMonth:monthData.weeksInMonth,
          weeklyScorecard:scorecardData.map(sc=>({wk:sc.wk,sales:sc.sales,retail:sc.retail,treatments:sc.treatments,clients:sc.clients,newClients:sc.newClients,retention:sc.retention,avgSpend:sc.avgSpend})),
          staff:staffForMD,
          notes:monthData.notes,
        };
        /* Also load weekly sales into commission calculator */
        weeklyData.forEach(w=>{setWeekData(p=>({...p,[w.sid]:w.weeks}))});
        setSaveStatus("saved");
      }
      setTimeout(()=>setSaveStatus(null),3000);
    }catch(err){
      console.error("Save error:",err);
      setSaveStatus("error");
      setTimeout(()=>setSaveStatus(null),4000);
    }
  },[entryData,entryMonth]);

  const cd={borderRadius:13,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"};
  const cdP={...cd,padding:"16px 14px"};
  const lb={fontSize:9,color:"#64748b",textTransform:"uppercase",letterSpacing:1};
  const bn={fontSize:22,fontWeight:700,fontFamily:"'DM Sans'"};

  /* ═══ TIER BADGE COMPONENT ═══ */
  const TierBadge=({label,pct,color,bg})=>(
    <span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:4,background:bg,color,letterSpacing:0.3}}>
      {pct>0?`${label} · ${pct}%`:"No bonus"}
    </span>
  );

  const KPI=({l,actual,target,unit,icon,sub,inverse})=>{
    const mTarget=target*nW;
    const good=inverse?actual<=mTarget:actual>=mTarget;
    const vari=actual-mTarget;
    return(
      <div style={{...cdP,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:good?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f87171)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
          <div style={lb}>{icon} {l}</div>
          <span style={{fontSize:8,color:"#475569",background:"rgba(255,255,255,0.04)",padding:"2px 6px",borderRadius:4}}>{nW}wk</span>
        </div>
        <div style={{...bn,color:"#f1f5f9",marginTop:6}}>{unit==="$"?fmt(actual):actual}</div>
        {sub&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{sub}</div>}
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
          <span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:good?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",color:good?"#34d399":"#f87171"}}>
            {vari>=0?"▲":"▼"} {unit==="$"?fmt(Math.abs(vari)):Math.abs(Math.round(vari))}
          </span>
          <span style={{fontSize:9,color:"#64748b"}}>vs {unit==="$"?fmt(mTarget):mTarget} target</span>
        </div>
      </div>
    );
  };

  const GrowthCard=({l,actual,target,icon,prevActual})=>{
    const mTarget=target*nW;
    const good=actual>=mTarget;
    const vari=actual-mTarget;
    const hasPrev=typeof prevActual==="number"&&prevActual>0;
    const momPct=hasPrev?((actual-prevActual)/prevActual)*100:null;
    return(
      <div style={{...cdP,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:good?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f87171)"}}/>
        <div style={lb}>{icon} {l}</div>
        <div style={{...bn,color:"#f1f5f9",marginTop:6}}>{actual}</div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4,flexWrap:"wrap"}}>
          <span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:good?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)",color:good?"#34d399":"#f87171"}}>
            {vari>=0?"▲":"▼"} {Math.abs(Math.round(vari))} vs target
          </span>
          {momPct!==null&&(
            <span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:momPct>=0?"rgba(99,102,241,0.12)":"rgba(245,158,11,0.12)",color:momPct>=0?"#a5b4fc":"#fbbf24"}}>
              {momPct>=0?"▲":"▼"} {fmtPct(Math.abs(momPct))} vs last month
            </span>
          )}
        </div>
      </div>
    );
  };

  /* ═══ ENTRY FORM INPUT COMPONENT ═══ */
  const EInput=({label,value,onChange,prefix,placeholder,type,width})=>(
    <div style={{flex:width||1}}>
      <div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6,marginBottom:3}}>{label}</div>
      <div style={{position:"relative"}}>
        {prefix&&<span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#64748b",pointerEvents:"none"}}>{prefix}</span>}
        <input type="number" value={value} placeholder={placeholder||"0"} onChange={e=>onChange(e.target.value)}
          style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#f1f5f9",fontSize:11,padding:prefix?"7px 8px 7px 18px":"7px 8px",width:"100%",outline:"none",fontFamily:"inherit"}}
        />
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#0c0f1a 0%,#111827 40%,#0f172a 100%)",color:"#e2e8f0",fontFamily:"'DM Sans',-apple-system,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&family=Dancing+Script:wght@400;500&display=swap');
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        *{box-sizing:border-box;margin:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        input[type=number]{-moz-appearance:textfield}
        input[type=number]:focus{border-color:rgba(232,180,184,0.4)!important}
        input::-webkit-inner-spin-button,input::-webkit-outer-spin-button{-webkit-appearance:none}
        select{background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#f1f5f9;font-size:11px;padding:7px 8px;outline:none;font-family:inherit}
        select option{background:#1e293b;color:#f1f5f9}
        select:focus{border-color:rgba(232,180,184,0.4)}
        textarea{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;color:#f1f5f9;font-size:11px;padding:7px 8px;outline:none;font-family:inherit;resize:vertical;width:100%}
        textarea:focus{border-color:rgba(232,180,184,0.4)}
        @media(max-width:768px){
          [data-tab]{padding:14px 12px!important}
          [data-g4]{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
          [data-g3]{grid-template-columns:1fr!important;gap:8px!important}
          [data-g2]{grid-template-columns:1fr!important;gap:10px!important}
          [data-comm]{grid-template-columns:1fr!important;gap:10px!important}
          [data-hdr]{flex-direction:column!important;gap:10px!important;align-items:stretch!important}
          [data-nav]{flex-wrap:wrap!important;justify-content:center!important}
          [data-pie]{flex-direction:column!important}
          [data-lbn]{flex:0 0 80px!important}
          [data-wkgrid]{grid-template-columns:80px repeat(5,1fr)!important;gap:4px!important}
          [data-erow]{flex-wrap:wrap!important}
          [data-erow]>div{min-width:calc(50% - 6px)!important}
          [data-estaff]{grid-template-columns:1fr 1fr 1fr!important;gap:4px!important}
          [data-ewk]{grid-template-columns:1fr 1fr 1fr!important;gap:4px!important}
          [data-esc]{grid-template-columns:1fr 1fr 1fr!important;gap:4px!important}
        }
      `}</style>

      {/* HEADER */}
      <header style={{padding:"13px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:10,background:"rgba(12,15,26,0.95)",backdropFilter:"blur(12px)"}}>
        <div data-hdr="" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1}}>
            <span style={{fontSize:14,fontWeight:300,letterSpacing:4,color:"#f1f5f9",fontFamily:"'DM Sans'"}}>HAIR & HALO</span>
            <span style={{fontSize:13,fontFamily:"'Dancing Script',cursive",color:"#f1f5f9",marginTop:-1,letterSpacing:1}}>studio</span>
          </div>
          <div style={{width:1,height:28,background:"rgba(255,255,255,0.08)",marginLeft:4}}/>
          <span style={{fontSize:8,color:"#64748b",letterSpacing:1.5,textTransform:"uppercase"}}>{fmtMth(selMonth)}</span>
        </div>
        <nav data-nav="" style={{display:"flex",gap:2,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:2}}>
          {[{id:"financial",l:"📊 Financials"},{id:"team",l:"👥 Team"},{id:"commission",l:"💰 Commission"},{id:"entry",l:"✏️ Entry"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 13px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:tab===t.id?600:500,background:tab===t.id?`${ROSE}22`:"transparent",color:tab===t.id?ROSE:"#94a3b8",transition:"all 0.2s"}}>{t.l}</button>
          ))}
        </nav>
        </div>
      </header>

      {/* ═══ FINANCIALS ═══ */}
      {tab==="financial"&&data&&store&&(
        <div style={{padding:"18px 16px",maxWidth:1180,margin:"0 auto",animation:"fi 0.3s ease"}}>
          <div style={{display:"flex",gap:4,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{...lb,marginRight:4}}>MONTH:</span>
            {months.map(m=>(
              <button key={m} onClick={()=>setSelMonth(m)} style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:500,border:"1px solid",cursor:"pointer",borderColor:selMonth===m?`${ROSE}66`:"rgba(255,255,255,0.08)",background:selMonth===m?`${ROSE}18`:"transparent",color:selMonth===m?ROSE:"#64748b"}}>{fmtMth(m)}</button>
            ))}
          </div>

          <div data-g4="" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:18}}>
            {[
              {l:"Total Revenue",v:fmt(data.totalRevenue),c:"#10b981"},
              {l:"Gross Profit",v:fmt(data.grossProfit),s:fmtPct(data.grossProfit/data.totalRevenue*100)+" margin",c:"#6366f1"},
              {l:"Net Profit",v:fmt(data.netProfit),s:fmtPct(data.netProfit/data.totalRevenue*100)+" margin",c:data.netProfit>=0?"#10b981":"#ef4444"},
              {l:"After Paris Wage",v:fmt(data.netProfit-data.parisDrawings),s:`Wage: ${fmt(data.parisDrawings)}`,c:data.netProfit-data.parisDrawings>=0?"#f59e0b":"#ef4444"},
            ].map((k,i)=>(
              <div key={k.l} style={{...cdP,animation:`fu 0.3s ease ${i*0.04}s both`}}>
                <div style={lb}>{k.l}</div>
                <div style={{...bn,color:k.c,marginTop:5}}>{k.v}</div>
                {k.s&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{k.s}</div>}
              </div>
            ))}
          </div>

          <h2 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>🎯 KPIs vs {q} Targets · $850k annual goal</h2>
          <div data-g3="" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:18}}>
            <KPI l="Total Sales" actual={store.sales} target={tgt.sales} unit="$" icon="💰"/>
            <KPI l="Retail Sales" actual={store.retail} target={tgt.retail} unit="$" icon="🛍️" sub={`${fmt(store.retail)} sold across ${store.clients} clients`}/>
            <KPI l="Treatments" actual={store.treats} target={tgt.treatments} unit="" icon="💆" sub={`${store.treats} sold · ${fmt(data.treatmentRevenue)} revenue`}/>
          </div>

          <h2 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>📊 Business Health</h2>
          <div data-g3="" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:18}}>
            {[
              {l:"Avg Spend",v:fmt(store.avgSpend),good:store.avgSpend>=210,tl:"vs $210 target",icon:"🎫"},
              {l:"Retention",v:fmtPct(store.retention),good:store.retention>=65,tl:"vs 65% target",icon:"🔄"},
              {l:"Retail Attach Rate",v:fmtPct(store.retailAttach),good:store.retailAttach>=30,tl:"% of clients buying product",icon:"🛍️"},
            ].map((k,i)=>(
              <div key={k.l} style={{...cdP,position:"relative",overflow:"hidden",animation:`fu 0.3s ease ${0.1+i*0.04}s both`}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:k.good?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f87171)"}}/>
                <div style={lb}>{k.icon} {k.l}</div>
                <div style={{fontSize:20,fontWeight:700,color:"#f1f5f9",marginTop:5}}>{k.v}</div>
                <div style={{fontSize:9,color:k.good?"#34d399":"#f87171",marginTop:3}}>{k.good?"✓ On target":"✗ Below target"} · {k.tl}</div>
              </div>
            ))}
          </div>

          <h2 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>📈 Growth Indicators</h2>
          <div data-g3="" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:20}}>
            <GrowthCard l="Total Clients" actual={store.clients} target={tgt.clients} icon="👥" prevActual={null}/>
            <GrowthCard l="New Clients" actual={store.newC} target={tgt.newClients} icon="🆕" prevActual={null}/>
            <GrowthCard l="Returning Clients" actual={store.retC} target={Math.round(tgt.clients*0.65)} icon="🔄" prevActual={null}/>
          </div>

          <div data-g2="" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
            <div style={{...cd,padding:16}}>
              <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Revenue Trend</h3>
              {months.length>1?(
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={months.map(m=>({month:fmtMth(m),rev:MD[m].totalRevenue}))}>
                    <defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"}/>
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} formatter={v=>fmt(v)}/>
                    <Area type="monotone" dataKey="rev" name="Revenue" stroke="#10b981" fill="url(#gr)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              ):(
                <div style={{height:170,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
                  <div style={{fontSize:28,fontWeight:700,color:"#10b981"}}>{fmt(data.totalRevenue)}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>Trend builds from next month</div>
                </div>
              )}
            </div>
            <div style={{...cd,padding:16}}>
              <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Revenue by Category</h3>
              <div data-pie="" style={{display:"flex",alignItems:"center",gap:14}}>
                <ResponsiveContainer width="42%" height={170}>
                  <PieChart>
                    <Pie data={CATS.map(c=>({name:c.label,value:data[c.key]||0}))} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                      {CATS.map(c=><Cell key={c.key} fill={c.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} formatter={v=>fmt(v)}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                  {CATS.map(c=>{const val=data[c.key]||0;const total=CATS.reduce((s,ct)=>s+(data[ct.key]||0),0);const pct=total>0?val/total*100:0;return(
                    <div key={c.key} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:2,background:c.color,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontSize:11,color:"#f1f5f9",fontWeight:500}}>{c.label}</span>
                          <span style={{fontSize:11,color:"#f1f5f9",fontWeight:600}}>{fmt(val)}</span>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:3}}><div style={{height:"100%",width:`${pct}%`,background:c.color,borderRadius:2}}/></div>
                      </div>
                      <span style={{fontSize:10,color:"#94a3b8",width:32,textAlign:"right"}}>{pct.toFixed(0)}%</span>
                    </div>
                  );})}
                </div>
              </div>
            </div>
          </div>

          <div data-g2="" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
            <div style={{...cd,padding:16}}>
              <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Gross Margin</h3>
              {months.length>1?(
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={months.map(m=>{const d=MD[m];return{month:fmtMth(m),gm:d.totalRevenue>0?d.grossProfit/d.totalRevenue*100:0}})}>
                    <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>v+"%"}/>
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10}} formatter={v=>fmtPct(v)}/>
                    <Line type="monotone" dataKey="gm" name="Gross Margin" stroke="#6366f1" strokeWidth={2.5} dot={{r:4,fill:"#6366f1"}}/>
                  </LineChart>
                </ResponsiveContainer>
              ):(
                <div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
                  <div style={{fontSize:30,fontWeight:700,color:"#6366f1"}}>{fmtPct(data.grossProfit/data.totalRevenue*100)}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>Trend builds from next month</div>
                </div>
              )}
            </div>
            <div style={{...cd,padding:16}}>
              <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:14}}>Net Profit Trend</h3>
              {months.length>1?(
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={months.map(m=>({month:fmtMth(m),np:MD[m].netProfit,npa:MD[m].netProfit-MD[m].parisDrawings}))}>
                    <defs><linearGradient id="gnp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"}/>
                    <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10}} formatter={v=>fmt(v)}/>
                    <Area type="monotone" dataKey="np" name="Net Profit" stroke="#10b981" fill="url(#gnp)" strokeWidth={2}/>
                    <Area type="monotone" dataKey="npa" name="After Paris Wage" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="4 4"/>
                  </AreaChart>
                </ResponsiveContainer>
              ):(
                <div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6}}>
                  <div style={{display:"flex",gap:16}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:"#10b981"}}>{fmt(data.netProfit)}</div><div style={{fontSize:9,color:"#64748b"}}>Net Profit</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:"#f59e0b"}}>{fmt(data.netProfit-data.parisDrawings)}</div><div style={{fontSize:9,color:"#64748b"}}>After Paris Wage</div></div>
                  </div>
                  <div style={{fontSize:10,color:"#64748b"}}>Trend builds from next month</div>
                </div>
              )}
            </div>
          </div>

          <div style={{padding:16,borderRadius:12,background:`${ROSE}08`,border:`1px solid ${ROSE}20`}}>
            <h3 style={{fontSize:10,fontWeight:600,color:ROSE,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>💡 Quick Insights</h3>
            <div style={{display:"flex",flexDirection:"column",gap:5,fontSize:11,color:"#cbd5e1",lineHeight:1.6}}>
              {data.grossProfit/data.totalRevenue*100>=70?<div>✅ Gross margin at <strong>{fmtPct(data.grossProfit/data.totalRevenue*100)}</strong> — healthy</div>:<div>⚠️ Gross margin at <strong>{fmtPct(data.grossProfit/data.totalRevenue*100)}</strong> — below 70%</div>}
              {store.sales>=tgt.sales*nW?<div>✅ Store sales hit {nW}-week target of {fmt(tgt.sales*nW)}</div>:<div>⚠️ Store sales {fmt(store.sales)} is <strong>{fmt(tgt.sales*nW-store.sales)}</strong> below {fmt(tgt.sales*nW)} target ($850k annual pace)</div>}
              {store.retention>=65?<div>✅ Retention at <strong>{fmtPct(store.retention)}</strong></div>:<div>⚠️ Retention at <strong>{fmtPct(store.retention)}</strong> — below 65%. Focus on rebooking.</div>}
              {data.extensionRevenue>0&&<div>💇 Extensions: <strong>{fmt(data.extensionRevenue)}</strong> ({fmtPct(data.extensionRevenue/data.totalRevenue*100)} of revenue)</div>}
              <div>👤 After Paris wage: <strong>{fmt(data.netProfit-data.parisDrawings)}</strong></div>
              {data.notes&&<div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>📝 {data.notes}</div>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TEAM ═══ */}
      {tab==="team"&&data&&store&&(
        <div style={{padding:"18px 16px",maxWidth:1180,margin:"0 auto",animation:"fi 0.3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <span style={{...lb,marginRight:4}}>MONTH:</span>
              {months.map(m=>(
                <button key={m} onClick={()=>setSelMonth(m)} style={{padding:"4px 12px",borderRadius:6,fontSize:10,fontWeight:500,border:"1px solid",cursor:"pointer",borderColor:selMonth===m?`${ROSE}66`:"rgba(255,255,255,0.08)",background:selMonth===m?`${ROSE}18`:"transparent",color:selMonth===m?ROSE:"#64748b"}}>{fmtMth(m)}</button>
              ))}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#10b981"}}>{fmt(store.sales)}</div>
              <div style={{fontSize:9,color:"#64748b",textTransform:"uppercase"}}>Store Revenue</div>
            </div>
          </div>


          <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>Revenue Leaderboard</h3>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:18}}>
            {data.staff.map(p=>({...p,s:STAFF.find(s=>s.id===p.sid)})).sort((a,b)=>b.sales-a.sales).map((p,i)=>{
              const pct=store.sales>0?p.sales/store.sales*100:0;
              return(
                <div key={p.sid} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",...cd,animation:`fu 0.3s ease ${i*0.03}s both`}}>
                  <div style={{width:24,height:24,borderRadius:6,background:i===0?"linear-gradient(135deg,#f59e0b,#d97706)":i===1?"linear-gradient(135deg,#94a3b8,#64748b)":i===2?"linear-gradient(135deg,#b45309,#92400e)":"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:i<3?"#fff":"#64748b",flexShrink:0}}>{i+1}</div>
                  <div data-lbn="" style={{flex:"0 0 120px"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#f1f5f9"}}>{p.s.name}</div>
                    <div style={{fontSize:8,color:p.s.color,fontWeight:500}}>{p.s.role}{p.note?` · ${p.note}`:""}</div>
                  </div>
                  <div style={{flex:1,height:20,background:"rgba(255,255,255,0.04)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${p.s.color},${p.s.color}88)`,borderRadius:4,display:"flex",alignItems:"center",paddingLeft:6}}>
                      <span style={{fontSize:9,fontWeight:600,color:"#fff"}}>{fmt(p.sales)}</span>
                    </div>
                  </div>
                  <span style={{fontSize:9,color:"#94a3b8",width:30,textAlign:"right"}}>{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>

          <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>Individual Performance</h3>
          <div data-g3="" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:18}}>
            {data.staff.map(p=>({...p,s:STAFF.find(s=>s.id===p.sid)})).sort((a,b)=>b.sales-a.sales).map((p,i)=>{
              const ret=p.clients>0?p.retC/p.clients*100:0;
              const avg=p.clients>0?p.sales/p.clients:0;
              const monthlyTarget=p.s.wNet*3.2*weeksInMonth;
              const hitTarget=p.sales>=monthlyTarget;
              return(
                <div key={p.sid} style={{...cdP,position:"relative",overflow:"hidden",animation:`fu 0.3s ease ${i*0.04}s both`}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:p.s.color}}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{p.s.short}</div>
                      <div style={{fontSize:8,color:p.s.color}}>{p.s.role}{p.note?` · ${p.note}`:""}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:15,fontWeight:700,color:p.s.color}}>{fmt(p.sales)}</div>
                    </div>
                  </div>
                  {p.s.comm!=="none"&&(
                    <div style={{padding:"5px 8px",borderRadius:6,background:hitTarget?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.06)",border:`1px solid ${hitTarget?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.15)"}`,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:9,color:hitTarget?"#34d399":"#f87171"}}>{hitTarget?"✓ Hit":"✗ Below"} monthly target</span>
                      <span style={{fontSize:11,fontWeight:700,color:hitTarget?"#10b981":"#ef4444"}}>{fmt(monthlyTarget)}</span>
                    </div>
                  )}
                  {p.s.comm==="none"&&(
                    <div style={{padding:"5px 8px",borderRadius:6,background:`${ROSE}0a`,border:`1px solid ${ROSE}25`,marginBottom:10}}>
                      <span style={{fontSize:9,color:ROSE}}>Director — wage tracked separately</span>
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                    {[
                      {l:"Retail",v:fmt(p.retail),s:fmtPct(p.sales>0?p.retail/p.sales*100:0)+" of sales"},
                      {l:"Treatments",v:p.treats,s:`${fmt(p.treatRev||0)} revenue`},
                      {l:"Avg Ticket",v:fmt(avg),s:"per client"},
                      {l:"Retention",v:fmtPct(ret),s:`${p.retC}/${p.clients}`},
                    ].map(m=>(
                      <div key={m.l} style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"6px 8px"}}>
                        <div style={{fontSize:7,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6}}>{m.l}</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",marginTop:1}}>{m.v}</div>
                        <div style={{fontSize:7,color:"#94a3b8"}}>{m.s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div data-g2="" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{...cd,padding:16}}>
              <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:12}}>Retail Sales by Stylist</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data.staff.map(p=>({name:STAFF.find(s=>s.id===p.sid)?.short,retail:p.retail,color:STAFF.find(s=>s.id===p.sid)?.color})).sort((a,b)=>b.retail-a.retail)} layout="vertical" margin={{left:60}}>
                  <XAxis type="number" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+v}/>
                  <YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} width={60}/>
                  <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10}} formatter={v=>fmt(v)}/>
                  <Bar dataKey="retail" radius={[0,4,4,0]} barSize={16}>
                    {data.staff.sort((a,b)=>b.retail-a.retail).map(p=><Cell key={p.sid} fill={STAFF.find(s=>s.id===p.sid)?.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{...cd,padding:16}}>
              <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",marginBottom:12}}>Treatments by Stylist</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data.staff.map(p=>({name:STAFF.find(s=>s.id===p.sid)?.short,treats:p.treats,color:STAFF.find(s=>s.id===p.sid)?.color})).sort((a,b)=>b.treats-a.treats)} layout="vertical" margin={{left:60}}>
                  <XAxis type="number" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} width={60}/>
                  <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10}} formatter={v=>[v+" treatments"]}/>
                  <Bar dataKey="treats" radius={[0,4,4,0]} barSize={16}>
                    {data.staff.sort((a,b)=>b.treats-a.treats).map(p=><Cell key={p.sid} fill={STAFF.find(s=>s.id===p.sid)?.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══ COMMISSION ═══ */}
      {tab==="commission"&&data&&(
        <div style={{padding:"18px 16px",maxWidth:1200,margin:"0 auto",animation:"fi 0.3s ease"}}>
          <h2 style={{fontSize:17,fontWeight:700,fontFamily:"'Playfair Display',serif",color:"#f1f5f9",marginBottom:2}}>Commission Calculator</h2>
          <p style={{fontSize:11,color:"#64748b",marginBottom:16}}>Enter weekly sales (excl. extensions). Retail & treatment data from Team tab.</p>

          {/* Weekly entry */}
          <div style={{...cd,padding:16,marginBottom:20}}>
            <h3 style={{fontSize:11,fontWeight:600,color:"#f59e0b",marginBottom:10}}>📅 Weekly Sales — {fmtMth(selMonth)}</h3>
            <div data-wkgrid="" style={{display:"grid",gridTemplateColumns:"130px repeat(5,1fr)",gap:7,alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:8,color:"#64748b"}}>STYLIST</div>
              {[1,2,3,4,5].map(w=><div key={w} style={{fontSize:8,color:"#64748b",textAlign:"center"}}>WK {w}</div>)}
            </div>
            {STAFF.filter(s=>s.comm!=="none").map(s=>(
              <div key={s.id} data-wkgrid="" style={{display:"grid",gridTemplateColumns:"130px repeat(5,1fr)",gap:7,alignItems:"center",marginBottom:5}}>
                <div><span style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{s.short}</span><span style={{fontSize:8,color:"#f59e0b",marginLeft:5}}>{fmt(s.wNet*3.2)}</span></div>
                {[0,1,2,3,4].map(wi=>(
                  <div key={wi} style={{position:"relative"}}>
                    <span style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",fontSize:9,color:"#64748b",pointerEvents:"none"}}>$</span>
                    <input type="number" value={weekData[s.id][wi]||""} placeholder="0" onChange={e=>{
                      const v=parseFloat(e.target.value)||0;
                      setWeekData(p=>({...p,[s.id]:p[s.id].map((x,j)=>j===wi?v:x)}));
                    }} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#f1f5f9",fontSize:11,padding:"7px 8px 7px 20px",width:"100%",outline:"none",fontFamily:"inherit"}}/>
                  </div>
                ))}
              </div>
            ))}
            <div style={{fontSize:9,color:"#475569",marginTop:8}}>💡 Gold numbers = 3.2× weekly target. Tiers: 3.2–3.5× = 10% · 3.5–4× = 20% · 4×+ = 25%</div>
          </div>

          {/* Commission results with sparklines and tier badges */}
          <h3 style={{...lb,fontSize:10,fontWeight:600,color:"#94a3b8",letterSpacing:1.5,marginBottom:8}}>Commission Results</h3>
          <div data-comm="" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {commResults.map((cr,i)=>{
              const perf=data.staff?.find(p=>p.sid===cr.staff.id);
              const t32=cr.staff.wNet*3.2;
              const hasData=cr.wCalc.length>0;
              const maxSales=Math.max(t32*1.3,...(cr.chartData.map(d=>d.sales)));
              return(
                <div key={cr.staff.id} style={{...cdP,position:"relative",overflow:"hidden",animation:`fu 0.3s ease ${i*0.04}s both`}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:cr.staff.color}}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{cr.staff.name}</div>
                      <div style={{fontSize:8,color:cr.staff.color}}>{cr.staff.role} · Target: {fmt(t32)}/wk</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:17,fontWeight:700,color:"#10b981"}}>{fmt(cr.total)}</div>
                      <div style={{fontSize:8,color:"#64748b"}}>Total Commission</div>
                    </div>
                  </div>

                  {/* SPARKLINE CHART */}
                  <div style={{marginBottom:10}}>
                    {hasData?(
                      <ResponsiveContainer width="100%" height={90}>
                        <ComposedChart data={cr.chartData} margin={{top:5,right:5,bottom:0,left:5}}>
                          <XAxis dataKey="wk" tick={{fill:"#64748b",fontSize:8}} axisLine={false} tickLine={false}/>
                          <YAxis hide domain={[0,maxSales]}/>
                          <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,fontSize:10,color:"#e2e8f0"}} formatter={(v,name)=>[fmt(v),name==="sales"?"Sales":"Target"]}/>
                          <ReferenceLine y={t32} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}/>
                          <Bar dataKey="sales" radius={[4,4,0,0]} barSize={28}>
                            {cr.chartData.map((d,j)=>(
                              <Cell key={j} fill={d.sales>=t32?`${cr.staff.color}`:`${cr.staff.color}55`}/>
                            ))}
                          </Bar>
                        </ComposedChart>
                      </ResponsiveContainer>
                    ):(
                      <div style={{height:90,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.02)",borderRadius:8}}>
                        <span style={{fontSize:10,color:"#475569"}}>Enter weekly sales above to see chart</span>
                      </div>
                    )}
                    {hasData&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:12,height:2,background:"#f59e0b",borderRadius:1}}/><span style={{fontSize:8,color:"#64748b"}}>3.2× target ({fmt(t32)})</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:8,height:8,borderRadius:2,background:cr.staff.color}}/><span style={{fontSize:8,color:"#64748b"}}>Above</span></div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:8,height:8,borderRadius:2,background:`${cr.staff.color}55`}}/><span style={{fontSize:8,color:"#64748b"}}>Below</span></div>
                    </div>}
                  </div>

                  {/* Wage bonus detail with TIER BADGES */}
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.7,marginBottom:4}}>Wage Bonus — {fmt(cr.wBonus)}</div>
                    {cr.wCalc.length>0?cr.wCalc.map(w=>(
                      <div key={w.wk} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",fontSize:9}}>
                        <span style={{color:"#94a3b8"}}>Wk{w.wk}: {fmt(w.sales)} <span style={{color:"#64748b"}}>({w.mult.toFixed(2)}×)</span></span>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <TierBadge label={w.label} pct={w.pct} color={w.color} bg={w.bg}/>
                          {w.pct>0&&<span style={{color:"#34d399",fontWeight:600,fontSize:9}}>{fmt(w.bonus)}</span>}
                        </div>
                      </div>
                    )):<div style={{fontSize:9,color:"#475569"}}>Enter weekly sales above</div>}
                  </div>

                  {/* Retail + Treatment with tier display */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"7px 8px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <div style={{fontSize:7,color:"#64748b",textTransform:"uppercase"}}>Retail Bonus</div>
                        {cr.rb.pct>0&&<span style={{fontSize:7,fontWeight:700,padding:"1px 5px",borderRadius:3,background:"rgba(16,185,129,0.12)",color:"#34d399"}}>{cr.rb.tier} · {cr.rb.pct}%</span>}
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:cr.rb.pct>0?"#10b981":"#475569",marginTop:2}}>{fmt(cr.rb.bonus)}</div>
                      <div style={{fontSize:8,color:"#94a3b8"}}>{fmt(perf?.retail||0)} {cr.rb.pct>0?`→ ${cr.rb.range}`:"→ below threshold"}</div>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:6,padding:"7px 8px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <div style={{fontSize:7,color:"#64748b",textTransform:"uppercase"}}>Treatment Bonus</div>
                        {cr.tb.hit&&<span style={{fontSize:7,fontWeight:700,padding:"1px 5px",borderRadius:3,background:"rgba(16,185,129,0.12)",color:"#34d399"}}>10% · {fmt(cr.tb.rev)}</span>}
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:cr.tb.hit?"#10b981":"#475569",marginTop:2}}>{fmt(cr.tb.bonus)}</div>
                      <div style={{fontSize:8,color:"#94a3b8"}}>{perf?.treats||0}/{cr.tb.tgt} treatments{cr.tb.hit?` · ${fmt(cr.tb.rev)} rev`:""}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ ENTRY — REAL FORMS ═══ */}
      {tab==="entry"&&(
        <div style={{padding:"18px 16px",maxWidth:900,margin:"0 auto",animation:"fi 0.3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <div>
              <h2 style={{fontSize:17,fontWeight:700,fontFamily:"'Playfair Display',serif",color:"#f1f5f9",marginBottom:2}}>Monthly Data Entry</h2>
              <p style={{fontSize:11,color:"#64748b"}}>Enter data from Xero & Timely. ~10 minutes per month.</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <select value={entryMonth} onChange={e=>setEntryMonth(e.target.value)}>
                {MONTH_OPTIONS.map(m=><option key={m} value={m}>{fmtMth(m)}</option>)}
              </select>
              <button onClick={handleSave} disabled={saveStatus==="saving"} style={{padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:saveStatus==="saved"?"#10b981":saveStatus==="error"?"#ef4444":"linear-gradient(135deg,#e8b4b8,#d4a0a5)",color:"#fff",opacity:saveStatus==="saving"?0.6:1,transition:"all 0.2s"}}>
                {saveStatus==="saving"?"Saving...":saveStatus==="saved"?"✓ Saved!":saveStatus==="error"?"Error — retry":"💾 Save Month"}
              </button>
            </div>
          </div>

          {/* Section 1: Xero */}
          <div style={{...cd,padding:16,marginBottom:12}}>
            <h3 style={{fontSize:11,fontWeight:600,color:"#6366f1",marginBottom:10}}>📊 From Xero — P&L Report</h3>
            <div data-erow="" style={{display:"flex",gap:10}}>
              <EInput label="Total Revenue" value={entryData.totalRevenue} onChange={v=>updateEntry("totalRevenue",v)} prefix="$"/>
              <EInput label="Gross Profit" value={entryData.grossProfit} onChange={v=>updateEntry("grossProfit",v)} prefix="$"/>
              <EInput label="Net Profit" value={entryData.netProfit} onChange={v=>updateEntry("netProfit",v)} prefix="$"/>
              <EInput label="Paris Wage" value={entryData.parisDrawings} onChange={v=>updateEntry("parisDrawings",v)} prefix="$"/>
            </div>
          </div>

          {/* Section 2: Revenue Categories */}
          <div style={{...cd,padding:16,marginBottom:12}}>
            <h3 style={{fontSize:11,fontWeight:600,color:"#10b981",marginBottom:10}}>📈 From Timely — Revenue by Category</h3>
            <div data-erow="" style={{display:"flex",gap:10}}>
              <EInput label="Service Revenue" value={entryData.serviceRevenue} onChange={v=>updateEntry("serviceRevenue",v)} prefix="$"/>
              <EInput label="Retail Revenue" value={entryData.retailRevenue} onChange={v=>updateEntry("retailRevenue",v)} prefix="$"/>
              <EInput label="Extension Revenue" value={entryData.extensionRevenue} onChange={v=>updateEntry("extensionRevenue",v)} prefix="$"/>
              <EInput label="Treatment Revenue" value={entryData.treatmentRevenue} onChange={v=>updateEntry("treatmentRevenue",v)} prefix="$"/>
            </div>
          </div>

          {/* Section 3: Staff Performance */}
          <div style={{...cd,padding:16,marginBottom:12}}>
            <h3 style={{fontSize:11,fontWeight:600,color:ROSE,marginBottom:10}}>👥 From Timely — Staff Performance</h3>
            <div data-estaff="" style={{display:"grid",gridTemplateColumns:"90px repeat(7,1fr)",gap:6,alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:7,color:"#64748b"}}>STYLIST</div>
              {["Sales","Retail","Treats","Treat $","Clients","New","Return"].map(h=><div key={h} style={{fontSize:7,color:"#64748b",textAlign:"center"}}>{h}</div>)}
            </div>
            {entryData.staff.map((s,i)=>(
              <div key={s.sid} data-estaff="" style={{display:"grid",gridTemplateColumns:"90px repeat(7,1fr)",gap:6,alignItems:"center",marginBottom:4}}>
                <div style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{s.name}</div>
                <EInput value={s.sales} onChange={v=>updateStaffEntry(i,"sales",v)} prefix="$" placeholder="0"/>
                <EInput value={s.retail} onChange={v=>updateStaffEntry(i,"retail",v)} prefix="$" placeholder="0"/>
                <EInput value={s.treats} onChange={v=>updateStaffEntry(i,"treats",v)} placeholder="0"/>
                <EInput value={s.treatRev} onChange={v=>updateStaffEntry(i,"treatRev",v)} prefix="$" placeholder="0"/>
                <EInput value={s.clients} onChange={v=>updateStaffEntry(i,"clients",v)} placeholder="0"/>
                <EInput value={s.newC} onChange={v=>updateStaffEntry(i,"newC",v)} placeholder="0"/>
                <EInput value={s.retC} onChange={v=>updateStaffEntry(i,"retC",v)} placeholder="0"/>
              </div>
            ))}
          </div>

          {/* Section 4: Weekly Sales */}
          <div style={{...cd,padding:16,marginBottom:12}}>
            <h3 style={{fontSize:11,fontWeight:600,color:"#f59e0b",marginBottom:10}}>📅 Weekly Sales — Commission (excl. extensions)</h3>
            <div data-ewk="" style={{display:"grid",gridTemplateColumns:"90px repeat(5,1fr)",gap:6,alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:7,color:"#64748b"}}>STYLIST</div>
              {[1,2,3,4,5].map(w=><div key={w} style={{fontSize:7,color:"#64748b",textAlign:"center"}}>WK {w}</div>)}
            </div>
            {entryData.weeklySales.map((s,i)=>(
              <div key={s.sid} data-ewk="" style={{display:"grid",gridTemplateColumns:"90px repeat(5,1fr)",gap:6,alignItems:"center",marginBottom:4}}>
                <div style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{s.name}</div>
                <EInput value={s.wk1} onChange={v=>updateWeeklySales(i,"wk1",v)} prefix="$"/>
                <EInput value={s.wk2} onChange={v=>updateWeeklySales(i,"wk2",v)} prefix="$"/>
                <EInput value={s.wk3} onChange={v=>updateWeeklySales(i,"wk3",v)} prefix="$"/>
                <EInput value={s.wk4} onChange={v=>updateWeeklySales(i,"wk4",v)} prefix="$"/>
                <EInput value={s.wk5} onChange={v=>updateWeeklySales(i,"wk5",v)} prefix="$"/>
              </div>
            ))}
          </div>

          {/* Section 5: Weekly Scorecard */}
          <div style={{...cd,padding:16,marginBottom:12}}>
            <h3 style={{fontSize:11,fontWeight:600,color:"#ec4899",marginBottom:10}}>📋 Weekly Scorecard — Store Totals</h3>
            <div data-esc="" style={{display:"grid",gridTemplateColumns:"80px repeat(7,1fr)",gap:5,alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:7,color:"#64748b"}}>WEEK</div>
              {["Sales","Retail","Treats","Clients","New","Ret %","Avg $"].map(h=><div key={h} style={{fontSize:7,color:"#64748b",textAlign:"center"}}>{h}</div>)}
            </div>
            {entryData.weeklyScorecard.map((w,i)=>(
              <div key={i} data-esc="" style={{display:"grid",gridTemplateColumns:"80px repeat(7,1fr)",gap:5,alignItems:"center",marginBottom:4}}>
                <input type="text" value={w.wk} placeholder={`e.g. 05 Feb`} onChange={e=>updateScorecard(i,"wk",e.target.value)}
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#f1f5f9",fontSize:10,padding:"7px 6px",outline:"none",fontFamily:"inherit"}}/>
                <EInput value={w.sales} onChange={v=>updateScorecard(i,"sales",v)} prefix="$"/>
                <EInput value={w.retail} onChange={v=>updateScorecard(i,"retail",v)} prefix="$"/>
                <EInput value={w.treatments} onChange={v=>updateScorecard(i,"treatments",v)} placeholder="0"/>
                <EInput value={w.clients} onChange={v=>updateScorecard(i,"clients",v)} placeholder="0"/>
                <EInput value={w.newClients} onChange={v=>updateScorecard(i,"newClients",v)} placeholder="0"/>
                <EInput value={w.retention} onChange={v=>updateScorecard(i,"retention",v)} placeholder="%"/>
                <EInput value={w.avgSpend} onChange={v=>updateScorecard(i,"avgSpend",v)} prefix="$"/>
              </div>
            ))}
          </div>

          {/* Section 6: Meta + Notes */}
          <div style={{...cd,padding:16,marginBottom:12}}>
            <h3 style={{fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:10}}>📝 Month Info</h3>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <EInput label="Weeks in Month" value={entryData.weeksInMonth} onChange={v=>updateEntry("weeksInMonth",v)} placeholder="4"/>
            </div>
            <div>
              <div style={{fontSize:8,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6,marginBottom:3}}>Notes</div>
              <textarea rows={3} value={entryData.notes} onChange={e=>updateEntry("notes",e.target.value)} placeholder="Any context for this month (leave, holidays, staff changes...)"/>
            </div>
          </div>

          {/* How it works */}
          <div style={{padding:13,borderRadius:10,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.15)"}}>
            <p style={{fontSize:11,color:"#6ee7b7",margin:0,marginBottom:6}}><strong>How saving works:</strong></p>
            <div style={{fontSize:10,color:"#94a3b8",lineHeight:1.6}}>
              Each month is saved separately. Select the month from the dropdown, fill in the data, and hit Save. If you re-select the same month later, it will overwrite the previous data for that month. The Financials and Team tabs will automatically show the new data. Weekly sales also feed into the Commission calculator.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}