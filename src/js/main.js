const sectors = [
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets + Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "You lose" },
    { color: "#FFBC03", text: "#333333", label: "Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "Sweets" },
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
  
  const friction = 0.991; 
  let angVel = 0; 
  let ang = 0;
  
  let spinButtonClicked = false;
  
  const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;
  
  function drawSector(sector, i) {
    const ang = arc * i;
    ctx.save();
  
    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();
  
    // TEXT
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = sector.text;
    ctx.font = "bold 30px 'Lato', sans-serif";
    ctx.fillText(sector.label, rad - 10, 10);
    //
  
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
    // Fire an event after the wheel has stopped spinning
    if (!angVel && spinButtonClicked) {
      const finalSector = sectors[getIndex()];
      events.fire("spinEnd", finalSector);
      spinButtonClicked = false; // reset the flag
      return;
    }
  
    angVel *= friction; // Decrement velocity by friction
    if (angVel < 0.002) angVel = 0; // Bring to stop
    ang += angVel; // Update angle
    ang %= TAU; // Normalize angle
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
    console.log(`Woop! You won ${sector.label}`);
  });

  document.addEventListener("DOMContentLoaded", () => {
    
    const inputModal = new bootstrap.Modal(document.getElementById("inputModal"), {
        backdrop: 'static', 
        keyboard: false,    
    });

    const resultModal = new bootstrap.Modal(document.getElementById("resultModal"), {
        backdrop: 'static',
        keyboard: false,
    });
    const resultText1 = document.getElementById("resultText1");
    const resultText2 = document.getElementById("resultText2");
    const resultText3 = document.getElementById("resultText3");
    const userForm = document.getElementById("userForm");
    let userDetails = null;
    let hasSpun = false;

    // Check if a token already exists in localStorage
    const savedToken = localStorage.getItem("saveToken");
    if (savedToken) {
        alert("You have already spin the wheel! Only one spin is allowed.");
        spinEl.style.pointerEvents = "none"; // Disable spin button
        return; // Stop further execution
    }
    
    inputModal.show();

    
    userForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const randomToken = () => Math.random().toString(36).substring(2);
        const token = () => randomToken() + randomToken();
        localStorage.setItem("saveToken", token());
        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        userDetails = { name, phone };
        inputModal.hide();

    });

    
    spinEl.addEventListener("click", () => {
        if (!userDetails) {
            alert("Please fill in your details first.");
            return ;
        }

        if (hasSpun) {
            alert("You can only spin once!");
            return;
        }

        if (!angVel) {
            angVel = rand(0.25, 0.45);
            spinButtonClicked = true;
            hasSpun = true;
        }
    });

    
    events.addListener("spinEnd", (sector) => {
        
        resultText1.textContent = `Name: ${userDetails.name}`;
        resultText2.textContent = `Phone: ${userDetails.phone}`;
        resultText3.textContent = `Prize: ${sector.label}`;
        resultModal.show();
        spinEl.style.pointerEvents = "none"; // Disable spin button
    });
});

