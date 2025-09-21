// Simple utility & UI glue
(function(){
  const fmtUSD = (n)=>"$"+n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  window.fmtUSD = fmtUSD;
  const balanceEl = document.getElementById('balance');
  const betEl = document.getElementById('bet');
  const riskEl = document.getElementById('risk');
  const rowsEl = document.getElementById('rows');
  const rowsValEl = document.getElementById('rowsVal');
  const layoutEl = document.getElementById('layout');
  const dropXEl = document.getElementById('dropX');
  const dropBtn = document.getElementById('dropBtn');
  const autoBtn = document.getElementById('autoBtn');
  const stopAutoBtn = document.getElementById('stopAutoBtn');
  const duelBtn = document.getElementById('duelBtn');
  const msgEl = document.getElementById('msg');
  const dailyBtn = document.getElementById('dailyBtn');
  const resetBtn = document.getElementById('resetBtn');
  const histEl = document.getElementById('history');

  let balance = +localStorage.getItem('pl_balance') || 10000;
  let auto = false;

  function setBalance(v){
    balance = Math.max(0, v);
    localStorage.setItem('pl_balance', balance);
    balanceEl.textContent = fmtUSD(balance);
  }
  setBalance(balance);

  rowsEl.addEventListener('input', ()=>{
    rowsValEl.textContent = rowsEl.value;
    window.Plinko?.rebuild(+rowsEl.value, layoutEl.value);
  });
  layoutEl.addEventListener('change', ()=>{
    window.Plinko?.rebuild(+rowsEl.value, layoutEl.value);
  });

  // Daily bonus: once per 24h
  dailyBtn.addEventListener('click', ()=>{
    const key='pl_daily';
    const now=Date.now();
    const last=+localStorage.getItem(key) || 0;
    if(now-last<23*60*60*1000){ // ~23h guard
      const left = Math.ceil((23*60*60*1000 - (now-last))/1000/60);
      msgEl.textContent = `Daily already claimed. Try again in ~${left} min.`;
      return;
    }
    const bonus = Math.floor(500 + Math.random()*500); // $500-1000
    setBalance(balance + bonus);
    localStorage.setItem(key, String(now));
    msgEl.textContent = `Daily bonus awarded: ${fmtUSD(bonus)} — have fun!`;
  });

  resetBtn.addEventListener('click', ()=>{
    setBalance(10000);
    msgEl.textContent = 'Balance reset.';
  });

  dropBtn.addEventListener('click', ()=>{
    const bet = Math.max(1, Math.floor(+betEl.value||0));
    if (bet>balance){ msgEl.textContent='Not enough balance.'; return;}
    setBalance(balance - bet);
    const xFrac = +dropXEl.value;
    window.Plinko?.dropBall({bet, risk:riskEl.value, rows:+rowsEl.value, xFrac, layout:layoutEl.value});
  });

  autoBtn.addEventListener('click', ()=>{
    auto = true;
    msgEl.textContent = 'Auto dropping...';
    (function loop(){
      if(!auto) return;
      dropBtn.click();
      setTimeout(loop, 900);
    })();
  });
  stopAutoBtn.addEventListener('click', ()=>{ auto=false; msgEl.textContent=''; });

  // Duel shortcut
  duelBtn.addEventListener('click', ()=>{
    window.open('./duel.html','_blank');
  });

  // History
  window.addHistory = function(text){
    const line = document.createElement('div');
    line.textContent = text;
    histEl.prepend(line);
    const kids = histEl.querySelectorAll('div');
    if (kids.length>200) kids[kids.length-1].remove();
  };

  // Result payout handler
  window.onPlinkoResult = function(data){
    // {mult, bet, win, index, bins}
    const win = data.win;
    if (win>0) setBalance(balance + win);
    const center = Math.floor(data.bins/2);
    const near = (data.index===center-1 || data.index===center+1);
    const nearMsg = near ? ' (near center!)' : '';
    addHistory(`Drop -> slot ${data.index+1}/${data.bins} x${data.mult.toFixed(2)} | Bet ${fmtUSD(data.bet)} -> Win ${fmtUSD(win)}${nearMsg}`);
    msgEl.textContent = win>0 ? `You won ${fmtUSD(win)}!` : `No luck this time.`;
  };

  // Simple sounds (using WebAudio API minimal bleeps)
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  function beep(freq=880, dur=0.05, vol=0.03){
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.frequency.value=freq; o.type='triangle';
    g.gain.value=vol;
    o.connect(g); g.connect(ctx.destination);
    o.start(); setTimeout(()=>{o.stop();}, dur*1000);
  }
  window.plink = ()=>beep(1200,0.02,0.02);
  window.chaChing = ()=>beep(700,0.12,0.05);

  // Expose some getters
  window.getBet = ()=>Math.max(1, Math.floor(+betEl.value||0));
  window.getRisk = ()=>riskEl.value;
  window.getRows = ()=>+rowsEl.value;
  window.getDropX = ()=>+dropXEl.value;
  window.getLayout = ()=>layoutEl.value;
})();
