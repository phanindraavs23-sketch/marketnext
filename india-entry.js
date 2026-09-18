
const INDIA_STATES = new Set(["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"]);

async function setupIndiaEntry(){
  const cat = document.getElementById("entryCategory");
  if(!cat) return;
  const {data,error}=await sb.from("categories").select("id,name").order("sort_order");
  if(!error) cat.innerHTML='<option value="">Choose a category</option>'+data.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  const form=document.getElementById("entryForm");
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const msg=document.getElementById("entryMsg");
    const name=document.getElementById("entryName").value.trim();
    const website=document.getElementById("entryWebsite").value.trim();
    const category_id=Number(cat.value);
    const state=document.getElementById("entryState").value;
    const city=document.getElementById("entryCity").value.trim();
    if(!INDIA_STATES.has(state)){msg.textContent="Please select a valid Indian state/UT.";return;}
    try{ new URL(website); }catch{msg.textContent="Enter a valid website URL.";return;}
    msg.textContent="Submitting…";
    const {error}=await sb.from("profiles").insert({
      display_name:name, website, category_id, country:"India", state, city, is_public:true, total_contribution:0
    });
    if(error){msg.textContent=error.message;return;}
    msg.textContent="Listing submitted successfully. You can now increase its rank through checkout.";
    form.reset(); document.getElementById("entryCountry").value="India";
    if(typeof loadLeaderboard==="function") loadLeaderboard();
  });
}
document.addEventListener("DOMContentLoaded", setupIndiaEntry);
