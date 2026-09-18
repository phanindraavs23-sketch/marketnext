const { createClient } = window.supabase;
const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
let period = "all";
let selectedCategory = "";

const $ = id => document.getElementById(id);
const initials = n => (n || "?").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);

async function loadLeaderboard(){
  let q = sb.from("profiles").select("id,display_name,website,total_contribution,created_at,category_id,state,city,country,categories(name,slug)").eq("is_public",true).order("total_contribution",{ascending:false}).limit(50);
  if(selectedCategory) q = q.eq("categories.slug", selectedCategory);
  if(period==="today") q = q.gte("updated_at", new Date(new Date().setHours(0,0,0,0)).toISOString());
  const {data,error}=await q;
  if(error){ $("rows").innerHTML=`<div class="loading">Connect Supabase to load the leaderboard.</div>`; return; }
  const list=data||[];
  renderPodium(list.slice(0,3));
  $("rows").innerHTML=list.length?list.map((p,i)=>`
    <div class="row">
      <span>${i<3?["🥇","🥈","🥉"][i]:i+1}</span>
      <span class="user"><span class="mini">${initials(p.display_name)}</span>${escapeHtml(p.display_name||"Anonymous")}</span>
      <strong>${money(p.total_contribution||0)}</strong>
      <a class="url" href="${safeUrl(p.website)}" target="_blank" rel="noopener">${escapeHtml(p.website||"—")}</a><span class="location">${escapeHtml([p.city,p.state].filter(Boolean).join(", ")||"India")}</span>
      <button class="view" onclick="viewProfile('${p.id}')">View</button>
    </div>`).join(""):`<div class="loading">No public profiles yet. Create the first one.</div>`;
}

function renderPodium(top){
  const names=["#2","#1","#3"];
  const ordered=[top[1],top[0],top[2]];
  $("podium").innerHTML=ordered.map((p,i)=>p?`<div class="person ${i===1?"first":i===0?"second":"third"}">
    <div class="avatar">${initials(p.display_name)}</div><strong>${escapeHtml(p.display_name)}</strong>
    <div class="money">${money(p.total_contribution||0)}</div><b>${names[i]}</b>
  </div>`:"").join("");
}

async function viewProfile(id){
  const {data}=await sb.from("profiles").select("display_name,website,total_contribution").eq("id",id).single();
  if(data && data.website) window.open(safeUrl(data.website),"_blank","noopener");
}
function safeUrl(u){if(!u)return "#"; try{const x=new URL(u);return ["http:","https:"].includes(x.protocol)?x.href:"#"}catch{return "#"}}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

async function loadCategories(){
  const {data,error}=await sb.from("categories").select("id,name,slug").order("sort_order");
  if(error) return;
  const select=$("category");
  if(select) select.innerHTML='<option value="">Choose a category</option>'+((data||[]).map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join(""));
}

function openAuth(mode="signup"){
  $("authModal").classList.remove("hidden"); $("authTitle").textContent=mode==="signup"?"Create account":"Login";
  $("authSubmit").textContent=mode==="signup"?"Sign Up":"Login"; $("displayName").style.display=mode==="signup"?"block":"none"; $("website").style.display=mode==="signup"?"block":"none";
  $("switchAuth").textContent=mode==="signup"?"Already have an account? Login":"Need an account? Sign Up"; $("authModal").dataset.mode=mode; $("authMsg").textContent="";
}
$("signupBtn").onclick=()=>openAuth("signup"); $("loginBtn").onclick=()=>openAuth("login"); $("heroStart").onclick=()=>openAuth("signup"); $("closeModal").onclick=()=>$("authModal").classList.add("hidden");
$("switchAuth").onclick=()=>openAuth($("authModal").dataset.mode==="signup"?"login":"signup");

$("authSubmit").onclick=async()=>{
  const mode=$("authModal").dataset.mode, email=$("email").value.trim(), password=$("password").value, name=$("displayName").value.trim(), website=$("website").value.trim(), category_id=$("category").value ? Number($("category").value) : null;
  $("authMsg").textContent="Working…";
  if(mode==="signup"){
    const {data,error}=await sb.auth.signUp({email,password});
    if(error){$("authMsg").textContent=error.message;return}
    if(data.user){const {error:e}=await sb.from("profiles").insert({id:data.user.id,display_name:name||email.split("@")[0],website:website||null,category_id}); if(e) $("authMsg").textContent=e.message;}
    $("authMsg").textContent="Account created. Check your email if confirmation is enabled.";
  }else{
    const {error}=await sb.auth.signInWithPassword({email,password}); $("authMsg").textContent=error?error.message:"Logged in.";
    if(!error){currentUser=(await sb.auth.getUser()).data.user; setTimeout(()=>{$("authModal").classList.add("hidden");loadLeaderboard()},300)}
  }
};

$("plus").onclick=()=>{$("amount").value=Number($("amount").value||0)+50};
$("minus").onclick=()=>{$("amount").value=Math.max(1,Number($("amount").value||0)-50)};
$("marketBtn").onclick=()=>{ window.location.href="checkout.html"; };
loadCategories();
const urlCategory=new URLSearchParams(location.search).get("category");
if(urlCategory) selectedCategory=urlCategory;
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{loadCategories();
const urlCategory=new URLSearchParams(location.search).get("category");
if(urlCategory) selectedCategory=urlCategory;
document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");period=b.dataset.period;loadLeaderboard()});

loadLeaderboard();