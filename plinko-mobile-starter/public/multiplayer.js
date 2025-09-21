(function(){
  const SOCKET_URL = localStorage.getItem('pl_socket') || 'http://localhost:3001';
  let socket=null, joined=false, room=null;

  function log(s){
    const el = document.getElementById('log');
    el.textContent = s + "\n" + el.textContent;
  }

  function joinRoom(r){
    if (socket) socket.disconnect();
    socket = io(SOCKET_URL, {transports:['websocket']});
    socket.on('connect', ()=>{
      socket.emit('join', {room:r});
    });
    socket.on('joined', (data)=>{
      joined=true; room=r;
      document.getElementById('players').textContent = data.count;
      log(`Joined ${r}. Players: ${data.count}`);
    });
    socket.on('count', (data)=>{
      document.getElementById('players').textContent = data.count;
    });
    socket.on('drop', (data)=>{
      log(`Opponent dropped: bet ${data.bet}, result x${data.mult.toFixed(2)} -> $${data.win.toFixed(2)}`);
    });
  }

  document.getElementById('join').addEventListener('click', ()=>{
    const r = document.getElementById('room').value.trim() || 'room-123';
    joinRoom(r);
  });
  document.getElementById('drop').addEventListener('click', ()=>{
    if(!socket||!room){ log('Join a room first.'); return; }
    const bet = Math.max(1, +document.getElementById('bet').value||0);
    // Reuse single-player outcome calc if present:
    if (window.Plinko && window.Plinko.simulate){
      const res = window.Plinko.simulate({
        bet,
        risk: (window.getRisk?window.getRisk():'med'),
        rows: (window.getRows?window.getRows():12)
      });
      socket.emit('drop', {...res, bet});
      log(`You dropped: x${res.mult.toFixed(2)} -> $${res.win.toFixed(2)}`);
    } else {
      // fallback random
      const mult = Math.random()<0.05?50:(Math.random()<0.25?2:0.5);
      const win = bet*mult;
      socket.emit('drop', {mult,win,bet});
      log(`You dropped: x${mult.toFixed(2)} -> $${win.toFixed(2)}`);
    }
  });

  // expose config setter
  window.setSocketURL = function(url){
    localStorage.setItem('pl_socket', url);
  };
})();
