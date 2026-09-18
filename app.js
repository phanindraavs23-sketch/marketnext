const { createClient } = window.supabase;
const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
let period = "today";

const $ = id => document.getElementById(id);
const initials = n => (n || "?").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const safeUrl = u => { if(!u) return "#"; try { const x=new URL(u); return ["http:","https:"].includes(x.protocol)?x.href:"#"; } catch { return "#"; } };
const escapeHtml = s => String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function loadLeaderboard(){
  const rows = $("rows");
  if(!rows) return;
  let q = sb.from("profiles").select("id,display_name,website,total_contribution,created_at,state,city,country,categories!inner(name,slug)").eq("is_public",true).eq("country","India").order("total_contribution",{ascending:false}).limit(10);
  if(period === "today") q = q.gte("updated_at", new Date(new Date().setHours(0,0,0,0)).toISOString());
  const {data,error}=await q;
  if(error){ rows.innerHTML=`<div class="ranking-empty">Connect your Supabase project to load the leaderboard.</div>`; return; }
  const list=data||[];
  rows.innerHTML=list.length ? list.map((p,i)=>`
    <a class="ranking-row" href="${safeUrl(p.website)}" target="_blank" rel="noopener">
      <span class="rank-number">${i<3?["#1","#2","#3"][i]:"#"+(i+1)}</span>
      <span class="rank-avatar">${initials(p.display_name)}</span>
      <span class="rank-main"><strong>${escapeHtml(p.display_name||"Anonymous")}</strong><small>${escapeHtml(p.categories?.name||"Other")} · ${escapeHtml([p.city,p.state].filter(Boolean).join(", ")||"India")}</small></span>
      <span class="rank-amount">${money(p.total_contribution||0)}</span>
      <span class="rank-arrow">↗</span>
    </a>`).join("") : `<div class="ranking-empty">No Indian listings yet. Be the first to claim a rank.</div>`;

  const productCount=$("productCount"); if(productCount) productCount.textContent=list.length.toLocaleString("en-IN");
}

async function loadCategories(){
  const select=$("entryCategory");
  const count=$("categoryCount");
  const {data,error}=await sb.from("categories").select("id,name,slug").order("sort_order");
  if(error) return;
  if(select) select.innerHTML='<option value="">Choose a category</option>'+(data||[]).map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  if(count) count.textContent=(data||[]).length;
}

async function updateAmount(delta){
  const input=$("amount"); if(!input) return;
  input.value=Math.max(1,(Number(input.value)||0)+delta);
}

function setupClaimForm(){
  const form=$("claimForm"); if(!form) return;
  $("plus")?.addEventListener("click",()=>updateAmount(50));
  $("minus")?.addEventListener("click",()=>updateAmount(-50));
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const msg=$("claimMsg");
    const name=$("entryName").value.trim();
    const website=$("entryWebsite").value.trim();
    const category_id=Number($("entryCategory").value);
    const state=$("entryState").value;
    const city=$("entryCity").value.trim();
    const amount=Math.max(1,Number($("amount").value)||0);
    if(!name || !category_id || !state || !city){msg.textContent="Complete all India listing fields.";return;}
    try{new URL(website);}catch{msg.textContent="Enter a valid website or social profile URL.";return;}
    msg.textContent="Adding your listing…";
    const {data,error}=await sb.from("profiles").insert({display_name:name,website,country:"India",state,city,category_id,is_public:true,total_contribution:0}).select("id").single();
    if(error){msg.textContent=error.message;return;}
    sessionStorage.setItem("marketrank_profile_id",data.id);
    sessionStorage.setItem("marketrank_amount",String(amount));
    msg.innerHTML=`Listing added. <a href="checkout.html">Continue to checkout →</a>`;
    form.reset(); $("amount").value=amount;
    loadLeaderboard();
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  loadCategories();
  setupClaimForm();
  document.querySelectorAll(".period-switch button").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll(".period-switch button").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active"); period=btn.dataset.period; loadLeaderboard();
  }));
  loadLeaderboard();
});
