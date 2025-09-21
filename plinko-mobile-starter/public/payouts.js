// Example payout tables by risk + row count.
// Each entry is an array of multipliers from left-most bin to right-most bin.
// Ensure symmetry if desired; probabilities are physics-driven.
window.PAYOUTS = {
  low: {
    // 8..16 rows, approximate gentle variance
    8:  [0.9,0.95,1.0,1.05,1.05,1.0,0.95,0.9,],
    10: [0.8,0.9,1.0,1.2,1.3,1.2,1.0,0.9,0.8,0.7,],
    12: [0.6,0.8,0.9,1.0,1.2,1.3,1.3,1.2,1.0,0.9,0.8,0.6,],
    14: [0.5,0.7,0.85,0.95,1.05,1.2,1.3,1.2,1.05,0.95,0.85,0.7,0.6,0.5],
    16: [0.4,0.6,0.75,0.85,0.95,1.05,1.2,1.3,1.3,1.2,1.05,0.95,0.85,0.75,0.6,0.4]
  },
  med: {
    8:  [0.5,0.7,0.9,1.5,1.5,0.9,0.7,0.5],
    10: [0.4,0.6,0.9,1.2,2.0,1.2,0.9,0.6,0.4,0.3],
    12: [0.3,0.5,0.8,1.0,1.5,3.0,3.0,1.5,1.0,0.8,0.5,0.3],
    14: [0.25,0.4,0.7,0.9,1.2,2.0,4.0,2.0,1.2,0.9,0.7,0.4,0.3,0.25],
    16: [0.2,0.35,0.6,0.8,1.0,1.5,2.5,5.0,5.0,2.5,1.5,1.0,0.8,0.6,0.35,0.2]
  },
  high: {
    8:  [0.0,0.2,0.5,2.0,2.0,0.5,0.2,0.0],
    10: [0.0,0.1,0.3,0.7,3.0,3.0,0.7,0.3,0.1,0.0],
    12: [0.0,0.05,0.2,0.5,1.2,10,10,1.2,0.5,0.2,0.05,0.0],
    14: [0.0,0.02,0.1,0.3,0.8,2.0,25,50,25,2.0,0.8,0.3,0.1,0.02],
    16: [0.0,0.01,0.05,0.15,0.4,1.0,3.0,100,100,3.0,1.0,0.4,0.15,0.05,0.01,0.0]
  }
};

// Helper to fetch a row, clamping to nearest available set
window.getPayoutRow = function(risk, rows){
  const table = window.PAYOUTS[risk] || window.PAYOUTS.med;
  const avail = Object.keys(table).map(n=>+n).sort((a,b)=>a-b);
  let chosen = avail[0];
  for (const r of avail) if (r<=rows) chosen=r;
  return table[chosen];
};
