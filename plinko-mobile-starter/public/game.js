(function(){
  const W = window.innerWidth, H = window.innerHeight;

  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#08101a',
    physics: {
      default: 'matter',
      matter: {
        gravity: { y: 1.1 },
        enableSleep: true
      }
    },
    scene: { preload, create, update }
  };

  let scene, world, ground, bins=[], pegs=[], ball=null, dropping=false, binSensors=[];

  const PEG_RADIUS = 6;
  const BALL_RADIUS = 8;
  let ROWS = 12;
  let LAYOUT = 'regular';

  function preload(){}
  function create(){
    scene = this;
    world = scene.matter.world;
    // edges
    const thick = 50;
    scene.matter.add.rectangle(W/2, H+thick/2, W, thick, { isStatic: true, label:'floor' });
    scene.matter.add.rectangle(-thick/2, H/2, thick, H, { isStatic: true, label:'wall' });
    scene.matter.add.rectangle(W+thick/2, H/2, thick, H, { isStatic: true, label:'wall' });
    // bins line (sensor rectangles)
    buildBoard(ROWS, LAYOUT);
    // collisions
    world.on('collisionstart', (ev)=>{
      for (const p of ev.pairs){
        if (p.bodyA.isSensor && p.bodyA.label.startsWith('bin:')) onBin(p.bodyA);
        if (p.bodyB.isSensor && p.bodyB.label.startsWith('bin:')) onBin(p.bodyB);
      }
    });

    window.Plinko = {
      dropBall,
      rebuild: (rows, layout)=>{
        ROWS = rows; LAYOUT = layout||'regular';
        rebuildBoard();
      },
      simulate: simulateOutcome
    };
  }
  function update(){}

  function rebuildBoard(){
    // clear old
    for (const pg of pegs){ pg.destroy(); }
    for (const b of binSensors){ b.gameObject?.destroy(); }
    pegs.length=0; bins.length=0; binSensors.length=0;
    buildBoard(ROWS, LAYOUT);
  }

  function buildBoard(rows, layout){
    const top = 110;
    const bottom = H-120;
    const left = 40, right = W-40;
    const width = right-left;
    const vspace = (bottom-top)/rows;
    const hspace = Math.min(36, width/rows);

    // pegs in triangular grid
    for (let r=0;r<rows;r++){
      const cols = r+1;
      for (let c=0;c<cols;c++){
        let x = left + (width/rows)*c + (width/rows)*(rows-cols)/2;
        let y = top + r*vspace;
        if (layout==='offset' && r%2===1) x+= (hspace*0.5);
        if (layout==='sparse' && (r%2===1) && (c%2===1)) continue;
        const peg = scene.add.circle(x, y, PEG_RADIUS, 0x1e2a3a).setStrokeStyle(1,0x345);
        scene.matter.add.gameObject(peg, { isStatic: true, restitution: 0.6, label:'peg' });
        pegs.push(peg);
      }
    }

    // bin sensors: rows+1 bins is common
    const binsCount = rows+1;
    const binWidth = width / binsCount;
    for (let i=0;i<binsCount;i++){
      const x = left + (i+0.5)*binWidth;
      const y = bottom + 40;
      const rect = scene.add.rectangle(x, y, binWidth*0.9, 40, 0x000000, 0.0001);
      const body = scene.matter.add.gameObject(rect, { isStatic:true, isSensor:true, label:`bin:${i}` });
      binSensors.push(body);
      // visual labels
      const label = scene.add.text(x, bottom+60, `${i+1}`, { fontSize: '12px', color: '#9ec' }).setOrigin(0.5,0);
    }

    // side rails funnel
    scene.matter.add.rectangle(left-5, (top+bottom)/2, 10, bottom-top, { isStatic:true, angle: 0.08, label:'rail' });
    scene.matter.add.rectangle(right+5, (top+bottom)/2, 10, bottom-top, { isStatic:true, angle: -0.08, label:'rail' });

    // multiplier text overlay
    showMultipliers(rows);
  }

  function showMultipliers(rows){
    // clear old multiplier texts (naive: remove all texts except control labels)
    // For simplicity, we won't track and remove; overlay anyway.

    const risk = (window.getRisk?window.getRisk():'med');
    const mults = window.getPayoutRow(risk, rows);
    const left = 40, right = W-40;
    const bottom = H-120;
    const width = right-left;
    const binsCount = rows+1;
    const binWidth = width/binsCount;
    for (let i=0;i<binsCount;i++){
      const x = left + (i+0.5)*binWidth;
      const m = mults[Math.min(i, mults.length-1)];
      const color = m>=10 ? '#ffd166' : (m>=2 ? '#a0e8af' : '#b0b7c3');
      scene.add.text(x, bottom+78, `x${m.toFixed(2)}`, { fontSize:'13px', color }).setOrigin(0.5,0);
    }
  }

  function dropBall(opts){
    if (dropping) return;
    dropping=true;
    const rows = opts.rows||ROWS;
    const left = 40, right = W-40;
    const x = left + (right-left)*opts.xFrac;
    const y = 60;
    ball = scene.add.circle(x, y, BALL_RADIUS, 0x7fc8ff).setStrokeStyle(1,0x9de1ff);
    window.plink?.();
    const body = scene.matter.add.gameObject(ball, {
      restitution: 0.55,
      friction: 0.005,
      frictionAir: 0.0005,
      label:'ball'
    });
    ball.__meta = { bet:opts.bet, risk:opts.risk, rows:opts.rows };
  }

  function onBin(sensorBody){
    if (!ball) return;
    // determine index
    const label = sensorBody.label; // "bin:i"
    const idx = +label.split(':')[1];
    const rows = ball.__meta.rows;
    const risk = ball.__meta.risk;
    const mults = window.getPayoutRow(risk, rows);
    const mult = mults[Math.min(idx, mults.length-1)] || 0;
    const bet = ball.__meta.bet;
    const win = Math.floor(bet * mult);
    scene.time.delayedCall(50, ()=>{
      window.onPlinkoResult?.({mult, bet, win, index: idx, bins: rows+1});
      if (win>0) window.chaChing?.();
      ball.destroy(); ball=null; dropping=false;
    });
  }

  // For multiplayer simulate-only outcome (no physics)
  function simulateOutcome({bet, risk, rows}){
    const mults = window.getPayoutRow(risk, rows);
    // sample index from a binomial-like distribution using sum of uniforms
    const n = rows;
    let s=0, k=5; // higher k => tighter center
    for(let i=0;i<k;i++) s += Math.random();
    const frac = s/k; // [0,1] approx normal-ish
    const idx = Math.max(0, Math.min(rows, Math.floor(frac*(rows+1))));
    const mult = mults[Math.min(idx, mults.length-1)] || 0;
    const win = Math.floor(bet * mult);
    return {mult, win, index:idx, bins:rows+1};
  }

})();