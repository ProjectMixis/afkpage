const timeEl = document.getElementById("time");
const statusEl = document.getElementById("status");
const bg = document.querySelector(".background");
const light = document.querySelector(".light-overlay");

/* ========================
   Audio
======================== */
const morningSound = new Audio("audio/morning.mp3");
morningSound.volume = 0.2;

let audioUnlocked = false;
let morningPlayedToday = false;

function unlockAudio() {
  if (!audioUnlocked) {
    morningSound.play().then(() => {
      morningSound.pause();
      morningSound.currentTime = 0;
      audioUnlocked = true;
    }).catch(() => {});
  }
}

window.addEventListener("click", unlockAudio);
window.addEventListener("keydown", unlockAudio);

/* ========================
   Clock & Time Phase
======================== */
function updateClock() {
  const now = new Date();

  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");

  timeEl.textContent = `${h}:${m}:${s}`;
  applyTimePhase(now.getHours());

  if (
    now.getHours() === 6 &&
    now.getMinutes() === 0 &&
    now.getSeconds() < 2 &&
    audioUnlocked &&
    !morningPlayedToday
  ) {
    morningSound.play();
    morningPlayedToday = true;

    document.body.style.filter = "brightness(1.08)";
    setTimeout(() => {
      document.body.style.filter = "brightness(1)";
    }, 4000);
  }

  if (now.getHours() === 0 && now.getMinutes() === 0) {
    morningPlayedToday = false;
  }
}

setInterval(updateClock, 1000);
updateClock();

function applyTimePhase(hour) {
  if (hour >= 6 && hour < 12) {
    bg.style.filter = "blur(2.4px) saturate(0.9) contrast(0.98) brightness(1)";
    light.style.opacity = 1;
    statusEl.textContent = "morning";

  } else if (hour >= 12 && hour < 18) {
    bg.style.filter = "blur(2.5px) saturate(0.85) contrast(0.97) brightness(0.99)";
    light.style.opacity = 0.9;
    statusEl.textContent = "day";

  } else if (hour >= 18 && hour < 23) {
    bg.style.filter = "blur(2.8px) saturate(0.8) contrast(0.95) brightness(0.97)";
    light.style.opacity = 0.75;
    statusEl.textContent = "evening";

  } else {
    bg.style.filter = "blur(3px) saturate(0.7) contrast(0.92) brightness(0.95)";
    light.style.opacity = 0.6;
    statusEl.textContent = "late";
  }
}

/* ========================
   Breathing Effect
======================== */
let breath = 1;
let breathSpeed = 0.0003;
let breathDirection = 1;

function breathe() {
  breath += breathDirection * breathSpeed;

  if (breath > 1.003 || breath < 0.997) {
    breathDirection *= -1;
  }

  document.documentElement.style.setProperty("--breath-scale", breath);

  const scaleAmount = 1.05 + (breath - 1) * 1.5;
  const blurAmount = 2.5 + (breath - 1) * 8;

  bg.style.transform = `scale(${scaleAmount})`;
  bg.style.filter = `blur(${blurAmount}px) saturate(0.85) contrast(0.97) brightness(0.99)`;

  requestAnimationFrame(breathe);
}
breathe();

/* ========================
   Micro Shake
======================== */
let shakeEnabled = true;

setInterval(() => {
  if (!shakeEnabled) return;

  const x = (Math.random() - 0.5) * 0.4;
  const y = (Math.random() - 0.5) * 0.4;

  document.documentElement.style.setProperty("--shift-x", `${x}px`);
  document.documentElement.style.setProperty("--shift-y", `${y}px`);
}, 3000);

/* ========================
   Idle Detection (Real Time)
======================== */
let lastInteraction = Date.now();
let slowed = false;
let whisperShown = false;

function resetIdle() {
  lastInteraction = Date.now();
  slowed = false;
  whisperShown = false;
  shakeEnabled = true;
  breathSpeed = 0.0003;
  document.body.style.filter = "brightness(1)";
}

["mousemove", "keydown", "click"].forEach(event => {
  window.addEventListener(event, resetIdle);
});

function handleIdleEffects() {
  const idleTime = Math.floor((Date.now() - lastInteraction) / 1000);

  if (idleTime > 60 && idleTime < 180) {
    statusEl.textContent = "idle";
  }

  if (idleTime > 180) {
    document.body.style.filter = "brightness(0.97)";
  }

  if (idleTime > 300 && !slowed) {
    breathSpeed = 0.00015;
    slowed = true;
  }

  if (idleTime > 480) {
    shakeEnabled = false;
  }

  if (idleTime > 720 && !whisperShown) {
    showWhisper();
    whisperShown = true;
  }
}

setInterval(handleIdleEffects, 1000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    handleIdleEffects();
  }
});

/* ========================
   Whisper
======================== */
function showWhisper() {
  const whisper = document.createElement("div");
  whisper.textContent = "still here";
  whisper.style.position = "fixed";
  whisper.style.bottom = "20%";
  whisper.style.right = "15%";
  whisper.style.opacity = "0.03";
  whisper.style.fontSize = "1rem";
  whisper.style.letterSpacing = "0.3em";
  whisper.style.pointerEvents = "none";
  whisper.style.transition = "opacity 1s ease";

  document.body.appendChild(whisper);

  setTimeout(() => {
    whisper.style.opacity = "0";
    setTimeout(() => whisper.remove(), 2000);
  }, 1200);
}
