(function(){
  if(!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return;
  const {createClient}=window.supabase;
  const client=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  let visitorId=localStorage.getItem("marketrank_visitor_id");
  if(!visitorId){ visitorId=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()); localStorage.setItem("marketrank_visitor_id",visitorId); }
  const page=location.pathname.split('/').pop() || 'index.html';
  const ua=navigator.userAgent||'';
  const device=/Mobi|Android|iPhone|iPad/i.test(ua)?'mobile':/Tablet/i.test(ua)?'tablet':'desktop';
  client.from('visitors').insert({
    visitor_id:visitorId,page,referrer:document.referrer||null,device_type:device,
    language:navigator.language||null,screen_width:screen.width||null,screen_height:screen.height||null
  }).then(()=>{}).catch(()=>{});
  const countEl=document.getElementById('visitorCount');
  if(countEl){
    client.from('visitors').select('visitor_id',{count:'exact',head:true}).then(({count})=>{
      if(typeof count==='number') countEl.textContent='Visitors: '+count.toLocaleString('en-IN');
    });
  }
})();