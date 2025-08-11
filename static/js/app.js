// Simple front-end interactions: typing, confetti, Konami easter egg, and form send via fetch.
const typingEl = document.getElementById('typing');
const revealBtn = document.getElementById('revealBtn');
const confettiBtn = document.getElementById('confettiBtn');
const secretBtn = document.getElementById('secretBtn');
const form = document.getElementById('appealForm');
const sentNotice = document.getElementById('sentNotice');
const saveLocal = document.getElementById('saveLocal');

const defaultLines = [
  "Eu sei que erramos.",
  "Sinto sua falta todos os dias.",
  "Se você olhar com o coração, ainda vai me ver lá.",
  "Volta pra mim?"
];

let currentText = defaultLines.join('\n\n');

function typeText(text, el, speed=25) {
  el.textContent = '';
  let i = 0;
  const id = setInterval(()=> {
    el.textContent += text[i] || '';
    i++;
    if (i >= text.length) clearInterval(id);
  }, speed);
}

revealBtn.addEventListener('click', ()=> {
  typeText(currentText, typingEl, 18);
});

confettiBtn.addEventListener('click', ()=> {
  // burst confetti in multiple bursts
  for (let i=0;i<5;i++){
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: Math.random(), y: Math.random() * 0.6 }
    });
  }
});

secretBtn.addEventListener('click', ()=> {
  currentText = "Se você leu até aqui, saiba que ainda te amo. ❤️";
  typeText(currentText, typingEl, 14);
});

// Konami code detection
const konami = [38,38,40,40,37,39,37,39,66,65];
let kpos = 0;
window.addEventListener('keydown', (e)=>{
  if (e.keyCode === konami[kpos]) {
    kpos++;
    if (kpos === konami.length) {
      currentText = "EASTER EGG: Você encontrou o código. Me dá mais uma chance?";
      typeText(currentText, typingEl, 14);
      confetti({particleCount: 200, spread: 160});
      kpos = 0;
    }
  } else kpos = 0;
});

// Form submit -> POST /send
form.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const name = document.getElementById('name').value || 'Anônimo';
  const message = document.getElementById('message').value || '';
  // quick UI animation
  typeText("Enviando seu pedido...", typingEl, 10);
  try {
    const res = await fetch('/send', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({name, message})
    });
    const data = await res.json();
    if (data.success) {
      sentNotice.textContent = "Pedido enviado com sucesso. Um registro foi salvo no servidor.";
      sentNotice.classList.remove('hidden');
      confetti({particleCount:150, spread:120});
      typeText("Pedido guardado. Obrigado por ser honesto.", typingEl, 18);
    } else {
      sentNotice.textContent = "Erro ao enviar: " + (data.error || 'desconhecido');
      sentNotice.classList.remove('hidden');
    }
  } catch(err){
    sentNotice.textContent = "Erro de rede: " + err.message;
    sentNotice.classList.remove('hidden');
  }
});

// Save to localStorage
saveLocal.addEventListener('click', ()=>{
  const name = document.getElementById('name').value || '';
  const message = document.getElementById('message').value || '';
  localStorage.setItem('volta_name', name);
  localStorage.setItem('volta_message', message);
  saveLocal.textContent = 'Salvo!';
  setTimeout(()=> saveLocal.textContent = 'Salvar local', 1500);
});

// Matrix-like canvas background
(function matrix(){
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
  window.addEventListener('resize', resize);
  resize();
  const cols = Math.floor(canvas.width / 14);
  const drops = Array(cols).fill(0);
  const letters = "アカサタナハマヤラワABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  function draw(){
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = "12px monospace";
    for (let i=0;i<drops.length;i++){
      const text = letters.charAt(Math.floor(Math.random()*letters.length));
      ctx.fillStyle = "rgba(0,255,140,0.06)";
      ctx.fillText(text, i*14, drops[i]*14);
      drops[i]++;
      if (drops[i]*14 > canvas.height || Math.random()>0.98) drops[i]=0;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
