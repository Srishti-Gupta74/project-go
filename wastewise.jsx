import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg: "#030a03", bgCard: "rgba(255,255,255,.03)", bgDeep: "#050d05",
    border: "rgba(255,255,255,.07)", borderGreen: "rgba(74,222,128,.22)",
    text: "#e8f5e8", textMid: "#7aaa7a", textDim: "#3a5a3a",
    green: "#4ade80", greenLight: "#86efac", greenDeep: "#16a34a",
    blue: "#60a5fa", purple: "#c084fc", yellow: "#fbbf24", red: "#f87171", orange: "#fb923c",
    navBg: "rgba(3,10,3,.85)",
    leaf1: "rgba(74,222,128,.12)", leaf2: "rgba(74,222,128,.06)",
    shadow: "rgba(0,0,0,.5)",
  },
  light: {
    bg: "#f0faf0", bgCard: "rgba(255,255,255,.85)", bgDeep: "#e8f5e8",
    border: "rgba(0,0,0,.08)", borderGreen: "rgba(22,163,74,.25)",
    text: "#1a3a1a", textMid: "#4a7a4a", textDim: "#8aaa8a",
    green: "#16a34a", greenLight: "#15803d", greenDeep: "#166534",
    blue: "#2563eb", purple: "#7c3aed", yellow: "#d97706", red: "#dc2626", orange: "#ea580c",
    navBg: "rgba(240,250,240,.92)",
    leaf1: "rgba(22,163,74,.1)", leaf2: "rgba(22,163,74,.05)",
    shadow: "rgba(0,0,0,.12)",
  }
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CATS = {
  wet:       { color:"#4ade80", darkColor:"#16a34a", bg:"#052e16", label:"Wet Waste",    emoji:"🟢", bin:"Green Bin",      points:10 },
  dry:       { color:"#60a5fa", darkColor:"#2563eb", bg:"#0c1a2e", label:"Dry Waste",    emoji:"🔵", bin:"Blue Bin",       points:15 },
  hazardous: { color:"#f87171", darkColor:"#dc2626", bg:"#2d0a0a", label:"Hazardous",    emoji:"🔴", bin:"Red Bin",        points:25 },
  ewaste:    { color:"#c084fc", darkColor:"#7c3aed", bg:"#1a0a2e", label:"E-Waste",      emoji:"🟣", bin:"E-Waste Center", points:30 },
  sanitary:  { color:"#fb923c", darkColor:"#ea580c", bg:"#2d1200", label:"Sanitary",     emoji:"🟠", bin:"Black Bin",      points:10 },
};
const BADGES = [
  { id:"first",  icon:"🌱", name:"First Scan",    desc:"Scanned your first item",           req:1  },
  { id:"eco5",   icon:"🌿", name:"Eco Starter",   desc:"Scanned 5 items",                   req:5  },
  { id:"green10",icon:"🌳", name:"Green Hero",    desc:"Scanned 10 items",                  req:10 },
  { id:"pts50",  icon:"⚡", name:"Eco Spark",     desc:"Earned 50 EcoCoins",                req:50,  type:"points" },
  { id:"pts100", icon:"🔥", name:"EcoWarrior",    desc:"Earned 100 EcoCoins",               req:100, type:"points" },
  { id:"hazard", icon:"🛡️", name:"Safety First",  desc:"Handled hazardous waste correctly", cat:"hazardous" },
  { id:"etech",  icon:"💻", name:"Tech Recycler", desc:"Disposed e-waste properly",         cat:"ewaste" },
];
const REWARDS = [
  // Free tier
  { id:"r1",  cost:30,  icon:"🌱", title:"Plant a Tree",         subtitle:"via SankalpTaru NGO",       desc:"We plant a real tree in your name in India's reforestation zones. You'll get a certificate with GPS location.",    tag:"Real Impact",    tagColor:"#4ade80",  category:"planet"  },
  { id:"r2",  cost:50,  icon:"🐢", title:"Save Sea Turtles",     subtitle:"1 day of patrol funded",     desc:"Fund one day of sea turtle nest protection on India's coast via Wildlife Trust of India.",                        tag:"Wildlife",       tagColor:"#60a5fa",  category:"planet"  },
  { id:"r3",  cost:25,  icon:"📜", title:"Eco Warrior Certificate", subtitle:"Shareable PDF",           desc:"A beautiful personalised certificate celebrating your recycling journey. Share on LinkedIn & Instagram!",          tag:"Shareable",      tagColor:"#c084fc",  category:"digital" },
  { id:"r4",  cost:40,  icon:"🎁", title:"10% Off — Bamboo Store", subtitle:"eartheco.in coupon",       desc:"Get 10% off sustainable bamboo products — toothbrush, bottle, cutlery set. Code sent to your email.",            tag:"Discount",       tagColor:"#fb923c",  category:"coupon"  },
  { id:"r5",  cost:60,  icon:"☀️", title:"Solar Lamp Donation",   subtitle:"for a rural family",        desc:"Donate a solar lamp to a family without electricity in rural Rajasthan via Frontier Markets.",                    tag:"Real Impact",    tagColor:"#fbbf24",  category:"planet"  },
  { id:"r6",  cost:20,  icon:"🛍️", title:"5% Off — GreenCart",    subtitle:"organic grocery app",       desc:"5% discount on your next GreenCart organic grocery order. Code valid for 30 days.",                             tag:"Discount",       tagColor:"#fb923c",  category:"coupon"  },
  { id:"r7",  cost:80,  icon:"🌊", title:"Clean 1kg of Ocean Plastic", subtitle:"via The Ocean Cleanup India", desc:"Fund the removal of 1 kg of plastic from Indian coastal waters. Receive a photo update.",                  tag:"Real Impact",    tagColor:"#4ade80",  category:"planet"  },
  { id:"r8",  cost:35,  icon:"🎓", title:"Eco Hero Profile Badge",  subtitle:"on WasteWise",            desc:"Unlock a golden 'Eco Hero' frame on your WasteWise profile, visible to everyone.",                               tag:"Profile",        tagColor:"#c084fc",  category:"digital" },
  { id:"r9",  cost:100, icon:"🌍", title:"Name a Tree Forest Plot", subtitle:"1m² in your name",        desc:"1 square metre of a reforestation zone is registered in your name. Includes digital land certificate.",            tag:"Premium",        tagColor:"#f87171",  category:"planet"  },
  { id:"r10", cost:15,  icon:"💌", title:"Eco Wallpaper Pack",     subtitle:"12 nature wallpapers",      desc:"Download 12 stunning nature photography wallpapers for your phone and desktop. Exclusive to WasteWise users.",     tag:"Free Gift",      tagColor:"#4ade80",  category:"digital" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const ls = {
  get:(k,d)=>{ try{const v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch{return d;} },
  set:(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} }
};

const seedDemo = (username) => {
  const base=Date.now(), DAY=86400000;
  const items=[
    {itemName:"Plastic Bottle",  category:"dry",       carbonPercent:73, points:15, date:new Date(base-6*DAY).toISOString()},
    {itemName:"Banana Peel",     category:"wet",       carbonPercent:40, points:10, date:new Date(base-5*DAY).toISOString()},
    {itemName:"Old Smartphone",  category:"ewaste",    carbonPercent:85, points:30, date:new Date(base-4*DAY).toISOString()},
    {itemName:"Newspaper",       category:"dry",       carbonPercent:55, points:15, date:new Date(base-4*DAY).toISOString()},
    {itemName:"Battery",         category:"hazardous", carbonPercent:90, points:25, date:new Date(base-3*DAY).toISOString()},
    {itemName:"Food Scraps",     category:"wet",       carbonPercent:35, points:10, date:new Date(base-2*DAY).toISOString()},
    {itemName:"Cardboard Box",   category:"dry",       carbonPercent:60, points:15, date:new Date(base-1*DAY).toISOString()},
    {itemName:"Glass Bottle",    category:"dry",       carbonPercent:68, points:15, date:new Date(base).toISOString()},
  ];
  ls.set(`ww_history_${username}`,items);
  ls.set(`ww_pts_${username}`,items.reduce((s,i)=>s+i.points,0));
  ls.set(`ww_scans_${username}`,items.length);
  ls.set(`ww_badges_${username}`,["first","eco5","pts50"]);
};

// ─── Animated leaf SVG ───────────────────────────────────────────────────────
const FloatingLeaf = ({style, isDark}) => (
  <div style={{position:"absolute",pointerEvents:"none",opacity:.6,...style}}>
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
      <path d="M10 1C10 1 2 8 2 15C2 19.4 5.6 23 10 23C14.4 23 18 19.4 18 15C18 8 10 1 10 1Z"
        fill={isDark?"rgba(74,222,128,.35)":"rgba(22,163,74,.3)"} stroke={isDark?"rgba(74,222,128,.5)":"rgba(22,163,74,.5)"} strokeWidth=".5"/>
      <path d="M10 3 Q10 14 10 22" stroke={isDark?"rgba(74,222,128,.6)":"rgba(22,163,74,.6)"} strokeWidth=".8"/>
    </svg>
  </div>
);

// ─── Orb background ──────────────────────────────────────────────────────────
const BackgroundOrbs = ({isDark}) => (
  <>
    <div style={{position:"fixed",top:"5%",left:"-5%",width:500,height:500,borderRadius:"50%",background:isDark?"radial-gradient(circle,rgba(74,222,128,.07),transparent 65%)":"radial-gradient(circle,rgba(74,222,128,.12),transparent 65%)",pointerEvents:"none",animation:"ww-orb1 12s ease-in-out infinite",zIndex:0}}/>
    <div style={{position:"fixed",bottom:"10%",right:"-8%",width:600,height:600,borderRadius:"50%",background:isDark?"radial-gradient(circle,rgba(96,165,250,.05),transparent 65%)":"radial-gradient(circle,rgba(96,165,250,.1),transparent 65%)",pointerEvents:"none",animation:"ww-orb2 15s ease-in-out infinite",zIndex:0}}/>
    <div style={{position:"fixed",top:"40%",right:"20%",width:300,height:300,borderRadius:"50%",background:isDark?"radial-gradient(circle,rgba(74,222,128,.04),transparent 65%)":"radial-gradient(circle,rgba(22,163,74,.08),transparent 65%)",pointerEvents:"none",animation:"ww-orb3 18s ease-in-out infinite",zIndex:0}}/>
  </>
);

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner = ({color="#4ade80",size=16}) => (
  <div style={{width:size,height:size,border:`2px solid ${color}40`,borderTopColor:color,borderRadius:"50%",animation:"ww-spin .8s linear infinite",flexShrink:0}}/>
);

// ─── Glass Card ──────────────────────────────────────────────────────────────
const Card = ({children, style, t, glow, ...rest}) => (
  <div style={{
    background:t.bgCard, border:`1px solid ${t.border}`,
    borderRadius:20, backdropFilter:"blur(12px)",
    boxShadow:glow?`0 8px 32px ${t.shadow}, 0 0 0 1px ${t.borderGreen}`:`0 4px 24px ${t.shadow}`,
    transition:"all .3s ease", ...style
  }} {...rest}>{children}</div>
);

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const ChartTip = ({active,payload,label,t}) => {
  if(!active||!payload?.length) return null;
  return <div style={{background:t?.bgDeep||"#050d05",border:`1px solid ${t?.borderGreen||"rgba(74,222,128,.3)"}`,borderRadius:10,padding:"10px 14px",boxShadow:`0 8px 24px ${t?.shadow||"rgba(0,0,0,.4)"}`}}>{label&&<div style={{fontSize:11,color:t?.textMid,marginBottom:4}}>{label}</div>}{payload.map((p,i)=><div key={i} style={{fontSize:13,color:p.color,fontWeight:700}}>{p.name}: {p.value}</div>)}</div>;
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    @keyframes ww-spin{to{transform:rotate(360deg)}}
    @keyframes ww-slideup{from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes ww-fadein{from{opacity:0}to{opacity:1}}
    @keyframes ww-pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.08);opacity:1}}
    @keyframes ww-float0{0%,100%{transform:translateY(0px) translateX(0px) rotate(0deg)}33%{transform:translateY(-22px) translateX(12px) rotate(8deg)}66%{transform:translateY(8px) translateX(-8px) rotate(-5deg)}}
    @keyframes ww-float1{0%,100%{transform:translateY(0px) rotate(0deg)}40%{transform:translateY(-18px) rotate(12deg)}80%{transform:translateY(10px) rotate(-8deg)}}
    @keyframes ww-float2{0%,100%{transform:translateY(0px) rotate(-5deg)}50%{transform:translateY(-25px) rotate(10deg)}}
    @keyframes ww-orb1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,30px) scale(1.1)}}
    @keyframes ww-orb2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-40px) scale(1.05)}}
    @keyframes ww-orb3{0%,100%{transform:translate(0,0)}60%{transform:translate(20px,-20px)}}
    @keyframes ww-burst{0%{transform:scale(1);opacity:1}100%{transform:scale(3);opacity:0}}
    @keyframes ww-coinsfly{0%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(-80px);opacity:0}}
    @keyframes ww-badgein{from{transform:translateX(-50%) translateY(60px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
    @keyframes ww-ring{0%{transform:scale(.88);opacity:1}100%{transform:scale(1.6);opacity:0}}
    @keyframes ww-glow{0%,100%{box-shadow:0 0 20px rgba(74,222,128,.15)}50%{box-shadow:0 0 50px rgba(74,222,128,.4)}}
    @keyframes ww-scan{0%{top:0}50%{top:calc(100% - 2px)}100%{top:0}}
    @keyframes ww-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes ww-growbar{from{width:0}to{width:var(--w)}}
    .ww-btn-green{transition:all .25s ease!important}
    .ww-btn-green:hover{transform:translateY(-2px)!important;box-shadow:0 12px 40px rgba(74,222,128,.4)!important}
    .ww-btn-green:active{transform:translateY(0)!important}
    .ww-upload:hover{border-color:#4ade80!important;background:rgba(74,222,128,.06)!important;transform:scale(1.005)}
    .ww-card-hover{transition:all .25s ease!important}
    .ww-card-hover:hover{transform:translateY(-3px)!important;box-shadow:0 16px 48px rgba(0,0,0,.3)!important}
    input{transition:border-color .2s,box-shadow .2s!important}
    input:focus{outline:none!important}
    input::placeholder{opacity:.5}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(74,222,128,.2);border-radius:4px}
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function AuthPage({onLogin, isDark, toggleDark}) {
  const t = isDark ? T.dark : T.light;
  const [mode,setMode]=useState("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    await new Promise(r=>setTimeout(r,700));
    if(!email||!pass){setErr("Please fill all fields.");setLoading(false);return;}
    const u=email.toLowerCase().trim();
    if(mode==="signup"){
      if(!name.trim()){setErr("Enter your name.");setLoading(false);return;}
      if(pass.length<6){setErr("Password must be 6+ characters.");setLoading(false);return;}
      if(ls.get(`ww_user_${u}`,null)){setErr("Account already exists. Please sign in.");setLoading(false);return;}
      ls.set(`ww_user_${u}`,{name:name.trim(),email:u,joined:new Date().toISOString()});
      seedDemo(u);
      onLogin({name:name.trim(),email:u});
    } else {
      const user=ls.get(`ww_user_${u}`,null);
      if(!user){setErr("Account not found. Create one first.");setLoading(false);return;}
      onLogin(user);
    }
    setLoading(false);
  };

  const leaves = [[{top:"8%",left:"3%"},0],[{top:"15%",right:"5%"},1],[{bottom:"20%",left:"6%"},2],[{bottom:"12%",right:"8%"},0],[{top:"45%",left:"1%"},1],[{top:"55%",right:"2%"},2]];

  return (
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative",overflow:"hidden",transition:"background .4s"}}>
      <GlobalStyles/>
      <BackgroundOrbs isDark={isDark}/>
      {leaves.map(([s,a],i)=><FloatingLeaf key={i} style={{...s,animation:`ww-float${a} ${8+i*2}s ease-in-out infinite`,animationDelay:`${i*.8}s`}} isDark={isDark}/>)}

      {/* Dark mode toggle */}
      <button onClick={toggleDark} style={{position:"absolute",top:20,right:20,zIndex:10,width:44,height:24,borderRadius:12,background:isDark?"rgba(74,222,128,.2)":"rgba(22,163,74,.15)",border:`1px solid ${t.borderGreen}`,cursor:"pointer",display:"flex",alignItems:"center",padding:"2px",transition:"all .3s"}}>
        <div style={{width:18,height:18,borderRadius:"50%",background:isDark?"#4ade80":"#16a34a",transform:isDark?"translateX(20px)":"translateX(0)",transition:"transform .3s",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>{isDark?"🌙":"☀️"}</div>
      </button>

      <div style={{width:"100%",maxWidth:420,zIndex:1,animation:"ww-slideup .6s ease"}}>
        {/* Hero */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:16}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${isDark?"#052e16":"#dcfce7"},${isDark?"#0d4a1a":"#bbf7d0"})`,border:`2px solid ${t.borderGreen}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto",boxShadow:`0 0 60px rgba(74,222,128,${isDark?.25:.3})`,animation:"ww-pulse 3s ease-in-out infinite"}}>♻️</div>
            <div style={{position:"absolute",inset:-8,borderRadius:"50%",border:`1.5px solid ${t.borderGreen}`,animation:"ww-ring 2.5s infinite"}}/>
            <div style={{position:"absolute",inset:-16,borderRadius:"50%",border:`1px solid ${t.borderGreen}`,animation:"ww-ring 2.5s infinite",animationDelay:".5s"}}/>
          </div>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:"3rem",fontWeight:900,margin:"0 0 6px",color:t.green,letterSpacing:"-1.5px",lineHeight:1}}>WasteWise</h1>
          <p style={{color:t.textMid,fontSize:13,letterSpacing:2.5,textTransform:"uppercase",fontFamily:"'Outfit',sans-serif",fontWeight:500}}>Every scan saves the planet 🌍</p>
        </div>

        {/* Card */}
        <Card t={t} style={{padding:"28px",borderRadius:28}} glow>
          {/* Toggle */}
          <div style={{display:"flex",background:isDark?"rgba(0,0,0,.4)":"rgba(0,0,0,.05)",borderRadius:14,padding:4,marginBottom:24,gap:4}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"11px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,transition:"all .25s",background:mode===m?`linear-gradient(135deg,${t.greenDeep},${t.green})`:"transparent",color:mode===m?isDark?"#030a03":"#fff":t.textMid,boxShadow:mode===m?`0 4px 16px rgba(74,222,128,.3)`:"none"}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {mode==="signup"&&(
              <div>
                <label style={{fontSize:11,color:t.textMid,letterSpacing:1.5,display:"block",marginBottom:7,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>YOUR NAME</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Aarav Sharma" onKeyDown={e=>e.key==="Enter"&&submit()}
                  style={{width:"100%",padding:"13px 16px",background:isDark?"rgba(0,0,0,.5)":"rgba(255,255,255,.9)",border:`1.5px solid ${t.border}`,borderRadius:12,color:t.text,fontSize:14,fontFamily:"'Outfit',sans-serif"}}/>
              </div>
            )}
            <div>
              <label style={{fontSize:11,color:t.textMid,letterSpacing:1.5,display:"block",marginBottom:7,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>EMAIL</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" onKeyDown={e=>e.key==="Enter"&&submit()}
                style={{width:"100%",padding:"13px 16px",background:isDark?"rgba(0,0,0,.5)":"rgba(255,255,255,.9)",border:`1.5px solid ${t.border}`,borderRadius:12,color:t.text,fontSize:14,fontFamily:"'Outfit',sans-serif"}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:t.textMid,letterSpacing:1.5,display:"block",marginBottom:7,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>PASSWORD</label>
              <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==="Enter"&&submit()}
                style={{width:"100%",padding:"13px 16px",background:isDark?"rgba(0,0,0,.5)":"rgba(255,255,255,.9)",border:`1.5px solid ${t.border}`,borderRadius:12,color:t.text,fontSize:14,fontFamily:"'Outfit',sans-serif"}}/>
            </div>

            {err&&<div style={{padding:"11px 14px",background:isDark?"rgba(248,113,113,.1)":"rgba(220,38,38,.08)",border:"1px solid rgba(248,113,113,.3)",borderRadius:10,color:t.red,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>⚠️ {err}</div>}

            <button className="ww-btn-green" onClick={submit} disabled={loading}
              style={{padding:"15px",background:loading?t.bgCard:`linear-gradient(135deg,${t.greenDeep},${t.green})`,border:`1px solid ${t.borderGreen}`,borderRadius:14,cursor:loading?"not-allowed":"pointer",color:loading?t.textMid:isDark?"#030a03":"#fff",fontSize:15,fontWeight:700,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
              {loading?<><Spinner color={t.green}/>Processing...</>:mode==="login"?"🌱 Welcome Back":"🚀 Join the Movement"}
            </button>
          </div>
        </Card>

        {/* Nature quote */}
        <p style={{textAlign:"center",color:t.textDim,fontSize:12,marginTop:20,fontFamily:"'Fraunces',serif",fontStyle:"italic",lineHeight:1.6}}>"The Earth does not belong to us. We belong to the Earth."</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCANNER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function ScannerPage({user, onScanComplete, t, isDark}) {
  const [image,setImage]=useState(null);
  const [imgB64,setImgB64]=useState(null);
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [dragOver,setDragOver]=useState(false);
  const [impact,setImpact]=useState(null);
  const [impactLoading,setImpactLoading]=useState(false);
  const [centers,setCenters]=useState(null);
  const [centersLoading,setCentersLoading]=useState(false);
  const [centersError,setCentersError]=useState(null);
  const [userCity,setUserCity]=useState(null);
  const [inputMode,setInputMode]=useState("upload");
  const [cameraError,setCameraError]=useState(null);
  const [facingMode,setFacingMode]=useState("environment");
  const [newPts,setNewPts]=useState(null);
  const [showBurst,setShowBurst]=useState(false);

  const fileRef=useRef(), videoRef=useRef(), streamRef=useRef(null);

  const startCamera = async (facing=facingMode) => {
    setCameraError(null);
    if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1280},height:{ideal:720}}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}
    } catch { setCameraError("Camera access denied. Please allow camera permission and try again."); }
  };

  const stopCamera=()=>{if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}};
  const flipCamera=()=>{const n=facingMode==="environment"?"user":"environment";setFacingMode(n);startCamera(n);};
  const capturePhoto=()=>{
    if(!videoRef.current) return;
    const v=videoRef.current,c=document.createElement("canvas");
    c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);
    const d=c.toDataURL("image/jpeg",.92);
    setImage(d);setImgB64(d.split(",")[1]);
    setResult(null);setImpact(null);setError(null);setCenters(null);
    stopCamera();setInputMode("upload");
  };
  const switchMode=(mode)=>{
    if(mode==="camera"){setInputMode("camera");setImage(null);setImgB64(null);setResult(null);setImpact(null);setCenters(null);setTimeout(()=>startCamera(),120);}
    else{stopCamera();setInputMode("upload");}
  };
  const processFile=useCallback((file)=>{
    if(!file||!file.type.startsWith("image/")) return;
    const r=new FileReader();
    r.onload=(e)=>{setImage(e.target.result);setImgB64(e.target.result.split(",")[1]);setResult(null);setImpact(null);setError(null);setCenters(null);};
    r.readAsDataURL(file);
  },[]);

  // ── Central AI caller — hits our Netlify function which holds the API key ──
  const callAI = async (body) => {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  };

  const analyzeWaste=async()=>{
    if(!imgB64) return;
    setLoading(true);setError(null);setResult(null);setImpact(null);setCenters(null);
    try {
      const data = await callAI({
        type: "analyze",
        imageB64: imgB64,
      });
      setResult(data);
      fetchImpact(data.itemName, data.category, data);
    } catch { setError("Could not analyze. Try a clearer photo."); }
    finally { setLoading(false); }
  };

  const fetchImpact=async(itemName,category,scanResult)=>{
    setImpactLoading(true);
    try {
      const data = await callAI({ type: "impact", itemName, category });
      setImpact(data);
      const pts=CATS[scanResult.category]?.points||10;
      setNewPts(pts);setShowBurst(true);
      setTimeout(()=>{setShowBurst(false);setNewPts(null);},2500);
      onScanComplete({itemName:scanResult.itemName,category:scanResult.category,carbonPercent:data.carbonPercent||0,points:pts,date:new Date().toISOString()});
    } catch {}
    finally { setImpactLoading(false); }
  };

  const findCenters=async(category,itemName)=>{
    setCentersLoading(true);setCentersError(null);setCenters(null);
    let city="India";
    try {
      const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000}));
      const geo=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
      const d=await geo.json();
      city=d.address?.city||d.address?.town||d.address?.state||"India";setUserCity(city);
    } catch { setUserCity(null); }
    try {
      const data = await callAI({ type: "centers", category, itemName, city });
      if (!Array.isArray(data)) throw new Error();
      setCenters(data);
    } catch { setCentersError("Couldn't find centers. Try Google Maps for recycling centers near you."); }
    finally { setCentersLoading(false); }
  };

  const reset=()=>{stopCamera();setInputMode("upload");setImage(null);setImgB64(null);setResult(null);setImpact(null);setError(null);setCenters(null);setCentersError(null);setUserCity(null);};
  const cat=result?CATS[result.category]:null;
  const catColor = cat ? (isDark ? cat.color : cat.darkColor) : t.green;

  return (
    <div style={{paddingBottom:20}}>
      {/* Coin burst */}
      {showBurst&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999}}>{[...Array(12)].map((_,i)=><div key={i} style={{position:"absolute",left:`${36+Math.random()*28}%`,top:`${25+Math.random()*30}%`,width:14,height:14,borderRadius:"50%",background:["#fbbf24","#4ade80","#60a5fa","#c084fc"][i%4],animation:"ww-burst 1s ease-out forwards",animationDelay:`${i*.07}s`}}/>)}</div>}
      {newPts&&<div style={{position:"fixed",top:"34%",left:"50%",zIndex:1000,animation:"ww-coinsfly 2.2s ease-out forwards",pointerEvents:"none"}}><div style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)",borderRadius:40,padding:"10px 24px",fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,color:"#1a0a00",boxShadow:"0 8px 32px rgba(251,191,36,.6)",whiteSpace:"nowrap"}}>+{newPts} 🪙 EcoCoins!</div></div>}

      {/* Mode selector */}
      <div style={{display:"flex",gap:6,marginBottom:12,background:isDark?"rgba(0,0,0,.4)":"rgba(0,0,0,.06)",borderRadius:14,padding:4}}>
        {[{id:"upload",icon:"📁",label:"Upload Photo"},{id:"camera",icon:"📷",label:"Live Camera"}].map(m=>(
          <button key={m.id} onClick={()=>switchMode(m.id)} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:600,transition:"all .2s",background:inputMode===m.id?`linear-gradient(135deg,${t.greenDeep}40,${t.green}30)`:"transparent",color:inputMode===m.id?t.green:t.textMid,boxShadow:inputMode===m.id?`inset 0 0 0 1px ${t.borderGreen}`:"none"}}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Camera */}
      {inputMode==="camera"&&(
        <div style={{borderRadius:22,overflow:"hidden",border:`1.5px solid ${t.borderGreen}`,position:"relative",background:"#000",minHeight:270}}>
          {cameraError?(
            <div style={{padding:"44px 20px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>📷</div><p style={{color:t.red,fontSize:13,marginBottom:14}}>{cameraError}</p><button onClick={()=>startCamera()} style={{padding:"9px 18px",background:isDark?"rgba(74,222,128,.15)":"rgba(22,163,74,.1)",border:`1px solid ${t.borderGreen}`,borderRadius:10,color:t.green,fontSize:13,cursor:"pointer"}}>Try Again</button></div>
          ):(
            <>
              <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",maxHeight:330,objectFit:"cover",display:"block"}}/>
              {/* Scanner overlay */}
              <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-54%)",width:200,height:200}}>
                  {[[{top:-1,left:-1},{borderTop:`2px solid ${t.green}`,borderLeft:`2px solid ${t.green}`,borderRadius:"6px 0 0 0"}],[{top:-1,right:-1},{borderTop:`2px solid ${t.green}`,borderRight:`2px solid ${t.green}`,borderRadius:"0 6px 0 0"}],[{bottom:-1,left:-1},{borderBottom:`2px solid ${t.green}`,borderLeft:`2px solid ${t.green}`,borderRadius:"0 0 0 6px"}],[{bottom:-1,right:-1},{borderBottom:`2px solid ${t.green}`,borderRight:`2px solid ${t.green}`,borderRadius:"0 0 6px 0"}]].map(([pos,style],i)=>(
                    <div key={i} style={{position:"absolute",...pos,width:28,height:28,...style}}/>
                  ))}
                  {/* Scanning line */}
                  <div style={{position:"absolute",left:4,right:4,height:2,background:`linear-gradient(90deg,transparent,${t.green},transparent)`,animation:"ww-scan 2s linear infinite",boxShadow:`0 0 8px ${t.green}`}}/>
                </div>
                <div style={{position:"absolute",bottom:"26%",left:"50%",transform:"translateX(-50%)",fontSize:11,color:t.green,letterSpacing:2,fontFamily:"'Outfit',sans-serif",fontWeight:600,whiteSpace:"nowrap",textShadow:"0 2px 8px rgba(0,0,0,.8)"}}>POINT AT WASTE ITEM</div>
              </div>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px",background:"linear-gradient(to top,rgba(3,10,3,.95),transparent)",display:"flex",alignItems:"center",justifyContent:"center",gap:18}}>
                <button onClick={flipCamera} title="Flip" style={{width:46,height:46,borderRadius:"50%",background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>🔄</button>
                <button onClick={capturePhoto} style={{width:70,height:70,borderRadius:"50%",background:`linear-gradient(135deg,${t.greenDeep},${t.green})`,border:"3px solid rgba(255,255,255,.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 6px 28px rgba(74,222,128,.5)`}}>📸</button>
                <button onClick={()=>switchMode("upload")} style={{width:46,height:46,borderRadius:"50%",background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>✕</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upload */}
      {inputMode==="upload"&&(
        <div className="ww-upload" onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);processFile(e.dataTransfer.files[0])}} onClick={()=>fileRef.current.click()}
          style={{border:`2px dashed ${dragOver?t.green:t.borderGreen}`,borderRadius:22,padding:image?0:"48px 24px",cursor:"pointer",transition:"all .3s",background:dragOver?t.leaf1:isDark?"rgba(255,255,255,.015)":"rgba(255,255,255,.6)",overflow:"hidden"}}>
          {image?(
            <div style={{position:"relative"}}><img src={image} alt="waste" style={{width:"100%",maxHeight:260,objectFit:"cover",borderRadius:20,display:"block"}}/><div style={{position:"absolute",inset:0,borderRadius:20,background:"linear-gradient(to top,rgba(3,10,3,.75),transparent 55%)",display:"flex",alignItems:"flex-end",padding:16}}><span style={{fontSize:12,color:"#86efac",fontFamily:"'Outfit',sans-serif",fontWeight:600,letterSpacing:.5}}>📸 Tap to change photo</span></div></div>
          ):(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:44,marginBottom:12,filter:"drop-shadow(0 4px 12px rgba(74,222,128,.3))"}}>🌿</div>
              <p style={{color:t.green,fontWeight:700,margin:"0 0 6px",fontSize:16,fontFamily:"'Outfit',sans-serif"}}>Drop a photo of your waste</p>
              <p style={{color:t.textDim,fontSize:13,margin:0,fontFamily:"'Outfit',sans-serif"}}>or tap to upload · earn EcoCoins 🪙</p>
            </div>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>processFile(e.target.files[0])}/>

      {image&&inputMode==="upload"&&(
        <button className="ww-btn-green" onClick={analyzeWaste} disabled={loading}
          style={{width:"100%",marginTop:12,padding:"16px",background:loading?t.bgCard:`linear-gradient(135deg,${t.greenDeep},${t.green})`,border:`1px solid ${t.borderGreen}`,borderRadius:16,cursor:loading?"not-allowed":"pointer",color:loading?t.textMid:isDark?"#030a03":"#fff",fontSize:15,fontWeight:700,fontFamily:"'Outfit',sans-serif",letterSpacing:.3,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:loading?"none":`0 6px 24px rgba(74,222,128,.3)`}}>
          {loading?<><Spinner color={t.green}/>Analyzing with AI...</>:"🔍 Identify & Classify Waste"}
        </button>
      )}

      {error&&<div style={{marginTop:12,padding:"13px 16px",background:isDark?"rgba(248,113,113,.08)":"rgba(220,38,38,.06)",border:"1px solid rgba(248,113,113,.3)",borderRadius:14,color:t.red,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>⚠️ {error}</div>}

      {/* ── RESULT ── */}
      {result&&cat&&(
        <div style={{marginTop:18,animation:"ww-slideup .5s ease"}}>
          {/* Category hero */}
          <div style={{background:`linear-gradient(135deg,${isDark?cat.bg:"#f0fdf4"},${isDark?"rgba(5,13,5,.98)":"#dcfce7"})`,border:`1.5px solid ${catColor}30`,borderRadius:24,padding:"20px",boxShadow:`0 12px 40px ${catColor}20`,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <div style={{fontSize:10,color:t.textDim,letterSpacing:2.5,textTransform:"uppercase",marginBottom:4,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>Identified As</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:900,color:t.text,lineHeight:1.1}}>{result.itemName}</div>
              </div>
              <div style={{padding:"8px 14px",borderRadius:40,background:`${catColor}20`,border:`1.5px solid ${catColor}50`,color:catColor,fontWeight:700,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>
                {cat.emoji} {cat.label}
              </div>
            </div>
            {/* Confidence */}
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:t.textDim,marginBottom:6,fontFamily:"'Outfit',sans-serif",fontWeight:600,letterSpacing:1}}><span>AI CONFIDENCE</span><span style={{color:catColor}}>{result.confidence}%</span></div>
              <div style={{height:6,background:isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.08)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${result.confidence}%`,background:`linear-gradient(90deg,${catColor}80,${catColor})`,borderRadius:3,transition:"width 1.2s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 8px ${catColor}60`}}/>
              </div>
            </div>
            {/* Bin */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",background:isDark?"rgba(0,0,0,.3)":"rgba(255,255,255,.6)",borderRadius:14,border:`1px solid ${catColor}20`,backdropFilter:"blur(8px)"}}>
              <span style={{fontSize:24}}>🗑️</span>
              <div><div style={{fontSize:10,color:t.textDim,letterSpacing:1.5,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>THROW IN</div><div style={{color:catColor,fontWeight:700,fontSize:15,fontFamily:"'Outfit',sans-serif"}}>{cat.bin}</div></div>
              {result.recyclable&&<div style={{marginLeft:"auto",background:`${t.green}20`,border:`1px solid ${t.green}40`,borderRadius:30,padding:"4px 12px",fontSize:11,color:t.green,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>♻️ RECYCLABLE</div>}
            </div>
          </div>

          {/* Impact panel */}
          <Card t={t} style={{padding:"20px",borderRadius:24,marginBottom:12,border:`1.5px solid ${t.borderGreen}`}}>
            <div style={{fontSize:11,color:t.green,letterSpacing:2,marginBottom:14,fontWeight:700,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:8}}>
              🌍 IF YOU RECYCLE THIS...
            </div>
            {impactLoading&&<div style={{display:"flex",alignItems:"center",gap:10,color:t.textMid,fontSize:13,fontFamily:"'Outfit',sans-serif"}}><Spinner color={t.green} size={14}/>Calculating your planet impact...</div>}
            {impact&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {/* Carbon hero */}
                <div style={{background:`linear-gradient(135deg,${t.green}15,${t.green}08)`,border:`1.5px solid ${t.green}30`,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:38,filter:"drop-shadow(0 4px 8px rgba(74,222,128,.4))"}}>🌱</span>
                  <div>
                    <div style={{fontSize:10,color:t.textDim,letterSpacing:2,marginBottom:4,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>CARBON FOOTPRINT REDUCED BY</div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:t.green,lineHeight:1}}>{impact.carbonPercent}%</div>
                    <div style={{fontSize:12,color:t.textMid,marginTop:3,fontFamily:"'Outfit',sans-serif"}}>{impact.carbonSaved}</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[
                    {icon:"⚡",label:"ENERGY SAVED",val:impact.energySaved,color:t.blue},
                    {icon:"🔄",label:"RECYCLED INTO",val:impact.recycledInto,color:t.yellow},
                    ...(impact.waterSaved?[{icon:"💧",label:"WATER SAVED",val:impact.waterSaved,color:"#22d3ee"}]:[]),
                    ...(impact.treesEquivalent?[{icon:"🌳",label:"TREES EQUIV.",val:impact.treesEquivalent,color:t.green}]:[]),
                  ].map((s,i)=>(
                    <div key={i} style={{background:isDark?"rgba(255,255,255,.03)":"rgba(255,255,255,.7)",border:`1px solid ${s.color}25`,borderRadius:14,padding:"13px",backdropFilter:"blur(8px)"}}>
                      <div style={{fontSize:20,marginBottom:5}}>{s.icon}</div>
                      <div style={{fontSize:9,color:t.textDim,letterSpacing:1.5,marginBottom:4,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>{s.label}</div>
                      <div style={{fontSize:12,color:s.color,fontWeight:700,lineHeight:1.4,fontFamily:"'Outfit',sans-serif"}}>{s.val}</div>
                    </div>
                  ))}
                </div>
                {/* Wildlife */}
                <div style={{background:`linear-gradient(135deg,${isDark?"rgba(5,30,10,.95)":"rgba(240,253,244,.95)"},${isDark?"rgba(5,20,8,.95)":"rgba(220,252,231,.95)"})`,border:`1.5px solid ${t.green}30`,borderRadius:16,padding:"16px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-8,right:-8,fontSize:64,opacity:.07}}>🐾</div>
                  <div style={{fontSize:10,color:t.green,letterSpacing:2,marginBottom:8,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>🐾 WILDLIFE IMPACT</div>
                  <p style={{color:isDark?"#c8e6c8":"#166534",fontSize:14,margin:0,lineHeight:1.8,fontFamily:"'Fraunces',serif",fontStyle:"italic"}}>"{impact.wildlifeFact}"</p>
                </div>
                <div style={{background:isDark?"rgba(192,132,252,.06)":"rgba(124,58,237,.05)",border:`1px solid ${t.purple}20`,borderRadius:14,padding:"13px"}}>
                  <div style={{fontSize:10,color:t.purple,letterSpacing:2,marginBottom:5,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>✨ FUN FACT</div>
                  <p style={{color:isDark?"#e9d5ff":"#5b21b6",fontSize:13,margin:0,lineHeight:1.65,fontFamily:"'Outfit',sans-serif"}}>{impact.funFact}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Disposal + Tip */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <Card t={t} style={{padding:"14px",borderRadius:16}}>
              <div style={{fontSize:10,color:t.green,letterSpacing:2,marginBottom:6,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>📋 HOW TO DISPOSE</div>
              <p style={{color:t.textMid,fontSize:12,margin:0,lineHeight:1.65,fontFamily:"'Outfit',sans-serif"}}>{result.disposal}</p>
            </Card>
            <Card t={t} style={{padding:"14px",borderRadius:16}}>
              <div style={{fontSize:10,color:t.blue,letterSpacing:2,marginBottom:6,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>💡 ECO TIP</div>
              <p style={{color:t.textMid,fontSize:12,margin:0,lineHeight:1.65,fontFamily:"'Outfit',sans-serif"}}>{result.tip}</p>
            </Card>
          </div>

          {/* India stat */}
          <Card t={t} style={{padding:"14px 16px",borderRadius:16,marginBottom:10,border:`1px solid ${t.red}18`}}>
            <div style={{fontSize:10,color:t.red,letterSpacing:2,marginBottom:6,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>🇮🇳 INDIA IMPACT STAT</div>
            <p style={{color:t.textMid,fontSize:12,margin:0,lineHeight:1.65,fontFamily:"'Outfit',sans-serif"}}>{result.impactStat}</p>
          </Card>

          {/* Centers */}
          <div style={{marginBottom:12}}>
            {!centers&&!centersLoading&&(
              <button className="ww-btn-green" onClick={()=>findCenters(result.category,result.itemName)}
                style={{width:"100%",padding:"14px",background:isDark?"rgba(96,165,250,.12)":"rgba(37,99,235,.08)",border:`1px solid ${t.blue}40`,borderRadius:16,cursor:"pointer",color:t.blue,fontSize:14,fontWeight:700,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                📍 Find Nearest Recycling Centers
              </button>
            )}
            {centersLoading&&<Card t={t} style={{padding:"18px",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><Spinner color={t.blue} size={14}/><span style={{color:t.blue,fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>{userCity?`Searching in ${userCity}...`:"Detecting your location..."}</span></Card>}
            {centersError&&<Card t={t} style={{padding:"13px 15px",borderRadius:14,border:`1px solid ${t.red}25`}}><p style={{color:t.red,fontSize:13,margin:0,fontFamily:"'Outfit',sans-serif"}}>⚠️ {centersError}</p></Card>}
            {centers&&(
              <div style={{animation:"ww-slideup .4s ease"}}>
                <div style={{fontSize:10,color:t.blue,letterSpacing:2,marginBottom:10,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>📍 CENTERS{userCity?` IN ${userCity.toUpperCase()}`:""}</div>
                {centers.map((c,i)=>(
                  <Card key={i} className="ww-card-hover" t={t} style={{padding:"15px",borderRadius:16,marginBottom:9,border:`1px solid ${t.blue}18`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:t.text,flex:1,paddingRight:8}}>{c.name}</div>
                      <span style={{fontSize:11,color:t.blue,fontWeight:700,background:isDark?"rgba(96,165,250,.15)":"rgba(37,99,235,.1)",padding:"3px 9px",borderRadius:20,fontFamily:"'Outfit',sans-serif",flexShrink:0}}>#{i+1}</span>
                    </div>
                    <div style={{fontSize:12,color:t.green,fontWeight:600,marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>♻️ {c.type}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:c.tip?8:10}}>
                      <span style={{fontSize:11,color:t.textMid,fontFamily:"'Outfit',sans-serif"}}>📌 {c.address}</span>
                      <span style={{fontSize:11,color:t.blue,fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>🚶 {c.distance}</span>
                    </div>
                    {c.tip&&<div style={{fontSize:11,color:t.textMid,fontStyle:"italic",marginBottom:10,padding:"7px 10px",background:t.leaf2,borderRadius:8,fontFamily:"'Outfit',sans-serif"}}>💡 {c.tip}</div>}
                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(c.mapsQuery||c.name)}`} target="_blank" rel="noopener noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 13px",background:isDark?"rgba(96,165,250,.12)":"rgba(37,99,235,.1)",border:`1px solid ${t.blue}30`,borderRadius:10,color:t.blue,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:"'Outfit',sans-serif"}}>
                      🗺️ Open in Maps →
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <button onClick={reset} style={{width:"100%",padding:"13px",background:"transparent",border:`1.5px solid ${t.borderGreen}`,borderRadius:14,cursor:"pointer",color:t.green,fontSize:14,fontWeight:600,fontFamily:"'Outfit',sans-serif",transition:"all .2s"}}>
            🔄 Scan Another Item
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage({user, t, isDark}) {
  const [dash,setDash]=useState("overview");
  const history=ls.get(`ww_history_${user.email}`,[]);
  const totalPts=ls.get(`ww_pts_${user.email}`,0);
  const scanCount=ls.get(`ww_scans_${user.email}`,0);
  const earnedBadges=ls.get(`ww_badges_${user.email}`,[]);
  const level=Math.floor(totalPts/50)+1;
  const lvlProg=(totalPts%50)/50*100;

  const catBreakdown=useMemo(()=>{const c={};history.forEach(h=>{c[h.category]=(c[h.category]||0)+1;});return Object.entries(c).map(([k,v])=>({name:CATS[k]?.label||k,value:v,color:isDark?CATS[k]?.color:CATS[k]?.darkColor||"#4ade80"}));},[history,isDark]);
  const carbonByDay=useMemo(()=>{const m={};history.forEach(h=>{const d=new Date(h.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"});m[d]=(m[d]||0)+(h.carbonPercent||0);});return Object.entries(m).slice(-10).map(([d,v])=>({date:d,carbon:v}));},[history]);
  const ptsByCategory=useMemo(()=>{const m={};history.forEach(h=>{m[h.category]=(m[h.category]||0)+(h.points||0);});return Object.entries(m).map(([k,v])=>({name:CATS[k]?.label||k,points:v,fill:isDark?CATS[k]?.color:CATS[k]?.darkColor||"#4ade80"}));},[history,isDark]);
  const totalCarbon=history.reduce((s,h)=>s+(h.carbonPercent||0),0);
  const avgCarbon=history.length?Math.round(totalCarbon/history.length):0;

  const now=new Date();
  const [calMonth,setCalMonth]=useState(now.getMonth());
  const [calYear,setCalYear]=useState(now.getFullYear());
  const [selectedDay,setSelectedDay]=useState(null);
  const calDays=useMemo(()=>({first:new Date(calYear,calMonth,1).getDay(),total:new Date(calYear,calMonth+1,0).getDate()}),[calMonth,calYear]);
  const historyByDate=useMemo(()=>{const m={};history.forEach(h=>{const d=new Date(h.date);if(d.getMonth()===calMonth&&d.getFullYear()===calYear){const k=d.getDate();if(!m[k])m[k]=[];m[k].push(h);}});return m;},[history,calMonth,calYear]);
  const selectedItems=selectedDay?(historyByDate[selectedDay]||[]):[];

  const TABS=[{id:"overview",icon:"🌿",label:"Overview"},{id:"calendar",icon:"📅",label:"Calendar"},{id:"charts",icon:"📈",label:"Charts"},{id:"badges",icon:"🏅",label:"Badges"}];

  return (
    <div style={{paddingBottom:20}}>
      {/* Sub-nav */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:18,background:isDark?"rgba(0,0,0,.4)":"rgba(0,0,0,.06)",borderRadius:16,padding:4}}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setDash(tab.id)} style={{padding:"10px 4px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:700,transition:"all .2s",background:dash===tab.id?`linear-gradient(135deg,${t.greenDeep}50,${t.green}30)`:"transparent",color:dash===tab.id?t.green:t.textMid,boxShadow:dash===tab.id?`inset 0 0 0 1px ${t.borderGreen}`:"none"}}>
            <div style={{fontSize:16,marginBottom:2}}>{tab.icon}</div>
            <div>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {dash==="overview"&&(
        <div style={{animation:"ww-slideup .35s ease"}}>
          {/* Level banner */}
          <div style={{background:`linear-gradient(135deg,${isDark?"#052e16":"#dcfce7"},${isDark?"#0a2a0a":"#bbf7d0"})`,border:`1.5px solid ${t.borderGreen}`,borderRadius:24,padding:"22px",marginBottom:12,boxShadow:`0 12px 40px ${t.green}18`,animation:"ww-glow 4s infinite",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,fontSize:120,opacity:.06}}>🌍</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,position:"relative"}}>
              <div>
                <div style={{fontSize:10,color:t.textDim,letterSpacing:2.5,marginBottom:4,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>ECO LEVEL</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:t.green,lineHeight:1}}>Level {level}</div>
                <div style={{fontSize:13,color:t.textMid,marginTop:3,fontFamily:"'Outfit',sans-serif"}}>{user.name} · {scanCount} items scanned</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,color:isDark?"#fbbf24":"#d97706",letterSpacing:2,marginBottom:4,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>ECOCOINS</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:isDark?"#fbbf24":"#d97706"}}>🪙 {totalPts}</div>
              </div>
            </div>
            <div style={{fontSize:10,color:t.textDim,display:"flex",justifyContent:"space-between",marginBottom:6,fontFamily:"'Outfit',sans-serif",fontWeight:600}}><span>NEXT LEVEL IN {50-(totalPts%50)} COINS</span><span style={{color:t.green}}>{Math.round(lvlProg)}%</span></div>
            <div style={{height:8,background:isDark?"rgba(0,0,0,.3)":"rgba(0,0,0,.1)",borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${lvlProg}%`,background:`linear-gradient(90deg,${t.greenDeep},${t.green})`,borderRadius:4,boxShadow:`0 0 12px ${t.green}80`,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[
              {icon:"♻️",label:"Total Scans",value:scanCount,color:t.green},
              {icon:"🌱",label:"Avg CO₂ Saved",value:`${avgCarbon}%`,color:t.green},
              {icon:"🏅",label:"Badges",value:`${earnedBadges.length}/${BADGES.length}`,color:t.purple},
              {icon:"📅",label:"Active Days",value:new Set(history.map(h=>new Date(h.date).toDateString())).size,color:t.blue},
            ].map((s,i)=>(
              <Card key={i} className="ww-card-hover" t={t} style={{padding:"16px",borderRadius:18}}>
                <div style={{fontSize:26,marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:9,color:t.textDim,letterSpacing:2,marginBottom:4,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>{s.label.toUpperCase()}</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:900,color:s.color}}>{s.value}</div>
              </Card>
            ))}
          </div>

          {/* Recent */}
          <div style={{fontSize:10,color:t.textDim,letterSpacing:2,marginBottom:10,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>🕐 RECENT ACTIVITY</div>
          {history.length===0&&<Card t={t} style={{padding:"24px",borderRadius:18,textAlign:"center"}}><p style={{color:t.textDim,margin:0,fontSize:14,fontFamily:"'Outfit',sans-serif"}}>No scans yet. Start scanning to build your history! 🌱</p></Card>}
          {[...history].reverse().slice(0,5).map((h,i)=>{
            const c=CATS[h.category];
            const cc=isDark?c?.color:c?.darkColor||t.green;
            return (
              <Card key={i} className="ww-card-hover" t={t} style={{padding:"14px 16px",borderRadius:16,marginBottom:8,display:"flex",alignItems:"center",gap:12,border:`1px solid ${cc}18`}}>
                <div style={{width:42,height:42,borderRadius:12,background:`${cc}15`,border:`1px solid ${cc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c?.emoji||"♻️"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Outfit',sans-serif"}}>{h.itemName}</div>
                  <div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>{c?.label} · {new Date(h.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:isDark?"#fbbf24":"#d97706",fontFamily:"'Outfit',sans-serif"}}>+{h.points}🪙</div>
                  <div style={{fontSize:11,color:t.green,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>-{h.carbonPercent}% CO₂</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── CALENDAR ── */}
      {dash==="calendar"&&(
        <div style={{animation:"ww-slideup .35s ease"}}>
          <Card t={t} style={{padding:"18px",borderRadius:22,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <button onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);setSelectedDay(null);}} style={{width:36,height:36,borderRadius:10,border:`1px solid ${t.borderGreen}`,background:"transparent",color:t.green,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <div style={{fontFamily:"'Fraunces',serif",fontWeight:900,color:t.text,fontSize:18}}>{MONTHS[calMonth]} {calYear}</div>
              <button onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);setSelectedDay(null);}} style={{width:36,height:36,borderRadius:10,border:`1px solid ${t.borderGreen}`,background:"transparent",color:t.green,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:8}}>
              {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:t.textDim,letterSpacing:.5,padding:"3px 0",fontFamily:"'Outfit',sans-serif",fontWeight:700}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {[...Array(calDays.first)].map((_,i)=><div key={`e${i}`}/>)}
              {[...Array(calDays.total)].map((_,i)=>{
                const day=i+1;
                const items=historyByDate[day]||[];
                const hasScans=items.length>0;
                const isToday=now.getDate()===day&&now.getMonth()===calMonth&&now.getFullYear()===calYear;
                const isSel=selectedDay===day;
                return (
                  <div key={day} onClick={()=>setSelectedDay(isSel?null:day)}
                    style={{aspectRatio:"1",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:hasScans?"pointer":"default",background:isSel?`${t.green}25`:hasScans?t.leaf1:"transparent",border:isToday?`1.5px solid ${t.green}`:isSel?`1.5px solid ${t.green}`:hasScans?`1px solid ${t.borderGreen}`:"1px solid transparent",transition:"all .15s",position:"relative"}}>
                    <span style={{fontSize:12,fontWeight:isToday?800:400,color:isSel?t.green:isToday?t.green:hasScans?t.text:t.textDim,fontFamily:"'Outfit',sans-serif"}}>{day}</span>
                    {hasScans&&<div style={{display:"flex",gap:1,marginTop:2,justifyContent:"center"}}>
                      {items.slice(0,3).map((item,j)=><div key={j} style={{width:4,height:4,borderRadius:"50%",background:isDark?CATS[item.category]?.color:CATS[item.category]?.darkColor||t.green}}/>)}
                    </div>}
                  </div>
                );
              })}
            </div>
          </Card>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            {Object.entries(CATS).map(([k,v])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:isDark?v.color:v.darkColor}}/>{v.label}
              </div>
            ))}
          </div>
          {selectedDay&&(
            <div style={{animation:"ww-slideup .3s ease"}}>
              <div style={{fontSize:10,color:t.green,letterSpacing:2,marginBottom:10,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>📅 {selectedDay} {MONTHS[calMonth]} {calYear}</div>
              {selectedItems.length===0?<Card t={t} style={{padding:"16px",borderRadius:14,textAlign:"center"}}><p style={{color:t.textDim,margin:0,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>No scans on this day</p></Card>
              :selectedItems.map((h,i)=>{
                const c=CATS[h.category];const cc=isDark?c?.color:c?.darkColor||t.green;
                return <Card key={i} t={t} style={{padding:"13px 15px",borderRadius:14,marginBottom:8,display:"flex",alignItems:"center",gap:12,border:`1px solid ${cc}20`}}>
                  <div style={{width:38,height:38,borderRadius:10,background:`${cc}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c?.emoji}</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:t.text,fontFamily:"'Outfit',sans-serif"}}>{h.itemName}</div><div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>{c?.label} · {new Date(h.date).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:isDark?"#fbbf24":"#d97706",fontFamily:"'Outfit',sans-serif"}}>+{h.points}🪙</div><div style={{fontSize:11,color:t.green,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>-{h.carbonPercent}%</div></div>
                </Card>;
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CHARTS ── */}
      {dash==="charts"&&(
        <div style={{animation:"ww-slideup .35s ease"}}>
          {history.length===0&&<Card t={t} style={{padding:"32px",borderRadius:20,textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>🌱</div><p style={{color:t.textDim,margin:0,fontSize:14,fontFamily:"'Outfit',sans-serif"}}>Scan items to unlock your eco charts!</p></Card>}
          {history.length>0&&<>
            <Card t={t} style={{padding:"20px",borderRadius:22,marginBottom:12}}>
              <div style={{fontSize:11,color:t.green,letterSpacing:2,marginBottom:16,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>🥧 WASTE TYPE BREAKDOWN</div>
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <ResponsiveContainer width={170} height={170}>
                  <PieChart><Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {catBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie><Tooltip content={<ChartTip t={t}/>}/></PieChart>
                </ResponsiveContainer>
                <div style={{flex:1,minWidth:110,display:"flex",flexDirection:"column",gap:8}}>
                  {catBreakdown.map((e,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:e.color,flexShrink:0}}/>
                      <span style={{fontSize:12,color:t.textMid,flex:1,fontFamily:"'Outfit',sans-serif"}}>{e.name}</span>
                      <span style={{fontSize:14,fontWeight:800,color:e.color,fontFamily:"'Fraunces',serif"}}>{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card t={t} style={{padding:"20px",borderRadius:22,marginBottom:12}}>
              <div style={{fontSize:11,color:t.green,letterSpacing:2,marginBottom:16,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>📊 ECOCOINS BY CATEGORY</div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={ptsByCategory} margin={{top:0,right:0,bottom:0,left:-22}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.05)"}/>
                  <XAxis dataKey="name" tick={{fill:t.textDim,fontSize:10,fontFamily:"Outfit"}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fill:t.textDim,fontSize:10,fontFamily:"Outfit"}} tickLine={false} axisLine={false}/>
                  <Tooltip content={<ChartTip t={t}/>}/>
                  <Bar dataKey="points" name="EcoCoins" radius={[8,8,0,0]}>{ptsByCategory.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {carbonByDay.length>1&&(
              <Card t={t} style={{padding:"20px",borderRadius:22,marginBottom:12}}>
                <div style={{fontSize:11,color:t.green,letterSpacing:2,marginBottom:16,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>📈 CARBON IMPACT OVER TIME</div>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={carbonByDay} margin={{top:5,right:5,bottom:0,left:-22}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.05)"}/>
                    <XAxis dataKey="date" tick={{fill:t.textDim,fontSize:10,fontFamily:"Outfit"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:t.textDim,fontSize:10,fontFamily:"Outfit"}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<ChartTip t={t}/>}/>
                    <Line type="monotone" dataKey="carbon" name="Carbon %" stroke={t.green} strokeWidth={2.5} dot={{fill:t.green,strokeWidth:0,r:4}} activeDot={{r:7,fill:t.greenLight}}/>
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            <Card t={t} style={{padding:"20px",borderRadius:22}}>
              <div style={{fontSize:11,color:t.green,letterSpacing:2,marginBottom:14,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>🌍 TOTAL IMPACT SUMMARY</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {icon:"🌱",label:"Total CO₂ Saved",value:`${totalCarbon}%`,color:t.green},
                  {icon:"♻️",label:"Items Recycled",value:scanCount,color:t.blue},
                  {icon:"🪙",label:"EcoCoins Total",value:totalPts,color:isDark?"#fbbf24":"#d97706"},
                  {icon:"🌳",label:"Eco Level",value:`Level ${level}`,color:t.purple},
                ].map((s,i)=>(
                  <div key={i} style={{padding:"14px",background:isDark?`${s.color}08`:`${s.color}10`,border:`1px solid ${s.color}20`,borderRadius:14}}>
                    <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                    <div style={{fontSize:9,color:t.textDim,letterSpacing:1.5,marginBottom:4,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>{s.label.toUpperCase()}</div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>}
        </div>
      )}

      {/* ── BADGES ── */}
      {dash==="badges"&&(
        <div style={{animation:"ww-slideup .35s ease"}}>
          <div style={{fontSize:10,color:t.textDim,letterSpacing:2,marginBottom:12,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>🏅 BADGES — {earnedBadges.length}/{BADGES.length} UNLOCKED</div>
          {BADGES.map(badge=>{
            const unlocked=earnedBadges.includes(badge.id);
            return (
              <Card key={badge.id} className="ww-card-hover" t={t} style={{padding:"16px 18px",borderRadius:18,marginBottom:9,display:"flex",alignItems:"center",gap:14,border:`1px solid ${unlocked?"rgba(192,132,252,.3)":t.border}`,background:unlocked?isDark?"rgba(192,132,252,.06)":"rgba(124,58,237,.04)":t.bgCard,opacity:unlocked?1:.45}}>
                <div style={{fontSize:32,filter:unlocked?"none":"grayscale(1)",flexShrink:0}}>{badge.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:unlocked?t.text:t.textDim,fontFamily:"'Outfit',sans-serif",marginBottom:2}}>{badge.name}</div>
                  <div style={{fontSize:12,color:unlocked?t.purple:t.textDim,fontFamily:"'Outfit',sans-serif"}}>{badge.desc}</div>
                </div>
                <div style={{fontSize:20,flexShrink:0}}>{unlocked?"✅":"🔒"}</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Common scrap items with typical kabadiwala rates ────────────────────────
const SCRAP_ITEMS = [
  { id:"plastic_bottle", icon:"🧴", name:"Plastic Bottle",   unit:"bottle",  defaultRate:1.5,  cat:"dry",       color:"#60a5fa" },
  { id:"newspaper",      icon:"📰", name:"Newspaper",        unit:"kg",      defaultRate:14,   cat:"dry",       color:"#60a5fa" },
  { id:"cardboard",      icon:"📦", name:"Cardboard / Box",  unit:"kg",      defaultRate:8,    cat:"dry",       color:"#60a5fa" },
  { id:"glass_bottle",   icon:"🍾", name:"Glass Bottle",     unit:"bottle",  defaultRate:2,    cat:"dry",       color:"#60a5fa" },
  { id:"aluminum_can",   icon:"🥫", name:"Aluminium Can",    unit:"can",     defaultRate:3,    cat:"dry",       color:"#60a5fa" },
  { id:"iron_scrap",     icon:"🔩", name:"Iron / Metal",     unit:"kg",      defaultRate:28,   cat:"dry",       color:"#60a5fa" },
  { id:"copper",         icon:"🪙", name:"Copper Wire",      unit:"kg",      defaultRate:380,  cat:"ewaste",    color:"#c084fc" },
  { id:"old_phone",      icon:"📱", name:"Old Smartphone",   unit:"piece",   defaultRate:200,  cat:"ewaste",    color:"#c084fc" },
  { id:"laptop",         icon:"💻", name:"Old Laptop",       unit:"piece",   defaultRate:800,  cat:"ewaste",    color:"#c084fc" },
  { id:"battery",        icon:"🔋", name:"Lead Battery",     unit:"piece",   defaultRate:120,  cat:"hazardous", color:"#f87171" },
  { id:"clothes",        icon:"👕", name:"Old Clothes",      unit:"kg",      defaultRate:10,   cat:"dry",       color:"#60a5fa" },
  { id:"other",          icon:"♻️", name:"Other / Custom",   unit:"item",    defaultRate:0,    cat:"dry",       color:"#4ade80" },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  EARNINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function EarningsPage({user, t, isDark}) {
  const [logs,      setLogs]      = useState(()=>ls.get(`ww_earn_${user.email}`,[]));
  const [showForm,  setShowForm]  = useState(false);
  const [selItem,   setSelItem]   = useState(SCRAP_ITEMS[0]);
  const [qty,       setQty]       = useState(1);
  const [earned,    setEarned]    = useState("");
  const [note,      setNote]      = useState("");
  const [saved,     setSaved]     = useState(false);
  const [delConfirm,setDelConfirm]= useState(null);

  // ── Derived stats ──
  const totalEarned  = useMemo(()=>logs.reduce((s,l)=>s+l.earned,0),[logs]);
  const totalQty     = useMemo(()=>logs.reduce((s,l)=>s+l.qty,0),[logs]);
  const byItem       = useMemo(()=>{
    const m={};
    logs.forEach(l=>{
      if(!m[l.itemId]) m[l.itemId]={...SCRAP_ITEMS.find(i=>i.id===l.itemId)||SCRAP_ITEMS[11], qty:0, earned:0, count:0};
      m[l.itemId].qty+=l.qty; m[l.itemId].earned+=l.earned; m[l.itemId].count++;
    });
    return Object.values(m).sort((a,b)=>b.earned-a.earned);
  },[logs]);

  const earnByDay = useMemo(()=>{
    const m={};
    logs.forEach(l=>{
      const d=new Date(l.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
      m[d]=(m[d]||0)+l.earned;
    });
    return Object.entries(m).slice(-10).map(([date,amt])=>({date,amt}));
  },[logs]);

  const saveLog = () => {
    if(!qty||qty<=0) return;
    const earnedAmt = parseFloat(earned)||0;
    const entry = {
      id: Date.now(),
      itemId: selItem.id,
      itemName: selItem.name,
      icon: selItem.icon,
      unit: selItem.unit,
      cat: selItem.cat,
      color: isDark ? (CATS[selItem.cat]?.color||"#4ade80") : (CATS[selItem.cat]?.darkColor||"#16a34a"),
      qty: parseFloat(qty),
      earned: earnedAmt,
      ratePerUnit: qty>0 ? parseFloat((earnedAmt/qty).toFixed(2)) : 0,
      note: note.trim(),
      date: new Date().toISOString(),
    };
    const newLogs=[...logs, entry];
    setLogs(newLogs); ls.set(`ww_earn_${user.email}`,newLogs);
    setShowForm(false); setQty(1); setEarned(""); setNote("");
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  const deleteLog = (id) => {
    const newLogs=logs.filter(l=>l.id!==id);
    setLogs(newLogs); ls.set(`ww_earn_${user.email}`,newLogs);
    setDelConfirm(null);
  };

  const ic = (val,color,size=28)=>(
    <div style={{fontFamily:"'Fraunces',serif",fontSize:size,fontWeight:900,color,lineHeight:1}}>{val}</div>
  );

  const inputStyle = {
    width:"100%",padding:"12px 14px",
    background:isDark?"rgba(0,0,0,.5)":"rgba(255,255,255,.9)",
    border:`1.5px solid ${t.border}`,borderRadius:12,
    color:t.text,fontSize:14,fontFamily:"'Outfit',sans-serif",
    boxSizing:"border-box",
  };

  return (
    <div style={{paddingBottom:20}}>

      {/* Saved toast */}
      {saved&&<div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:1000,animation:"ww-slideup .4s ease",pointerEvents:"none"}}>
        <div style={{background:isDark?"linear-gradient(135deg,#052e16,#0d4a1a)":"linear-gradient(135deg,#dcfce7,#bbf7d0)",border:`2px solid ${t.green}`,borderRadius:18,padding:"13px 22px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 12px 40px ${t.green}40`,whiteSpace:"nowrap"}}>
          <span style={{fontSize:22}}>✅</span>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:t.text}}>Entry saved! Great work recycling 🎉</div>
        </div>
      </div>}

      {/* Delete confirm */}
      {delConfirm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}} onClick={()=>setDelConfirm(null)}>
        <div style={{background:isDark?"#0a1a0a":"#fff",border:`1.5px solid ${t.red}30`,borderRadius:22,padding:"24px",maxWidth:300,width:"100%",textAlign:"center",animation:"ww-slideup .3s ease"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:36,marginBottom:10}}>🗑️</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:900,color:t.text,marginBottom:8}}>Delete Entry?</div>
          <p style={{color:t.textMid,fontSize:13,fontFamily:"'Outfit',sans-serif",marginBottom:20}}>This can't be undone.</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setDelConfirm(null)} style={{flex:1,padding:"11px",borderRadius:11,border:`1px solid ${t.border}`,background:"transparent",color:t.textMid,fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>deleteLog(delConfirm)} style={{flex:1,padding:"11px",borderRadius:11,border:`1px solid ${t.red}40`,background:isDark?"rgba(248,113,113,.12)":"rgba(220,38,38,.08)",color:t.red,fontSize:13,fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}>Delete</button>
          </div>
        </div>
      </div>}

      {/* ── HERO STATS ── */}
      <div style={{background:`linear-gradient(135deg,${isDark?"#052e16":"#dcfce7"},${isDark?"#0a2a0a":"#bbf7d0"})`,border:`1.5px solid ${t.borderGreen}`,borderRadius:24,padding:"20px",marginBottom:12,position:"relative",overflow:"hidden",boxShadow:`0 12px 40px ${t.green}18`}}>
        <div style={{position:"absolute",top:-10,right:-10,fontSize:100,opacity:.06}}>💰</div>
        <div style={{fontSize:10,color:t.textDim,letterSpacing:2.5,fontWeight:700,fontFamily:"'Outfit',sans-serif",marginBottom:4}}>TOTAL EARNED FROM RECYCLING</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:42,fontWeight:900,color:t.green,lineHeight:1,marginBottom:4}}>₹{totalEarned.toFixed(2)}</div>
        <div style={{fontSize:12,color:t.textMid,fontFamily:"'Outfit',sans-serif",marginBottom:16}}>{logs.length} recycling trips · {totalQty} items recycled</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {label:"Best Trip",val:`₹${logs.length?Math.max(...logs.map(l=>l.earned)).toFixed(0):0}`,icon:"🏆"},
            {label:"Avg per Trip",val:`₹${logs.length?(totalEarned/logs.length).toFixed(0):0}`,icon:"📊"},
            {label:"Items Tracked",val:totalQty,icon:"♻️"},
          ].map((s,i)=>(
            <div key={i} style={{background:isDark?"rgba(0,0,0,.25)":"rgba(255,255,255,.5)",borderRadius:12,padding:"10px",textAlign:"center",backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:18,marginBottom:3}}>{s.icon}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:900,color:t.green}}>{s.val}</div>
              <div style={{fontSize:9,color:t.textDim,letterSpacing:1,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ADD ENTRY BUTTON ── */}
      {!showForm&&(
        <button className="ww-btn-green" onClick={()=>setShowForm(true)}
          style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${t.greenDeep},${t.green})`,border:"none",borderRadius:16,cursor:"pointer",color:isDark?"#030a03":"#fff",fontSize:15,fontWeight:700,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 6px 24px ${t.green}35`,marginBottom:14}}>
          ➕ Log a Recycling Trip
        </button>
      )}

      {/* ── ADD ENTRY FORM ── */}
      {showForm&&(
        <Card t={t} style={{padding:"20px",borderRadius:22,marginBottom:14,border:`1.5px solid ${t.borderGreen}`,animation:"ww-slideup .35s ease"}}>
          <div style={{fontSize:11,color:t.green,letterSpacing:2,fontWeight:700,fontFamily:"'Outfit',sans-serif",marginBottom:16}}>📝 LOG RECYCLING TRIP</div>

          {/* Item selector */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:t.textMid,letterSpacing:1.5,display:"block",marginBottom:8,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>WHAT DID YOU RECYCLE?</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {SCRAP_ITEMS.map(item=>(
                <button key={item.id} onClick={()=>setSelItem(item)}
                  style={{padding:"10px 4px",borderRadius:12,border:`1.5px solid ${selItem.id===item.id?t.green:t.border}`,background:selItem.id===item.id?`${t.green}15`:isDark?"rgba(255,255,255,.02)":"rgba(255,255,255,.7)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .15s"}}>
                  <span style={{fontSize:20}}>{item.icon}</span>
                  <span style={{fontSize:9,color:selItem.id===item.id?t.green:t.textDim,fontFamily:"'Outfit',sans-serif",fontWeight:600,textAlign:"center",lineHeight:1.2}}>{item.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected item info */}
          <div style={{background:`${t.green}08`,border:`1px solid ${t.borderGreen}`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:24}}>{selItem.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,color:t.text}}>{selItem.name}</div>
              {selItem.defaultRate>0&&<div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>Typical kabadiwala rate: ~₹{selItem.defaultRate}/{selItem.unit}</div>}
            </div>
          </div>

          {/* Qty + Earned row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div>
              <label style={{fontSize:11,color:t.textMid,letterSpacing:1.5,display:"block",marginBottom:7,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>QUANTITY ({selItem.unit}s)</label>
              {/* Stepper */}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>setQty(q=>Math.max(0.5,parseFloat((parseFloat(q)-0.5).toFixed(1))))}
                  style={{width:36,height:36,borderRadius:10,border:`1.5px solid ${t.borderGreen}`,background:"transparent",color:t.green,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>−</button>
                <input type="number" value={qty} min="0.5" step="0.5" onChange={e=>setQty(e.target.value)}
                  style={{...inputStyle,textAlign:"center",padding:"10px 6px",flex:1}}/>
                <button onClick={()=>setQty(q=>parseFloat((parseFloat(q)+0.5).toFixed(1)))}
                  style={{width:36,height:36,borderRadius:10,border:`1.5px solid ${t.borderGreen}`,background:`${t.green}15`,color:t.green,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>+</button>
              </div>
            </div>
            <div>
              <label style={{fontSize:11,color:t.textMid,letterSpacing:1.5,display:"block",marginBottom:7,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>AMOUNT EARNED (₹)</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:t.textMid,fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:700}}>₹</span>
                <input type="number" value={earned} min="0" step="0.5" placeholder="0.00" onChange={e=>setEarned(e.target.value)}
                  style={{...inputStyle,paddingLeft:28}}/>
              </div>
              {selItem.defaultRate>0&&qty>0&&<div style={{fontSize:10,color:t.textDim,marginTop:5,fontFamily:"'Outfit',sans-serif"}}>
                Suggested: ₹{(selItem.defaultRate*parseFloat(qty||0)).toFixed(0)}
                <span style={{color:t.green,cursor:"pointer",fontWeight:600,marginLeft:6}} onClick={()=>setEarned((selItem.defaultRate*parseFloat(qty||0)).toFixed(0))}>Use this ↗</span>
              </div>}
            </div>
          </div>

          {/* Note */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,color:t.textMid,letterSpacing:1.5,display:"block",marginBottom:7,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>NOTE (optional)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Sold to Kabadiwala near market, got good rate today!" style={inputStyle}/>
          </div>

          {/* Rate preview */}
          {earned>0&&qty>0&&<div style={{background:`${t.green}08`,border:`1px solid ${t.borderGreen}`,borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>Rate per {selItem.unit}</span>
            <span style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:900,color:t.green}}>₹{(parseFloat(earned)/parseFloat(qty)).toFixed(2)}</span>
          </div>}

          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setShowForm(false);setQty(1);setEarned("");setNote("");}} style={{flex:1,padding:"13px",borderRadius:13,border:`1px solid ${t.border}`,background:"transparent",color:t.textMid,fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}>Cancel</button>
            <button className="ww-btn-green" onClick={saveLog}
              style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:`linear-gradient(135deg,${t.greenDeep},${t.green})`,color:isDark?"#030a03":"#fff",fontSize:14,fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:"pointer",boxShadow:`0 4px 16px ${t.green}35`}}>
              💾 Save Entry
            </button>
          </div>
        </Card>
      )}

      {/* ── BY ITEM BREAKDOWN ── */}
      {byItem.length>0&&(
        <>
          <div style={{fontSize:10,color:t.textDim,letterSpacing:2,marginBottom:10,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>📦 EARNINGS BY ITEM</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {byItem.map((item,i)=>{
              const pct=totalEarned>0?(item.earned/totalEarned*100):0;
              return (
                <Card key={i} t={t} style={{padding:"14px 16px",borderRadius:16,border:`1px solid ${item.color}25`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                    <div style={{width:42,height:42,borderRadius:12,background:`${item.color}15`,border:`1px solid ${item.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:700,color:t.text,marginBottom:1}}>{item.name}</div>
                      <div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>{item.qty} {item.unit}s recycled · {item.count} trip{item.count>1?"s":""}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:t.green}}>₹{item.earned.toFixed(0)}</div>
                      <div style={{fontSize:10,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>₹{item.qty>0?(item.earned/item.qty).toFixed(2):0}/{item.unit}</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{height:5,background:isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.07)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${item.color}80,${item.color})`,borderRadius:3,transition:"width 1s ease"}}/>
                  </div>
                  <div style={{fontSize:10,color:t.textDim,marginTop:4,fontFamily:"'Outfit',sans-serif",textAlign:"right"}}>{pct.toFixed(1)}% of total earnings</div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ── EARNINGS CHART ── */}
      {earnByDay.length>1&&(
        <Card t={t} style={{padding:"18px",borderRadius:20,marginBottom:14}}>
          <div style={{fontSize:10,color:t.green,letterSpacing:2,marginBottom:14,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>📈 EARNINGS OVER TIME</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={earnByDay} margin={{top:0,right:0,bottom:0,left:-14}}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark?"rgba(255,255,255,.04)":"rgba(0,0,0,.05)"}/>
              <XAxis dataKey="date" tick={{fill:t.textDim,fontSize:9,fontFamily:"Outfit"}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:t.textDim,fontSize:9,fontFamily:"Outfit"}} tickLine={false} axisLine={false} tickFormatter={v=>`₹${v}`}/>
              <Tooltip content={({active,payload,label})=>{
                if(!active||!payload?.length) return null;
                return <div style={{background:isDark?"#0a1a0a":"#fff",border:`1px solid ${t.borderGreen}`,borderRadius:10,padding:"10px 14px"}}>
                  <div style={{fontSize:11,color:t.textMid,marginBottom:3,fontFamily:"'Outfit',sans-serif"}}>{label}</div>
                  <div style={{fontSize:14,color:t.green,fontWeight:700,fontFamily:"'Fraunces',serif"}}>₹{payload[0].value.toFixed(2)}</div>
                </div>;
              }}/>
              <Bar dataKey="amt" name="Earned" radius={[7,7,0,0]} fill={isDark?"#4ade80":"#16a34a"}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── TRIP LOG ── */}
      {logs.length>0&&(
        <>
          <div style={{fontSize:10,color:t.textDim,letterSpacing:2,marginBottom:10,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>🗓️ TRIP HISTORY ({logs.length})</div>
          {[...logs].reverse().map((log,i)=>(
            <Card key={log.id||i} t={t} style={{padding:"13px 15px",borderRadius:16,marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:11,background:`${log.color||t.green}15`,border:`1px solid ${log.color||t.green}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{log.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:700,color:t.text,marginBottom:1}}>{log.itemName}</div>
                <div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>{log.qty} {log.unit}{log.qty!==1?"s":""} · {new Date(log.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                {log.note&&<div style={{fontSize:10,color:t.textMid,fontFamily:"'Outfit',sans-serif",marginTop:2,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{log.note}"</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginRight:4}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:900,color:t.green}}>₹{log.earned.toFixed(0)}</div>
                {log.ratePerUnit>0&&<div style={{fontSize:10,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>₹{log.ratePerUnit}/{log.unit}</div>}
              </div>
              <button onClick={()=>setDelConfirm(log.id||i)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${t.red}25`,background:isDark?"rgba(248,113,113,.08)":"rgba(220,38,38,.05)",color:t.red,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
            </Card>
          ))}
        </>
      )}

      {logs.length===0&&!showForm&&(
        <Card t={t} style={{padding:"40px 24px",borderRadius:22,textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:14}}>💰</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:t.text,marginBottom:8}}>Track Your Real Earnings</div>
          <p style={{color:t.textMid,fontSize:13,fontFamily:"'Outfit',sans-serif",lineHeight:1.7,marginBottom:0}}>Log every plastic bottle, newspaper or scrap you sell. See exactly how much money recycling puts in your pocket! 🌱</p>
        </Card>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
function RewardsPage({user, t, isDark, totalPts, onSpend}) {
  const [filter, setFilter]       = useState("all");
  const [redeemed, setRedeemed]   = useState(()=>ls.get(`ww_redeemed_${user.email}`,[]));
  const [redeeming, setRedeeming] = useState(null);
  const [success, setSuccess]     = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  const filters = [{id:"all",label:"All"},{id:"planet",label:"🌍 Planet"},{id:"coupon",label:"🎁 Coupons"},{id:"digital",label:"✨ Digital"}];
  const filtered = filter==="all" ? REWARDS : REWARDS.filter(r=>r.category===filter);

  const redeem = async (reward) => {
    if(totalPts < reward.cost) return;
    setConfirmItem(null);
    setRedeeming(reward.id);
    await new Promise(r=>setTimeout(r,1200));
    const newRedeemed = [...redeemed, {id:reward.id, date:new Date().toISOString(), title:reward.title}];
    setRedeemed(newRedeemed);
    ls.set(`ww_redeemed_${user.email}`, newRedeemed);
    onSpend(reward.cost);
    setRedeeming(null);
    setSuccess(reward);
    setTimeout(()=>setSuccess(null), 4000);
  };

  const timesRedeemed = (id) => redeemed.filter(r=>r.id===id).length;
  const totalSpent = redeemed.reduce((s,r)=>{ const rw=REWARDS.find(x=>x.id===r.id); return s+(rw?.cost||0); },0);

  return (
    <div style={{paddingBottom:20}}>
      {/* Success toast */}
      {success && (
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:1000,animation:"ww-slideup .4s ease",pointerEvents:"none",maxWidth:340,width:"90%"}}>
          <div style={{background:isDark?"linear-gradient(135deg,#052e16,#0d4a1a)":"linear-gradient(135deg,#dcfce7,#bbf7d0)",border:`2px solid ${t.green}`,borderRadius:20,padding:"16px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 16px 48px ${t.green}40`}}>
            <span style={{fontSize:28,flexShrink:0}}>{success.icon}</span>
            <div>
              <div style={{fontSize:11,color:t.green,letterSpacing:1.5,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>✅ REDEEMED!</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:15,fontWeight:900,color:t.text}}>{success.title}</div>
              <div style={{fontSize:11,color:t.textMid,fontFamily:"'Outfit',sans-serif",marginTop:2}}>Check your email for details 📧</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmItem && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}} onClick={()=>setConfirmItem(null)}>
          <div style={{background:isDark?"#0a1a0a":"#fff",border:`1.5px solid ${t.borderGreen}`,borderRadius:24,padding:"24px",maxWidth:340,width:"100%",boxShadow:`0 24px 64px rgba(0,0,0,.5)`,animation:"ww-slideup .3s ease"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{fontSize:48,marginBottom:10}}>{confirmItem.icon}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:t.text,marginBottom:4}}>{confirmItem.title}</div>
              <div style={{fontSize:12,color:t.textMid,fontFamily:"'Outfit',sans-serif",lineHeight:1.6,marginBottom:16}}>{confirmItem.desc}</div>
              <div style={{background:isDark?"rgba(251,191,36,.1)":"rgba(217,119,6,.08)",border:`1px solid ${isDark?"rgba(251,191,36,.3)":"rgba(217,119,6,.2)"}`,borderRadius:12,padding:"10px",marginBottom:16}}>
                <span style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:isDark?"#fbbf24":"#d97706"}}>🪙 {confirmItem.cost} EcoCoins</span>
                <div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif",marginTop:2}}>You have {totalPts} coins · {totalPts-confirmItem.cost} remaining after</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setConfirmItem(null)} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${t.border}`,background:"transparent",color:t.textMid,fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}>Cancel</button>
              <button className="ww-btn-green" onClick={()=>redeem(confirmItem)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${t.greenDeep},${t.green})`,color:isDark?"#030a03":"#fff",fontSize:14,fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:"pointer",boxShadow:`0 4px 16px ${t.green}40`}}>
                🎁 Redeem Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coins banner */}
      <div style={{background:`linear-gradient(135deg,${isDark?"#1a0a00":"#fefce8"},${isDark?"#2d1a00":"#fef3c7"})`,border:`1.5px solid ${isDark?"rgba(251,191,36,.3)":"rgba(217,119,6,.3)"}`,borderRadius:22,padding:"18px 20px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:`0 8px 32px ${isDark?"rgba(251,191,36,.15)":"rgba(217,119,6,.2)"}`}}>
        <div>
          <div style={{fontSize:10,color:isDark?"#fbbf24":"#d97706",letterSpacing:2.5,fontWeight:700,fontFamily:"'Outfit',sans-serif",marginBottom:4}}>YOUR BALANCE</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:isDark?"#fbbf24":"#d97706",lineHeight:1}}>🪙 {totalPts}</div>
          <div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif",marginTop:3}}>Spent {totalSpent} coins · {redeemed.length} rewards redeemed</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:36}}>🎁</div>
          <div style={{fontSize:10,color:t.textDim,fontFamily:"'Outfit',sans-serif",marginTop:4}}>Earn more by<br/>scanning waste!</div>
        </div>
      </div>

      {/* Why coins matter */}
      <div style={{background:`linear-gradient(135deg,${isDark?"rgba(74,222,128,.06)":"rgba(22,163,74,.05)"},${isDark?"rgba(74,222,128,.03)":"rgba(22,163,74,.03)"})`,border:`1px solid ${t.borderGreen}`,borderRadius:18,padding:"16px",marginBottom:14}}>
        <div style={{fontSize:11,color:t.green,letterSpacing:2,fontWeight:700,fontFamily:"'Outfit',sans-serif",marginBottom:10}}>🌍 WHY ECOCOINS MATTER</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{icon:"🌱",val:"30",label:"coins = 1 real tree planted"},{icon:"🐢",val:"50",label:"coins = protect sea turtles"},{icon:"🌊",val:"80",label:"coins = 1kg ocean plastic removed"}].map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:"10px 6px",background:isDark?"rgba(74,222,128,.05)":"rgba(255,255,255,.7)",borderRadius:12,border:`1px solid ${t.borderGreen}`}}>
              <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:900,color:t.green}}>{s.val}</div>
              <div style={{fontSize:10,color:t.textDim,fontFamily:"'Outfit',sans-serif",lineHeight:1.4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
        {filters.map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:"8px 14px",borderRadius:30,border:`1px solid ${filter===f.id?t.green:t.border}`,background:filter===f.id?`${t.green}18`:"transparent",color:filter===f.id?t.green:t.textMid,fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",flexShrink:0}}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map(reward=>{
          const canAfford = totalPts >= reward.cost;
          const count = timesRedeemed(reward.id);
          const isRedeeming = redeeming === reward.id;
          return (
            <Card key={reward.id} t={t} style={{padding:"18px",borderRadius:22,border:`1px solid ${canAfford?reward.tagColor+"30":t.border}`,opacity:canAfford?1:.65,transition:"all .3s",position:"relative",overflow:"hidden"}}>
              {/* Shimmer for affordable */}
              {canAfford && <div style={{position:"absolute",inset:0,background:`linear-gradient(105deg,transparent 40%,${reward.tagColor}08 50%,transparent 60%)`,backgroundSize:"200% 100%",animation:"ww-shimmer 3s infinite",borderRadius:22,pointerEvents:"none"}}/>}

              <div style={{display:"flex",gap:14,alignItems:"flex-start",position:"relative"}}>
                <div style={{width:52,height:52,borderRadius:16,background:`${reward.tagColor}15`,border:`1.5px solid ${reward.tagColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{reward.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:3}}>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:t.text,lineHeight:1.2}}>{reward.title}</div>
                    <div style={{padding:"3px 9px",borderRadius:20,background:`${reward.tagColor}18`,border:`1px solid ${reward.tagColor}30`,color:reward.tagColor,fontSize:10,fontWeight:700,fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>{reward.tag}</div>
                  </div>
                  <div style={{fontSize:11,color:t.textMid,fontFamily:"'Outfit',sans-serif",marginBottom:8}}>{reward.subtitle}</div>
                  <div style={{fontSize:12,color:t.textDim,fontFamily:"'Outfit',sans-serif",lineHeight:1.6,marginBottom:12}}>{reward.desc}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:isDark?"#fbbf24":"#d97706"}}>🪙 {reward.cost}</span>
                      {!canAfford && <span style={{fontSize:10,color:t.red,fontFamily:"'Outfit',sans-serif",fontWeight:600}}>Need {reward.cost-totalPts} more</span>}
                      {count>0 && <span style={{fontSize:10,color:t.green,fontFamily:"'Outfit',sans-serif",fontWeight:600,background:`${t.green}15`,padding:"2px 8px",borderRadius:20}}>✓ Redeemed ×{count}</span>}
                    </div>
                    <button className="ww-btn-green" onClick={()=>canAfford&&setConfirmItem(reward)} disabled={!canAfford||isRedeeming}
                      style={{padding:"9px 18px",borderRadius:12,border:"none",background:canAfford?`linear-gradient(135deg,${t.greenDeep},${t.green})`:isDark?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)",color:canAfford?isDark?"#030a03":"#fff":t.textDim,fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:canAfford?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:6,flexShrink:0,boxShadow:canAfford?`0 4px 12px ${t.green}30`:"none"}}>
                      {isRedeeming?<><Spinner color={isDark?"#030a03":"#fff"} size={12}/>Redeeming...</>:canAfford?"Redeem 🎁":"Locked 🔒"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Redeem history */}
      {redeemed.length>0 && (
        <div style={{marginTop:20}}>
          <div style={{fontSize:10,color:t.textDim,letterSpacing:2,marginBottom:10,fontFamily:"'Outfit',sans-serif",fontWeight:700}}>📋 REDEMPTION HISTORY</div>
          {[...redeemed].reverse().slice(0,5).map((r,i)=>{
            const rw=REWARDS.find(x=>x.id===r.id);
            return rw?(
              <Card key={i} t={t} style={{padding:"12px 14px",borderRadius:14,marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20,flexShrink:0}}>{rw.icon}</span>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:t.text,fontFamily:"'Outfit',sans-serif"}}>{rw.title}</div><div style={{fontSize:11,color:t.textDim,fontFamily:"'Outfit',sans-serif"}}>{new Date(r.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div></div>
                <span style={{fontSize:12,fontWeight:700,color:isDark?"#fbbf24":"#d97706",fontFamily:"'Outfit',sans-serif",flexShrink:0}}>−🪙{rw.cost}</span>
              </Card>
            ):null;
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function WasteWise() {
  const [isDark, setIsDark] = useState(()=>ls.get("ww_dark",true));
  const [user, setUser]     = useState(()=>ls.get("ww_currentUser",null));
  const [page, setPage]     = useState("scan");
  const [totalPts, setTotalPts] = useState(()=>user?ls.get(`ww_pts_${user.email}`,0):0);
  const [newBadge, setNewBadge] = useState(null);
  const [showSignOut, setShowSignOut] = useState(false);

  const t = isDark ? T.dark : T.light;
  const toggleDark = () => { const n=!isDark; setIsDark(n); ls.set("ww_dark",n); };

  const handleLogin=(u)=>{ ls.set("ww_currentUser",u); setUser(u); setTotalPts(ls.get(`ww_pts_${u.email}`,0)); };
  const handleLogout=()=>{ ls.set("ww_currentUser",null); setUser(null); setPage("scan"); setShowSignOut(false); };

  const handleSpend=useCallback((cost)=>{
    if(!user) return;
    const newPts=Math.max(0,ls.get(`ww_pts_${user.email}`,0)-cost);
    ls.set(`ww_pts_${user.email}`,newPts);
    setTotalPts(newPts);
  },[user]);

  const handleScanComplete=useCallback((scanData)=>{
    if(!user) return;
    const history=ls.get(`ww_history_${user.email}`,[]);
    history.push(scanData);
    ls.set(`ww_history_${user.email}`,history);
    const pts=ls.get(`ww_pts_${user.email}`,0)+scanData.points;
    const scans=ls.get(`ww_scans_${user.email}`,0)+1;
    ls.set(`ww_pts_${user.email}`,pts);
    ls.set(`ww_scans_${user.email}`,scans);
    setTotalPts(pts);
    const badges=ls.get(`ww_badges_${user.email}`,[]);
    let unlocked=null;
    for(const b of BADGES){
      if(badges.includes(b.id)) continue;
      if(b.type==="points"&&pts>=b.req){badges.push(b.id);unlocked=b;break;}
      if(!b.type&&!b.cat&&scans>=b.req){badges.push(b.id);unlocked=b;break;}
      if(b.cat&&b.cat===scanData.category){badges.push(b.id);unlocked=b;break;}
    }
    ls.set(`ww_badges_${user.email}`,badges);
    if(unlocked){setNewBadge(unlocked);setTimeout(()=>setNewBadge(null),4500);}
  },[user]);

  if(!user) return <AuthPage onLogin={handleLogin} isDark={isDark} toggleDark={toggleDark}/>;

  const leaves=[[{top:"12%",left:"1%"},0],[{top:"25%",right:"2%"},1],[{bottom:"30%",left:"0%"},2],[{bottom:"15%",right:"3%"},0],[{top:"55%",left:"2%"},1]];

  return (
    <div style={{minHeight:"100vh",background:t.bg,fontFamily:"'Outfit',sans-serif",color:t.text,position:"relative",overflowX:"hidden",transition:"background .4s, color .4s"}}>
      <GlobalStyles/>
      <BackgroundOrbs isDark={isDark}/>
      {leaves.map(([s,a],i)=><FloatingLeaf key={i} style={{...s,animation:`ww-float${a} ${9+i*2.5}s ease-in-out infinite`,animationDelay:`${i*1.1}s`,zIndex:0}} isDark={isDark}/>)}

      {/* Sign-out confirm modal */}
      {showSignOut && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}} onClick={()=>setShowSignOut(false)}>
          <div style={{background:isDark?"#0a1a0a":"#fff",border:`1.5px solid ${t.border}`,borderRadius:24,padding:"28px 24px",maxWidth:320,width:"100%",boxShadow:`0 24px 64px rgba(0,0,0,.5)`,animation:"ww-slideup .3s ease",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:44,marginBottom:12}}>👋</div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:t.text,marginBottom:8}}>Sign Out?</div>
            <p style={{color:t.textMid,fontSize:13,fontFamily:"'Outfit',sans-serif",lineHeight:1.6,marginBottom:24}}>Your eco progress is saved. Come back anytime to keep protecting the planet! 🌍</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowSignOut(false)} style={{flex:1,padding:"13px",borderRadius:13,border:`1px solid ${t.border}`,background:"transparent",color:t.textMid,fontSize:14,fontWeight:600,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}>Stay 🌱</button>
              <button onClick={handleLogout} style={{flex:1,padding:"13px",borderRadius:13,border:`1px solid ${t.red}40`,background:isDark?"rgba(248,113,113,.12)":"rgba(220,38,38,.08)",color:t.red,fontSize:14,fontWeight:700,fontFamily:"'Outfit',sans-serif",cursor:"pointer"}}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Badge toast */}
      {newBadge&&(
        <div style={{position:"fixed",bottom:100,left:"50%",zIndex:1000,animation:"ww-badgein .5s ease",pointerEvents:"none"}}>
          <div style={{background:isDark?"linear-gradient(135deg,#1a0a2e,#2d1a4e)":"linear-gradient(135deg,#f5f3ff,#ede9fe)",border:"1.5px solid rgba(192,132,252,.5)",borderRadius:20,padding:"14px 22px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 16px 48px rgba(192,132,252,.4)",whiteSpace:"nowrap",transform:"translateX(-50%)"}}>
            <span style={{fontSize:28}}>{newBadge.icon}</span>
            <div>
              <div style={{fontSize:10,color:t.purple,letterSpacing:1.5,fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>BADGE UNLOCKED!</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:900,color:t.text}}>{newBadge.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY NAV ── */}
      <div style={{position:"sticky",top:0,zIndex:100,background:t.navBg,backdropFilter:"blur(20px)",borderBottom:`1px solid ${t.border}`,transition:"background .4s"}}>
        <div style={{maxWidth:580,margin:"0 auto",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${isDark?"#052e16":"#dcfce7"},${isDark?"#0d4a1a":"#bbf7d0"})`,border:`1.5px solid ${t.borderGreen}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 0 16px ${t.green}30`}}>♻️</div>
            <div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:900,color:t.green,lineHeight:1}}>WasteWise</div>
              <div style={{fontSize:10,color:t.textDim,letterSpacing:.5,fontFamily:"'Outfit',sans-serif"}}>Hi, {user.name.split(" ")[0]}! 👋</div>
            </div>
          </div>
          {/* Right controls */}
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{padding:"5px 11px",background:isDark?"rgba(251,191,36,.12)":"rgba(217,119,6,.1)",border:`1px solid ${isDark?"rgba(251,191,36,.25)":"rgba(217,119,6,.2)"}`,borderRadius:30,fontSize:12,fontWeight:700,color:isDark?"#fbbf24":"#d97706",fontFamily:"'Outfit',sans-serif",cursor:"pointer"}} onClick={()=>setPage("rewards")}>🪙 {totalPts}</div>
            {/* Dark/Light toggle */}
            <button onClick={toggleDark} title="Toggle theme" style={{width:46,height:24,borderRadius:12,background:isDark?"rgba(74,222,128,.2)":"rgba(22,163,74,.15)",border:`1px solid ${t.borderGreen}`,cursor:"pointer",display:"flex",alignItems:"center",padding:"3px",transition:"all .3s",flexShrink:0}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:isDark?"#4ade80":"#16a34a",transform:isDark?"translateX(20px)":"translateX(0)",transition:"transform .3s ease",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>{isDark?"🌙":"☀️"}</div>
            </button>
            {/* Sign out */}
            <button onClick={()=>setShowSignOut(true)} title="Sign Out" style={{padding:"5px 10px",borderRadius:10,background:isDark?"rgba(248,113,113,.1)":"rgba(220,38,38,.07)",border:`1px solid ${t.red}25`,color:t.red,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:4}}>
              <span>👋</span><span style={{display:"none"}}>Sign Out</span>
            </button>
          </div>
        </div>
        {/* Page tabs */}
        <div style={{maxWidth:580,margin:"0 auto",padding:"0 16px 10px",display:"flex",gap:5}}>
          {[
            {id:"scan",    icon:"📸", label:"Scan"},
            {id:"earnings",icon:"💰", label:"Earnings"},
            {id:"rewards", icon:"🎁", label:"Rewards"},
            {id:"dashboard",icon:"📊",label:"Stats"},
          ].map(pg=>(
            <button key={pg.id} onClick={()=>setPage(pg.id)} style={{flex:1,padding:"8px 3px",borderRadius:11,border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:700,transition:"all .2s",background:page===pg.id?`linear-gradient(135deg,${t.greenDeep},${t.green})`:"transparent",color:page===pg.id?isDark?"#030a03":"#fff":t.textMid,boxShadow:page===pg.id?`0 4px 16px ${t.green}35`:"none",position:"relative"}}>
              <div style={{fontSize:15,marginBottom:1}}>{pg.icon}</div>
              <div>{pg.label}</div>
              {pg.id==="rewards"&&totalPts>=15&&page!=="rewards"&&<div style={{position:"absolute",top:3,right:3,width:7,height:7,borderRadius:"50%",background:isDark?"#fbbf24":"#d97706",boxShadow:`0 0 6px ${isDark?"#fbbf24":"#d97706"}`}}/>}
            </button>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div style={{maxWidth:580,margin:"0 auto",padding:"20px 16px 80px",position:"relative",zIndex:1}}>
        {page==="scan"     && <ScannerPage  user={user} onScanComplete={handleScanComplete} t={t} isDark={isDark}/>}
        {page==="earnings" && <EarningsPage user={user} t={t} isDark={isDark}/>}
        {page==="rewards"  && <RewardsPage  user={user} t={t} isDark={isDark} totalPts={totalPts} onSpend={handleSpend}/>}
        {page==="dashboard"&& <DashboardPage user={user} t={t} isDark={isDark}/>}
        <p style={{textAlign:"center",color:t.textDim,fontSize:11,marginTop:28,letterSpacing:1.5,fontFamily:"'Outfit',sans-serif"}}>WASTEWISE · AGENTATHONX 2026 · INDIA 🌿</p>
      </div>
    </div>
  );
}
