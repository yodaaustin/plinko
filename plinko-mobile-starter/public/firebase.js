// Firebase hooks (optional). Disabled by default.
window.ENABLE_FIREBASE = false;

// Fill these if enabling:
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID",
};

(async function(){
  if(!window.ENABLE_FIREBASE) return;
  const script = document.createElement('script');
  script.src = "https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js";
  document.head.appendChild(script);
  await new Promise(r=>script.onload=r);

  const authScript = document.createElement('script');
  authScript.src = "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth-compat.js";
  document.head.appendChild(authScript);
  await new Promise(r=>authScript.onload=r);

  const dbScript = document.createElement('script');
  dbScript.src = "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore-compat.js";
  document.head.appendChild(dbScript);
  await new Promise(r=>dbScript.onload=r);

  // Init
  const app = firebase.initializeApp(FIREBASE_CONFIG);
  const db = firebase.firestore();
  const auth = firebase.auth();

  // Anonymous sign-in
  try { await auth.signInAnonymously(); } catch(e){ console.warn(e); }

  // Leaderboard example functions
  window.submitScore = async function(amount){
    const uid = auth.currentUser?.uid || "anon";
    const ref = db.collection('leaderboard').doc(uid);
    await ref.set({
      uid,
      bestWin: firebase.firestore.FieldValue.increment(0), // ensure exists
      lastWin: amount,
      ts: firebase.firestore.FieldValue.serverTimestamp()
    }, {merge:true});
    // optionally update bestWin if needed
    await ref.update({
      bestWin: firebase.firestore.FieldValue.increment(0) // placeholder
    });
  };

  window.listenTopScores = function(handler){
    return db.collection('leaderboard').orderBy('lastWin','desc').limit(20)
      .onSnapshot(snap=>{
        const rows=[];
        snap.forEach(doc=>rows.push(doc.data()));
        handler(rows);
      });
  };

})();
