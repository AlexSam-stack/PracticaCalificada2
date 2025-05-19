const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");
const textarea = document.getElementById("elementos");
const respuesta = document.getElementById("respuesta");

let elementos = [];
let ocultos = new Set();
let anguloInicio = 0;
let girando = false;

const colores = ["#FF9999", "#99FF99", "#9999FF", "#FFFF99", "#FFCC99"];

function cargarElementos() {
  elementos = textarea.value
    .split("\n")
    .map(e => e.trim())
    .filter(e => e && !ocultos.has(e));
  dibujarRuleta();
}

function dibujarRuleta() {
  const total = elementos.length;
  if (total === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(250, 250);
  let anguloPorElemento = (2 * Math.PI) / total;

  for (let i = 0; i < total; i++) {
    const inicio = anguloInicio + i * anguloPorElemento;
    const fin = inicio + anguloPorElemento;

    ctx.beginPath();
    ctx.fillStyle = colores[i % colores.length];
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 200, inicio, fin);
    ctx.fill();

    // Texto
    ctx.save();
    ctx.rotate(inicio + anguloPorElemento / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    let fontSize = 16;
    if (total > 30) fontSize = 12;
    if (total > 60) fontSize = 10;
    if (total > 100) fontSize = 8;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(elementos[i], 190, 10);
    ctx.restore();
  }

  ctx.restore();

  // Triángulo rojo (indicador) - Lado Derecho mirando hacia afuera
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(440, 250); // Punta del triángulo hacia afuera
  ctx.lineTo(480, 240);
  ctx.lineTo(480, 260);
  ctx.fill();
}

function girarRuleta() {
  if (girando || elementos.length === 0) return;
  girando = true;
  const vueltas = Math.floor(Math.random() * 5) + 5;
  const extra = Math.random() * 2 * Math.PI;
  const incremento = (2 * Math.PI * vueltas + extra) / 60;
  let pasos = 0;

  const intervalo = setInterval(() => {
    anguloInicio += incremento;
    dibujarRuleta();
    pasos++;
    if (pasos >= 60) {
      clearInterval(intervalo);
      mostrarResultado();
      girando = false;
    }
  }, 30);
}

function mostrarResultado() {
  const total = elementos.length;
  const anguloPorElemento = (2 * Math.PI) / total;
  let anguloFinal = (2 * Math.PI - (anguloInicio % (2 * Math.PI))) % (2 * Math.PI);
  const index = Math.floor(anguloFinal / anguloPorElemento);
  const seleccionado = elementos[index];
  respuesta.textContent = seleccionado;
}

function ocultarSeleccionado() {
  const seleccionado = respuesta.textContent;
  if (seleccionado) {
    ocultos.add(seleccionado);
    cargarElementos();
    respuesta.textContent = "";
  }
}

function reiniciarRuleta() {
  ocultos.clear();
  cargarElementos();
  respuesta.textContent = "";
}

function habilitarEdicion() {
  textarea.disabled = false;
  textarea.focus();
}

function pantallaCompleta() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener("keydown", (e) => {
  const estaEnTextarea = document.activeElement === textarea;
  if (estaEnTextarea) return;

  switch (e.key.toUpperCase()) {
    case " ": e.preventDefault(); girarRuleta(); break;
    case "S": ocultarSeleccionado(); break;
    case "R": reiniciarRuleta(); break;
    case "E": habilitarEdicion(); break;
    case "F": pantallaCompleta(); break;
  }
});


// Cargar por defecto al escribir
textarea.addEventListener("input", cargarElementos);
