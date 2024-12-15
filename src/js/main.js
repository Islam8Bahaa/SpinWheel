const sectors = [
  { color: "#FFFF33", text: "#000", label: "Pest Control 40%" },
  { color: "#000", text: "#ffff33", label: "Beauty Voucher 20%" },
  { color: "#FFFF33", text: "#000", label: "House Keeping 10%" },
  { color: "#000", text: "#ffff33", label: "Plumber Voucher 10%" },
  { color: "#FFFF33", text: "#000", label: "Electricity 10%" },
  { color: "#000", text: "#ffff33", label: "AC Voucher 10%" },
  { color: "#FFFF33", text: "#000", label: "Car Wash 15%" },
  { color: "#000", text: "#ffff33", label: "Salon Voucher 20%" },
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
      if (this.listeners[eventName]) {
          for (let fn of this.listeners[eventName]) {
              fn(...args);
          }
      }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991; // Friction to slow down
let angVel = 0; // Angular velocity
let ang = 0; // Angle
let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

// Draw a single wheel sector
function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // Draw Sector Color
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  

  // Add Sector Text
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "end";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 20px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad - 35, 10);
  ctx.restore();

  // Add Lamp
  drawLamp(sector.color, ang + arc / 2);
}

// Draw Lamp Based on Sector Color
function drawLamp(sectorColor, lampAngle) {
  const lampRadius = rad - 20; // Distance from the center
  const x = rad + Math.cos(lampAngle) * lampRadius;
  const y = rad + Math.sin(lampAngle) * lampRadius;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, TAU); // Lamp size

  // Conditional Lamp Color
  if (sectorColor === "#000") {
      ctx.fillStyle = "#FFCC00"; // Yellow lamp for black sector
      ctx.shadowColor = "rgba(255, 204, 0, 0.8)"; // Yellow glow
  } else {
      ctx.fillStyle = "#000"; // Black lamp for yellow sector
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // Black glow
  }

  ctx.shadowBlur = 15; // Glow effect
  ctx.fill();
  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "SPIN" : sector.label;
  spinEl.style.background = sector.color;
  spinEl.style.color = sector.text;
}

function frame() {
  if (!angVel && spinButtonClicked) {
    // Snap to the center of the sector
    const finalSectorIndex = getIndex();
    const targetAngle = TAU - (finalSectorIndex * arc + arc / 2); // Center angle of the sector
    const difference = (targetAngle - ang) % TAU;

    // Smoothly adjust angle to center sector
    ang += difference;
    ang %= TAU;

    const finalSector = sectors[finalSectorIndex];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false;
    return;
  }

  // Continue spinning
  angVel *= friction;
  if (angVel < 0.002) angVel = 0;
  ang += angVel;
  ang %= TAU;
  rotate();
}


function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate();
  engine();

  spinEl.addEventListener("click", () => {
      if (!angVel) angVel = rand(0.25, 0.45);
      spinButtonClicked = true;
  });
}

init();

events.addListener("spinEnd", (sector) => {
  console.log(`Congratulations! You won ${sector.label}`);
});


document.addEventListener("DOMContentLoaded", () => {
  const inputModal = new bootstrap.Modal(document.getElementById("inputModal"), {
      backdrop: "static",
      keyboard: false,
  });

  const resultModal = new bootstrap.Modal(document.getElementById("resultModal"), {
      backdrop: "static",
      keyboard: false,
  });

  const resultText1 = document.getElementById("resultText1");
  const resultText2 = document.getElementById("resultText2");
  const resultText3 = document.getElementById("resultText3");
  const userForm = document.getElementById("userForm");
  // let userDetails = null;
  // let hasSpun = false;

  // // Check if a token already exists in localStorage
  // const savedToken = localStorage.getItem("saveToken");
  // if (savedToken) {
  //     alert("You have already spun the wheel! Only one spin is allowed.");
  //     spinEl.style.pointerEvents = "none"; // Disable spin button
  //     return;
  // }

  // inputModal.show();

  // userForm.addEventListener("submit", (e) => {
  //     e.preventDefault();
  //     const randomToken = () => Math.random().toString(36).substring(2);
  //     const token = () => randomToken() + randomToken();
  //     localStorage.setItem("saveToken", token());

  //     const name = document.getElementById("name").value;
  //     const phone = document.getElementById("phone").value;
  //     userDetails = { name, phone };
  //     inputModal.hide();
  // });

  // spinEl.addEventListener("click", () => {
  //     if (!userDetails) {
  //         alert("Please fill in your details first.");
  //         return;
  //     }

  //     if (hasSpun) {
  //         alert("You can only spin once!");
  //         return;
  //     }

  //     if (!angVel) {
  //         angVel = rand(0.25, 0.45);
  //         spinButtonClicked = true;
  //         hasSpun = true;
  //     }
  // });

  // events.addListener("spinEnd", (sector) => {
  //     resultText1.textContent = `Name: ${userDetails.name}`;
  //     resultText2.textContent = `Phone: ${userDetails.phone}`;
  //     resultText3.textContent = `Prize: ${sector.label}`;
  //     resultModal.show();
  //     spinEl.style.pointerEvents = "none"; // Disable spin button
  // });
});
