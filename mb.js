// Montar refeição: vários alimentos -> gramas para bater P/H/G da refeição
const MBF=[// n, estado, P, H, G por 100 g (como pesado), y = cozido/cru, d = porção típica (g), u = unidade (g)
["Massa","cozida",5.8,31,0.9,2.05,150],["Arroz branco","cozido",2.7,28,0.3,2.8,150],["Batata","cozida",2,17,0.1,0.95,200],["Batata-doce","cozida",1.6,20,0.1,0,200],["Gnocchi","cozido",3.5,30,0.5,1.05,150],["Cuscuz","cozido",3.8,23,0.2,3.1,150],["Pão branco / de mistura","pronto",9,50,2,0,60],["Tostas","prontas",11,72,6,0,30],["Wrap de trigo","pronto",8.5,50,7,0,60],["Flocos de aveia","secos",13,60,7,0,40],["Cereais (corn flakes)","secos",7,84,1,0,30],
["Feijão-frade","cozido / frasco escorrido",7.7,19,0.5,2.4,100],["Grão-de-bico","cozido / frasco escorrido",8.5,18,2.6,2.3,100],["Lentilhas","cozidas",9,17,0.4,2.5,100],
["Peito de frango","cozinhado",31,0,3.6,0.75,100],["Coxa de frango sem pele","cozinhada",26,0,8,0.75,100],["Peito de peru","cozinhado",29,0,2,0.75,100],["Carne picada de vaca","cozinhada",27,0,12,0.7,100],["Vaca magra","cozinhada",30,0,6,0.7,100],["Lombo de porco","cozinhado",29,0,6,0.75,100],["Salmão","cozinhado",25,0,12,0.8,100],["Pescada","cozida",19,0,1,0.85,130],["Bacalhau demolhado","cozido",23,0,1,0.9,120],["Camarão","cozido, descascado",24,0,1.5,0.85,100],
["Atum em azeite","lata, escorrido",27,0,8,0,80],["Atum ao natural","lata, escorrido",26,0,1,0,80],["Sardinha em lata","escorrida",25,0,11,0,80],
["Ovo cozido / mexido","1 ovo ≈ 50 g sem casca",12.6,1.1,10.6,0,100,50],
["Leite gordo","ml",3.2,4.7,3.6,0,250],["Iogurte grego natural","—",6,4,10,0,125],["Skyr","—",11,4,0.2,0,150],["Queijo fresco","—",9,3,4,0,80],["Queijo flamengo / curado","—",25,0,27,0,30],["Mozzarella","—",22,2,20,0,50],["Whey","pó",78,7,6,0,25],["Fiambre de peru","fatiado",19,1,2,0,50],
["Banana","sem casca",1.1,21,0.3,0,120],["Maçã","com casca",0.3,12,0.2,0,150],["Fruta (pera, laranja, kiwi)","—",0.7,11,0.2,0,150],["Mel","—",0.3,80,0,0,15],["Compota","—",0.4,60,0,0,20],["Chocolate negro 70–85%","—",9,30,45,0,20],
["Azeite","1 c. sopa ≈ 10 g",0,0,100,0,10],["Abacate","polpa",2,2,15,0,60],["Natas de cozinha","—",2.5,4,18,0,40]
].map(a=>({n:a[0],st:a[1],P:a[2],H:a[3],G:a[4],y:a[5],d:a[6],u:a[7]||0}));
const MBI=n=>MBF.findIndex(f=>f.n===n);
// x: gramas; lk: {i:g} fixos. Minimiza erro relativo nos 3 macros + pequena atração à porção típica.
function mbSolve(ids,T,lk){lk=lk||{};const F=ids.map(i=>MBF[i]),n=F.length,free=F.map((_,j)=>!(ids[j] in lk));
const kc=f=>4*f.P+4*f.H+9*f.G,TK=4*T.p+4*T.h+9*T.g,LK=F.reduce((a,f,j)=>a+(free[j]?0:kc(f)*lk[ids[j]]/100),0),PK=F.reduce((a,f,j)=>a+(free[j]?kc(f)*f.d/100:0),0),sc=PK>0?Math.max(0.2,(TK-LK)/PK):1,pr=F.map(f=>f.d*sc);
let x=F.map((f,j)=>free[j]?pr[j]:lk[ids[j]]);const w=[1/Math.max(T.p,5)**2,1/Math.max(T.h,5)**2,1/Math.max(T.g,3)**2].map(v=>v*1e4),lam=3,mn=F.map(f=>f.u?f.u:(f.G>90?0:30));
const mac=x=>{let s=[0,0,0];F.forEach((f,j)=>{s[0]+=f.P*x[j]/100;s[1]+=f.H*x[j]/100;s[2]+=f.G*x[j]/100});return s};
for(let it=0;it<6000;it++){const s=mac(x),r=[s[0]-T.p,s[1]-T.h,s[2]-T.g];let ch=0;
F.forEach((f,j)=>{if(!free[j])return;const w0=r[0]>0?w[0]*.25:w[0],gr=2*(w0*r[0]*f.P+w[1]*r[1]*f.H+w[2]*r[2]*f.G)/100+2*lam*(x[j]-pr[j])/pr[j];
const h=2*(w0*f.P*f.P+w[1]*f.H*f.H+w[2]*f.G*f.G)/1e4+2*lam/pr[j];const nx=Math.max(mn[j],x[j]-gr/h),dx=nx-x[j];ch+=Math.abs(dx);x[j]=nx;r[0]+=f.P*dx/100;r[1]+=f.H*dx/100;r[2]+=f.G*dx/100});
if(ch<1e-4)break}
const uj=F.findIndex((f,j)=>free[j]&&f.u);if(uj>=0){const u=F[uj].u,c=[Math.max(1,Math.floor(x[uj]/u)),Math.max(1,Math.ceil(x[uj]/u))];let best=null;for(const k of c){const L2={...lk,[ids[uj]]:k*u},r=mbSolve(ids,T,L2),e=((r.P-T.p)/T.p)**2*(r.P>T.p?.25:1)+((r.H-T.h)/Math.max(T.h,5))**2+((r.G-T.g)/T.g)**2;if(!best||e<best.e)best={...r,e}}delete best.e;return best}
x=x.map((v,j)=>free[j]?(F[j].u?Math.max(1,Math.round(v/F[j].u))*F[j].u:Math.max(F[j].G>90?0:5,Math.round(v/5)*5)):v);
const s=mac(x);return{x,P:s[0],H:s[1],G:s[2],K:4*s[0]+4*s[1]+9*s[2]}}
if(typeof module!=="undefined"){module.exports={MBF,MBI,mbSolve}}else{
const FKEY="pg-mb-fav";S.mb=false;S.mbs=[];S.mbl={};S.mbq="";
const favs=()=>{try{return JSON.parse(localStorage.getItem(FKEY))||[]}catch(e){return[]}};
const dif=(v,t)=>{const d=Math.round(v-t),c=Math.abs(d)<=Math.max(3,t*.08)?"#22c55e":Math.abs(d)<=t*.2?"#f59e0b":"#ef4444";return `<span style="color:${c}">${d>0?"+":""}${d}</span>`};
function mbV(){const M=MEALS[S.meal],T={p:alvo(S.meal,"p"),h:alvo(S.meal,"h"),g:alvo(S.meal,"g")},q=S.mbq.toLowerCase();
let o=`<button class="back" data-b="close">‹ ${M.n}</button><p class="big">Montar refeição · ${M.n}</p><p class="small">Alvo P ${T.p} · H ${T.h} · G ${T.g} g · ${4*T.p+4*T.h+9*T.g} kcal. Legumes à descrição (fora das contas).</p>`;
if(S.mbs.length){const r=mbSolve(S.mbs,T,S.mbl);
o+=card("Quanto comer",S.mbs.map((i,j)=>{const f=MBF[i],g=r.x[j],lk=i in S.mbl;return `<div class="kv" style="display:block"><p style="color:#f2f4f8;font-weight:600">${f.u?g/f.u+" ovo"+(g/f.u>1?"s":"")+" ("+g+" g)":g+" g"} · ${f.n} <span class="small">(${f.st})${f.y?` · cru: ~${Math.round(g/f.y/5)*5} g`:""}</span></p>
<div style="display:flex;gap:8px;align-items:center"><input type="range" min="0" max="${f.u?f.u*6:Math.max(400,f.d*3)}" step="${f.u||5}" value="${g}" data-bs="${i}" style="flex:1"><button class="pill ${lk?"on":""}" data-b="lock:${i}:${g}">${lk?"🔒":"🔓"}</button><button class="pill" data-b="rm:${i}">✕</button></div></div>`}).join("")+
`<p>Total: P ${Math.round(r.P)} (${dif(r.P,T.p)}) · H ${Math.round(r.H)} (${dif(r.H,T.h)}) · G ${Math.round(r.G)} (${dif(r.G,T.g)}) · ${Math.round(r.K)} kcal (${dif(r.K,4*T.p+4*T.h+9*T.g)})</p><p class="small">Mexer numa barra fixa esse alimento (🔒) e recalcula os outros. Verde = dentro de ±8%.</p><button class="pill" data-b="fav">⭐ Guardar favorito</button> <button class="pill" data-b="clr">Limpar</button>`)}
const fv=favs();if(fv.length)o+=card("Favoritos",fv.map((f,k)=>`<div style="display:flex;gap:6px;margin:4px 0"><button class="pill" style="flex:1;text-align:left" data-b="lf:${k}">${f.n}</button><button class="pill" data-b="df:${k}">✕</button></div>`).join(""));
o+=card("Adicionar alimentos",`<input id="mbq" placeholder="Procurar (ex.: massa, atum, ovo)" value="${S.mbq}" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;font-size:16px"><div>${MBF.map((f,i)=>[f,i]).filter(([f])=>!q||f.n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(q.normalize("NFD").replace(/[\u0300-\u036f]/g,""))).map(([f,i])=>`<button class="pill ${S.mbs.includes(i)?"on":""}" data-b="tg:${i}" style="margin:3px">${S.mbs.includes(i)?"✓ ":""}${f.n}</button>`).join("")}</div>`);
return o}
const _nutV=nutV;nutV=function(){if(S.meal>=0&&S.mb)return mbV();const h=_nutV();return S.meal>=0&&!S.grp?h.replace(/(<p class="big">[^<]*<\/p>)/,`$1<button class="pill on" data-b="open" style="width:100%;margin:6px 0 10px;padding:12px">🍽️ Montar refeição (vários alimentos)</button>`):h};
TABS.find(t=>t[0]==="comida")[2]=nutV;
document.addEventListener("click",e=>{const a=e.target.closest("[data-a]");if(a&&/^(meal|tab)/.test(a.dataset.a)){S.mb=false}
const b=e.target.closest("[data-b]");if(!b)return;const[k,v,g]=b.dataset.b.split(":");
if(k==="open"){S.mb=true;scrollTo(0,0)}else if(k==="close")S.mb=false;
else if(k==="tg"){const i=+v;if(S.mbs.includes(i)){S.mbs=S.mbs.filter(x=>x!==i);delete S.mbl[i]}else S.mbs.push(i)}
else if(k==="rm"){S.mbs=S.mbs.filter(x=>x!==+v);delete S.mbl[v]}
else if(k==="lock"){if(v in S.mbl)delete S.mbl[v];else S.mbl[v]=+g}
else if(k==="clr"){S.mbs=[];S.mbl={}}
else if(k==="fav"){const n=prompt("Nome do favorito:",S.mbs.map(i=>MBF[i].n).join(" + "));if(!n)return;const F=favs();F.push({n,f:S.mbs.map(i=>MBF[i].n)});localStorage.setItem(FKEY,JSON.stringify(F))}
else if(k==="lf"){S.mbs=favs()[+v].f.map(MBI).filter(i=>i>=0);S.mbl={}}
else if(k==="df"){const F=favs();F.splice(+v,1);localStorage.setItem(FKEY,JSON.stringify(F))}
render()});
document.addEventListener("input",e=>{if(e.target.id==="mbq"){S.mbq=e.target.value;const p=e.target.selectionStart;render();const m=document.getElementById("mbq");m.focus();m.setSelectionRange(p,p)}});
document.addEventListener("change",e=>{const s=e.target.dataset&&e.target.dataset.bs;if(s!=null){S.mbl[s]=+e.target.value;render()}});
render()}
