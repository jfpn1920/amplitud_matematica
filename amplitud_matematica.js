// ===== CONFIGURACIÓN =====
const CLAVE = "amplitudMatematica"; // clave con la que se guarda en localStorage
// "a" y "b" guardan lo escrito; "calculado" indica si hay resultados visibles
let estado = { a: "", b: "", calculado: false, historial: [] };
const $ = (id) => document.getElementById(id); // atajo para buscar elementos por id
// Formatea un número con separadores y hasta 4 decimales (evita 0.30000000000000004)
const formato = (n) => (Math.round(n * 10000) / 10000).toLocaleString("es-CO", { maximumFractionDigits: 4 });
// ===== LOCALSTORAGE =====
// Guarda el estado completo como texto JSON
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
// Recupera el estado guardado (si existe) al abrir o refrescar la página
function cargar() { const g = localStorage.getItem(CLAVE); if (g) estado = JSON.parse(g); }
// ===== VALIDACIÓN =====
// Devuelve true si los dos campos tienen un número válido
function valoresValidos() {
    return estado.a !== "" && estado.b !== "" && !isNaN(Number(estado.a)) && !isNaN(Number(estado.b));
}
// ===== RESULTADOS =====
// Calcula y escribe en pantalla todos los resultados
function mostrarResultados() {
    const a = Number(estado.a), b = Number(estado.b), dif = b - a;
    $("r-diferencia").textContent = formato(dif);
    $("r-amplitud").textContent = formato(Math.abs(dif));
    // El porcentaje no se puede calcular si A vale 0 (no se divide entre cero)
    $("r-porcentaje").textContent = a === 0 ? "No aplica (A es 0)" : formato((dif / Math.abs(a)) * 100) + " %";
    $("r-medio").textContent = formato((a + b) / 2);
    dibujarRecta(a, b);
    $("resultados").classList.remove("oculto");
}
// Ubica A, B y el cero en la recta numérica usando porcentajes
function dibujarRecta(a, b) {
    const menor = Math.min(a, b, 0), mayor = Math.max(a, b, 0);
    const rango = mayor - menor || 1; // si todo vale 0, evita dividir entre cero
    const pos = (v) => ((v - menor) / rango) * 100; // posición del valor en la recta (0% a 100%)
    $("marca-a").style.left = pos(a) + "%";
    $("marca-b").style.left = pos(b) + "%";
    $("marca-cero").style.left = pos(0) + "%";
    $("recta-tramo").style.left = Math.min(pos(a), pos(b)) + "%";
    $("recta-tramo").style.width = Math.abs(pos(b) - pos(a)) + "%";
}
// ===== HISTORIAL =====
// Dibuja la lista con los últimos 5 cálculos
function pintarHistorial() {
    $("historial").innerHTML = "";
    estado.historial.forEach((texto) => {
        const li = document.createElement("li");
        li.textContent = texto;
        $("historial").appendChild(li);
    });
}
// ===== ACCIONES =====
// Valida, calcula, guarda en el historial y muestra los resultados
function calcular() {
    $("error").classList.toggle("oculto", valoresValidos());
    if (!valoresValidos()) { estado.calculado = false; $("resultados").classList.add("oculto"); return guardar(); }
    const a = Number(estado.a), b = Number(estado.b);
    estado.calculado = true;
    estado.historial.unshift("A = " + formato(a) + ", B = " + formato(b) + " → diferencia " + formato(b - a));
    estado.historial = estado.historial.slice(0, 5);
    guardar(); mostrarResultados(); pintarHistorial();
}
// Intercambia los valores de A y B
function intercambiar() {
    [estado.a, estado.b] = [estado.b, estado.a];
    $("valor-a").value = estado.a; $("valor-b").value = estado.b;
    estado.calculado = false; $("resultados").classList.add("oculto"); guardar();
}
// Vacía los campos y oculta los resultados (el historial se conserva)
function limpiar() {
    estado.a = ""; estado.b = ""; estado.calculado = false;
    $("valor-a").value = ""; $("valor-b").value = "";
    $("resultados").classList.add("oculto"); $("error").classList.add("oculto");
    guardar();
}
// Cada vez que se escribe, se guarda el valor y se ocultan resultados antiguos
function alEscribir() {
    estado.a = $("valor-a").value; estado.b = $("valor-b").value;
    estado.calculado = false; $("resultados").classList.add("oculto");
    guardar();  
}
// ===== EVENTOS =====
$("btn-calcular").addEventListener("click", calcular);
$("btn-intercambiar").addEventListener("click", intercambiar);
$("btn-limpiar").addEventListener("click", limpiar);
$("btn-borrar").addEventListener("click", () => { estado.historial = []; guardar(); pintarHistorial(); });
$("valor-a").addEventListener("input", alEscribir);
$("valor-b").addEventListener("input", alEscribir);
// Permite calcular con la tecla Enter dentro de los campos
["valor-a", "valor-b"].forEach((id) => $(id).addEventListener("keydown", (e) => e.key === "Enter" && calcular()));
// ===== ARRANQUE =====
// Al cargar la página se recupera lo guardado y se muestra de nuevo
cargar();
$("valor-a").value = estado.a;
$("valor-b").value = estado.b;
pintarHistorial();
if (estado.calculado && valoresValidos()) mostrarResultados();