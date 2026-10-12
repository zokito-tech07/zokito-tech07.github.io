import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue, onDisconnect, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase konsolundan kopyaladığın ayarları buraya yapıştır (admin.html'dekiyle aynı)
const firebaseConfig = {
  apiKey: "AIzaSyCCZx8cYo9SGqGtUUtjYJaeZnVgCWFnLzw",
  authDomain: "zokito-502db.firebaseapp.com",
  databaseURL: "https://zokito-502db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zokito-502db",
  appId: "1:808914509103:web:be593284a1ba5da37d55da"
};

const db = getDatabase(initializeApp(firebaseConfig));

const tag = document.querySelector('script[src$="tracker.js"]');
const game = ((tag && tag.dataset.game) || 'anasayfa').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'anasayfa';

let vid = localStorage.getItem('vid');
if (!vid) {
  vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('vid', vid);
}

// Online: bağlanınca kayıt eklenir, sekme kapanınca sunucu kaydı kendisi siler
const node = push(ref(db, 'online'));
onValue(ref(db, '.info/connected'), (snap) => {
  if (snap.val() === true) {
    onDisconnect(node).remove().then(() => set(node, { v: vid, game }));
  }
});

// Sayaçlar
const bump = (path) => set(ref(db, path), increment(1)).catch(() => {});

if (!sessionStorage.getItem('visited')) {
  sessionStorage.setItem('visited', '1');
  bump('stats/total');                       // toplam giriş
}
if (!localStorage.getItem('seen')) {
  localStorage.setItem('seen', '1');
  bump('stats/unique');                      // farklı ziyaretçi
}
if (game !== 'anasayfa') {
  bump('stats/games/' + game + '/plays');    // oyun açılma
  if (!localStorage.getItem('p_' + game)) {
    localStorage.setItem('p_' + game, '1');
    bump('stats/games/' + game + '/players'); // oyunu oynayan farklı kişi
  }
}
