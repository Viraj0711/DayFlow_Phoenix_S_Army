(function(){
  const $ = sel=>document.querySelector(sel);
  const qs = (sel,root=document)=>root.querySelector(sel);

  // Simple storage helpers
  const loadUsers = ()=>JSON.parse(localStorage.getItem('df_users')||'[]');
  const saveUsers = u=>localStorage.setItem('df_users',JSON.stringify(u));
  const setCurrent = email=>localStorage.setItem('df_current',email);
  const getCurrent = ()=>localStorage.getItem('df_current');
  const clearCurrent = ()=>localStorage.removeItem('df_current');

  // UI sections
  const sections = {auth:$('#auth'),dashboard:$('#dashboard'),profile:$('#profile'),attendance:$('#attendance'),leave:$('#leave')};

  function show(section){
    Object.values(sections).forEach(s=>s.classList.add('hidden'));
    sections[section].classList.remove('hidden');
    // nav highlight
    document.getElementById('btn-logout').classList.toggle('hidden',!getCurrent());
  }

  // Auth flows
  $('#show-signup').addEventListener('click',()=>{$('#sign-in-form').classList.add('hidden');$('#sign-up-form').classList.remove('hidden');});
  $('#show-signin').addEventListener('click',()=>{$('#sign-up-form').classList.add('hidden');$('#sign-in-form').classList.remove('hidden');});

  $('#sign-up-form').addEventListener('submit',e=>{
    e.preventDefault();
    const empid = $('#su-empid').value.trim();
    const email = $('#su-email').value.trim().toLowerCase();
    const password = $('#su-password').value;
    const role = $('#su-role').value;
    const users = loadUsers();
    if(users.find(u=>u.email===email)){ $('#signup-error').textContent='Account already exists'; return; }
    const user = {empid,email,password,role,name:'Employee',phone:'',address:'',dept:'General',salary:'—',profilePic:''};
    users.push(user); saveUsers(users); setCurrent(email); renderApp();
  });

  $('#sign-in-form').addEventListener('submit',e=>{
    e.preventDefault();
    const email = $('#signin-email').value.trim().toLowerCase();
    const password = $('#signin-password').value;
    const user = loadUsers().find(u=>u.email===email && u.password===password);
    if(!user){ $('#signin-error').textContent='Invalid email or password'; return; }
    setCurrent(email); renderApp();
  });

  // Navigation
  $('#nav-dashboard').addEventListener('click',()=>show('dashboard'));
  $('#nav-profile').addEventListener('click',()=>{populateProfile(); show('profile')});
  $('#nav-attendance').addEventListener('click',()=>{renderAttendance(); show('attendance')});
  $('#nav-leave').addEventListener('click',()=>{renderLeaves(); show('leave')});
  $('#btn-logout').addEventListener('click',logout);
  $('#quick-logout').addEventListener('click',logout);

  function logout(){ clearCurrent(); show('auth'); }

  // Dashboard quick cards
  document.querySelectorAll('.card.action[data-target]').forEach(btn=>btn.addEventListener('click',e=>{
    const t = e.currentTarget.dataset.target; if(t==='profile') { populateProfile(); show('profile'); } else if(t==='attendance'){ renderAttendance(); show('attendance'); } else if(t==='leave'){ renderLeaves(); show('leave'); }
  }));

  // Profile
  function getUser(){ const email=getCurrent(); if(!email) return null; return loadUsers().find(u=>u.email===email); }
  function updateUser(data){ const users=loadUsers(); const idx=users.findIndex(u=>u.email===getCurrent()); if(idx<0) return; users[idx]=Object.assign(users[idx],data); saveUsers(users); }

  function populateProfile(){ const u=getUser(); if(!u){ show('auth'); return; }
    $('#p-name').textContent = u.name || '—';
    $('#p-empid').textContent = u.empid || '—';
    $('#p-email').textContent = u.email || '—';
    $('#p-phone').textContent = u.phone || '—';
    $('#p-address').textContent = u.address || '—';
    $('#p-role').textContent = u.role || '—';
    $('#p-dept').textContent = u.dept || '—';
    $('#p-salary').textContent = u.salary || '—';
    if(u.profilePic) $('#profile-pic').src = u.profilePic; else $('#profile-pic').src='';
  }

  $('#edit-profile').addEventListener('click',()=>{
    const u=getUser(); if(!u) return; // replace phone/address with inputs
    const phoneSpan = $('#p-phone'); const addrSpan = $('#p-address');
    const phoneInput = document.createElement('input'); phoneInput.value = u.phone || '';
    const addrInput = document.createElement('input'); addrInput.value = u.address || '';
    phoneSpan.replaceWith(phoneInput); addrSpan.replaceWith(addrInput);
    phoneInput.id='p-phone'; addrInput.id='p-address';
    $('#edit-profile').classList.add('hidden'); $('#save-profile').classList.remove('hidden');
  });

  $('#save-profile').addEventListener('click',()=>{
    const phone = $('#p-phone').value; const address = $('#p-address').value;
    updateUser({phone,address}); $('#profile-msg').textContent='Profile saved'; setTimeout(()=>$('#profile-msg').textContent='',2000);
    // re-render
    populateProfile(); $('#save-profile').classList.add('hidden'); $('#edit-profile').classList.remove('hidden');
  });

  // Profile picture
  $('#edit-pic').addEventListener('click',()=>$('#profile-pic-input').click());
  $('#profile-pic-input').addEventListener('change',e=>{
    const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = ()=>{ updateUser({profilePic:r.result}); populateProfile(); }; r.readAsDataURL(f);
  });

  // Attendance
  function attendanceKey(){ return 'attendance_'+getCurrent(); }
  function loadAttendance(){ return JSON.parse(localStorage.getItem(attendanceKey())||'{}'); }
  function saveAttendance(a){ localStorage.setItem(attendanceKey(),JSON.stringify(a)); }

  $('#btn-checkin').addEventListener('click',()=>{
    const today = new Date().toISOString().slice(0,10); const a=loadAttendance(); if(!a[today]) a[today]={}; a[today].checkin = new Date().toLocaleTimeString(); saveAttendance(a); renderAttendance();
  });
  $('#btn-checkout').addEventListener('click',()=>{
    const today = new Date().toISOString().slice(0,10); const a=loadAttendance(); if(!a[today]) a[today]={}; a[today].checkout = new Date().toLocaleTimeString(); saveAttendance(a); renderAttendance();
  });

  function renderAttendance(){ const a=loadAttendance(); const today = new Date(); $('#today-date').textContent = today.toDateString(); const key = today.toISOString().slice(0,10); $('#checkin-time').textContent = (a[key] && a[key].checkin) ? a[key].checkin : '—'; $('#checkout-time').textContent = (a[key] && a[key].checkout) ? a[key].checkout : '—';
    const list = $('#weekly-list'); list.innerHTML='';
    for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.toISOString().slice(0,10); const item=document.createElement('li'); const ci=(a[k] && a[k].checkin)?a[k].checkin:'—'; const co=(a[k] && a[k].checkout)?a[k].checkout:'—'; item.textContent = `${d.toDateString()} — In: ${ci} Out: ${co}`; list.appendChild(item);} }

  // Leaves
  function leavesKey(){ return 'leaves_'+getCurrent(); }
  function loadLeaves(){ return JSON.parse(localStorage.getItem(leavesKey())||'[]'); }
  function saveLeaves(l){ localStorage.setItem(leavesKey(),JSON.stringify(l)); }

  $('#leave-form').addEventListener('submit',e=>{
    e.preventDefault(); const type=$('#leave-type').value; const start=$('#leave-start').value; const end=$('#leave-end').value; const remarks=$('#leave-remarks').value;
    if(!start||!end||new Date(start)>new Date(end)){ alert('Please enter a valid date range'); return; }
    const leaves = loadLeaves(); leaves.push({id:Date.now(),type,start,end,remarks,status:'Pending'}); saveLeaves(leaves); renderLeaves();
  });

  function renderLeaves(){ const list = $('#leave-list'); list.innerHTML=''; const leaves = loadLeaves(); if(leaves.length===0){ list.innerHTML='<li class="note">No requests</li>'; return; }
    leaves.slice().reverse().forEach(l=>{ const li=document.createElement('li'); li.innerHTML = `<strong>${l.type}</strong> — ${l.start} to ${l.end} — <em>${l.status}</em><div class="muted">${l.remarks||''}</div>`; list.appendChild(li); }); }

  // App render
  function renderApp(){ const cur=getCurrent(); if(!cur){ show('auth'); return; } show('dashboard'); populateProfile(); renderAttendance(); renderLeaves(); }

  // Initialize top nav buttons that should go to sections
  document.querySelectorAll('.nav-btn').forEach(b=>{ if(b.id.startsWith('nav-')) b.addEventListener('click',()=>{ const id=b.id.replace('nav-',''); if(id in sections){ if(id==='profile') populateProfile(); if(id==='attendance') renderAttendance(); if(id==='leave') renderLeaves(); show(id);} }); });

  // Start
  renderApp();
})();
