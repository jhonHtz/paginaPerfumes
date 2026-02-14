/* =================================================
   UTILIDAD ADMIN
================================================= */

function isAdminMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("admin") === "aurea117";
}


/* =================================================
   CATALOGO PRINCIPAL
================================================= */

function initCatalogo() {

    const grid = document.getElementById("perfumeGrid");
    if (!grid) return;

    const filterButtons = document.querySelectorAll(".filter-btn");

    function renderPerfumes(filtro = "all") {

        grid.innerHTML = "";

        let perfumesExtra = JSON.parse(localStorage.getItem("perfumesExtra")) || [];
        let todosPerfumes = [...perfumes, ...perfumesExtra];

        let perfumesFiltrados;

        if (filtro === "all") {
            perfumesFiltrados = todosPerfumes;
        }
        else if (filtro === "hombre") {
            perfumesFiltrados = todosPerfumes.filter(p =>
                p.genero === "hombre" || p.genero === "unisex"
            );
        }
        else if (filtro === "mujer") {
            perfumesFiltrados = todosPerfumes.filter(p =>
                p.genero === "mujer" || p.genero === "unisex"
            );
        }
         
        perfumesFiltrados.forEach(perfume => {

            const card = document.createElement("a");
            card.href = `perfume.html?id=${perfume.id}`;
            card.classList.add("perfume-card");

            let descuento = null;

            if (perfume.precioOriginal > perfume.precioFinal) {
                descuento = Math.round(
                    ((perfume.precioOriginal - perfume.precioFinal) / perfume.precioOriginal) * 100
                );
            }

            card.innerHTML = `
                
                ${descuento ? `<div class="discount-badge">-${descuento}%</div>` : ""}

                <div class="image-container">
                    <img src="${perfume.imagen}" alt="${perfume.nombre}">
                </div>

                <div class="perfume-info">
                    <div class="perfume-title-block">
                        <div class="perfume-main-line">
                            <h3 class="perfume-name">${perfume.nombre}</h3>
                            ${perfume.subtitulo ? `<span class="perfume-sub">${perfume.subtitulo}</span>` : ""}
                        </div>
                        <div class="perfume-brand">${perfume.marca}</div>
                    </div>


                    <div class="price-container">
                        <span class="final-price">$${perfume.precioFinal.toLocaleString()}</span>
                        <span class="original-price">$${perfume.precioOriginal.toLocaleString()}</span>
                    </div>
                </div>
            `;
            if (isAdminMode()) {
                const adminControls = document.createElement("div");
                adminControls.classList.add("admin-card-controls");

                adminControls.innerHTML = `
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑</button>
                `;

                card.appendChild(adminControls);

                // Editar
                adminControls.querySelector(".edit-btn").addEventListener("click", (e) => {
                    e.preventDefault();
                    openEditModal(perfume);
                });

                // Eliminar
                adminControls.querySelector(".delete-btn").addEventListener("click", (e) => {
                    e.preventDefault();
                    deletePerfume(perfume.id);
                });
            }


            grid.appendChild(card);
        });
    }

    /************ FUNCION EDITAR CARD DE PERFUME ************/

    function deletePerfume(id) {

        if (!confirm("¿Seguro que quieres eliminar este perfume?")) return;

        let perfumesGuardados = JSON.parse(localStorage.getItem("perfumesExtra")) || [];

        perfumesGuardados = perfumesGuardados.filter(p => p.id !== id);

        localStorage.setItem("perfumesExtra", JSON.stringify(perfumesGuardados));

        location.reload();
    }
    
    /*CARGAR NOTAS EN EL EDITOR*/
    function openEditModal(perfume) {

    const modal = document.getElementById("adminModal");
    modal.style.display = "flex";

    resetAdminState();

    document.getElementById("adminMarca").value = perfume.marca || "";
    document.getElementById("adminNombre").value = perfume.nombre || "";
    document.getElementById("adminSubtitulo").value = perfume.subtitulo || "";
    document.getElementById("adminImagen").value = perfume.imagen || "";
    document.getElementById("adminGenero").value = perfume.genero || "";
    document.getElementById("adminPrecioOriginal").value = perfume.precioOriginal || "";
    document.getElementById("adminPrecioFinal").value = perfume.precioFinal || "";

    // ===== CARGAR NOTAS =====
    ["salida","corazon","fondo"].forEach(tipo => {

        if (!perfume.notas || !perfume.notas[tipo]) return;

        perfume.notas[tipo].forEach(nota => {

            const container = document.querySelector(`.tag-container[data-tipo="${tipo}"]`);
            addTag(nota, tipo, container);

        });
    });

    //==== cargar IMAGEN Seleccionar imagen visualmente
    // 
    document.querySelectorAll(".admin-image-item").forEach(item => {
        item.classList.remove("selected");
        const img = item.querySelector("img");
        if (img.src.includes(perfume.imagen)) {
            item.classList.add("selected");
        }
    });

    document.getElementById("adminImagen").value = perfume.imagen;


    // ===== CARGAR USO =====
    if (perfume.uso) {
            Object.keys(perfume.uso).forEach(tipo => {

                usoSeleccionado[tipo] = { ...perfume.uso[tipo] };

                const item = document.querySelector(`.uso-admin-item .${tipo}`)?.closest(".uso-admin-item");
                if (!item) return;

                const icon = item.querySelector(".uso-admin-icon");
                const range = item.querySelector(".uso-range");
                const value = item.querySelector(".uso-range-value");

                if (perfume.uso[tipo].activo) {
                    icon.classList.add("activo");
                }
                range.value = perfume.uso[tipo].porcentaje;
                value.textContent = perfume.uso[tipo].porcentaje + "%";
            });
        }
        window.editingPerfumeId = perfume.id;
    }


    
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            document.querySelector(".filter-btn.active")?.classList.remove("active");
            button.classList.add("active");

            const filtro = button.dataset.filter;
            renderPerfumes(filtro);
        });
    });

    renderPerfumes();
}


/* =================================================
   MODAL ADMIN
================================================= */

function initAdminModal() {

    if (!isAdminMode()) return;

    const btn = document.getElementById("adminToggle");
    const modal = document.getElementById("adminModal");
    const closeBtn = document.querySelector(".close-admin");

    if (btn) btn.style.display = "block";

    btn?.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeBtn?.addEventListener("click", () => {
        modal.style.display = "none";
    });
}


/* =================================================
   CALCULO DESCUENTO
================================================= */

function initDiscountCalculation() {

    const original = document.getElementById("adminPrecioOriginal");
    const final = document.getElementById("adminPrecioFinal");
    const discount = document.getElementById("adminDescuento");

    if (!original || !final) return;

    function calculate() {

        const o = parseFloat(original.value);
        const f = parseFloat(final.value);

        if (o && f && f < o) {
            const percent = Math.round(((o - f) / o) * 100);
            discount.value = percent + "%";
        } else {
            discount.value = "";
        }
    }

    original.addEventListener("input", calculate);
    final.addEventListener("input", calculate);
}


/* =================================================
   CARGAR IMAGENES
================================================= */

function loadImageGrid() {

    const grid = document.getElementById("adminImageGrid");
    const hiddenInput = document.getElementById("adminImagen");
    const preview = document.getElementById("selectedImagePreview");

    if (!grid || typeof imagenesDisponibles === "undefined") return;

    grid.innerHTML = "";

    imagenesDisponibles.forEach(nombreArchivo => {

        const ruta = "assets/img/perfumes/" + nombreArchivo;

        const item = document.createElement("div");
        item.classList.add("admin-image-item");

        item.innerHTML = `
            <img src="${ruta}">
            <span>${nombreArchivo}</span>
        `;

        item.addEventListener("click", () => {

            hiddenInput.value = ruta;

            preview.innerHTML = `
                <img src="${ruta}">
                <small>${nombreArchivo}</small>
            `;

            document.getElementById("imageSelectorModal").style.display = "none";
        });

        grid.appendChild(item);
    });
}
function initImageSelectorModal() {

    const openBtn = document.getElementById("openImageSelector");
    const modal = document.getElementById("imageSelectorModal");
    const closeBtn = document.querySelector(".close-image-selector");

    if (!openBtn) return;

    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}




/* =================================================
   SISTEMA DE TAGS (NOTAS)
================================================= */

let notasSeleccionadas = {
    salida: [],
    corazon: [],
    fondo: []
};


function initTagsSystem() {
    function normalizarTexto(texto) {
    return texto
        .normalize("NFD")                // separa letras y tildes
        .replace(/[\u0300-\u036f]/g, "") // elimina tildes
        .toLowerCase();
}

    const inputs = document.querySelectorAll(".tag-input");

    if (!inputs.length) return;

    inputs.forEach(input => {

        const tipo = input.dataset.tipo;
        const dropdown = document.querySelector(`.tag-dropdown[data-tipo="${tipo}"]`);
        const container = document.querySelector(`.tag-container[data-tipo="${tipo}"]`);

        input.addEventListener("input", () => {

            const value = normalizarTexto(input.value);
            dropdown.innerHTML = "";

            if (!value) {
                dropdown.style.display = "none";
                return;
            }

            const resultados = Object.keys(notasDisponibles)
                .filter(nota =>
                    normalizarTexto(nota).includes(value) &&
                    !notasSeleccionadas[tipo].includes(nota)
                );

            resultados.forEach(nota => {

                const option = document.createElement("div");
                option.classList.add("tag-option");
                option.textContent = nota;

                option.addEventListener("click", () => {
                    addTag(nota, tipo, container);
                    input.value = "";
                    dropdown.style.display = "none";
                });

                dropdown.appendChild(option);
            });

            dropdown.style.display = resultados.length ? "block" : "none";
        });

    });
}

function addTag(nota, tipo, container) {

    if (notasSeleccionadas[tipo].includes(nota)) return;

    notasSeleccionadas[tipo].push(nota);

    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.innerHTML = `${nota} <span>&times;</span>`;

    tag.querySelector("span").addEventListener("click", () => {
        notasSeleccionadas[tipo] =
            notasSeleccionadas[tipo].filter(n => n !== nota);
        tag.remove();
    });

    container.appendChild(tag);
}


/* =================================================
   GUARDAR PERFUME DESDE MODAL
================================================= */

function initAdminSubmit() {

    const form = document.getElementById("adminForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const marca = document.getElementById("adminMarca").value;
        const nombre = document.getElementById("adminNombre").value;
        const subtitulo = document.getElementById("adminSubtitulo").value;
        const imagen = document.getElementById("adminImagen").value;
        const precioOriginal = parseFloat(document.getElementById("adminPrecioOriginal").value);
        const precioFinal = parseFloat(document.getElementById("adminPrecioFinal").value);
        const genero = document.getElementById("adminGenero").value;

        if (!precioFinal || precioFinal >= precioOriginal) {
            alert("El precio final debe ser menor al original.");
            return;
        }
        const id = window.editingPerfumeId || Date.now();
        const nuevoPerfume = {
            id,
            marca,
            nombre,
            subtitulo,
            genero, 
            precioOriginal,
            precioFinal,
            imagen,
            notas: notasSeleccionadas,
            uso: usoSeleccionado
        };

        let perfumesGuardados = JSON.parse(localStorage.getItem("perfumesExtra")) || [];
        if (window.editingPerfumeId) {
            perfumesGuardados = perfumesGuardados.map(p =>
                p.id === window.editingPerfumeId ? nuevoPerfume : p
            );
            window.editingPerfumeId = null;
        } else {
            perfumesGuardados.push(nuevoPerfume);
        }

        localStorage.setItem("perfumesExtra", JSON.stringify(perfumesGuardados));

        alert("Perfume agregado correctamente.");
        form.reset();
        location.reload();
    });
}
/*************** MANTENER LA INFORMACIÓN DEL PERFUME *********************/
function resetAdminState() {

    notasSeleccionadas = {
        salida: [],
        corazon: [],
        fondo: []
    };

    usoSeleccionado = {};

    document.querySelectorAll(".tag-container").forEach(c => c.innerHTML = "");
}



const usoTipos = ["primavera","verano","otono","invierno","dia","noche"];

let usoSeleccionado = {};

function initUsoAdmin() {

    const grid = document.getElementById("usoAdminGrid");
    if (!grid) return;

    usoTipos.forEach(tipo => {

        usoSeleccionado[tipo] = {
            porcentaje: 50,
            activo: false
        };

        const item = document.createElement("div");
        item.classList.add("uso-admin-item");

        item.innerHTML = `
            <div class="uso-admin-icon ${tipo}">
                ${iconsUso[tipo]}
            </div>

            <input type="range" min="0" max="100" value="50" class="uso-range">

            <span class="uso-range-value">50%</span>
        `;

        const iconContainer = item.querySelector(".uso-admin-icon");
        const range = item.querySelector(".uso-range");
        const value = item.querySelector(".uso-range-value");
        

        // Toggle activo al hacer click en ícono
        iconContainer.addEventListener("click", () => {
            usoSeleccionado[tipo].activo = !usoSeleccionado[tipo].activo;
            iconContainer.classList.toggle("activo");
        });

        // Actualizar porcentaje
        range.addEventListener("input", () => {
            value.textContent = range.value + "%";
            usoSeleccionado[tipo].porcentaje = parseInt(range.value);
        });

        grid.appendChild(item);
    });
}


/* =================================================
   DETALLE PERFUME
================================================= */

function renderUsoIcon(nombre, data, label) {

    return `
        <div class="uso-item ${nombre} ${data.activo ? "activo" : ""}">
            ${iconsUso[nombre]}
            <span>${label}</span>
            <div class="uso-bar">
                <div class="uso-fill" style="width:${data.porcentaje}%"></div>
            </div>
        </div>
    `;
}

function renderDetallePerfume() {

    const container = document.getElementById("perfumeDetail");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    let perfumesExtra = JSON.parse(localStorage.getItem("perfumesExtra")) || [];
    let todosPerfumes = [...perfumes, ...perfumesExtra];

    const perfume = todosPerfumes.find(p => p.id === id);
    if (!perfume) return;

    let descuento = Math.round(
        ((perfume.precioOriginal - perfume.precioFinal) / perfume.precioOriginal) * 100
    );

    container.innerHTML = `
        <div class="detail-layout">

            <div class="detail-left">
                <div class="detail-image">
                    <img src="${perfume.imagen}" alt="${perfume.nombre}">
                </div>

                <div class="detail-basic">
                    <div class="detail-title-block">
                        <div class="detail-main-line">
                            <h2>${perfume.nombre}</h2>
                            ${perfume.subtitulo ? `<span class="detail-sub">${perfume.subtitulo}</span>` : ""}
                        </div>
                        <div class="detail-brand">${perfume.marca}</div>
                    </div>

                    <div class="detail-prices">
                        <span class="detail-final">$${perfume.precioFinal.toLocaleString()}</span>
                        <span class="detail-original">$${perfume.precioOriginal.toLocaleString()}</span>
                        <div class="detail-discount">Ahorra ${descuento}%</div>
                    </div>
                </div>
            </div>

            <div class="detail-right">

                ${["salida","corazon","fondo"].map(tipo => `
                    <div class="detail-section">
                        <h4>Notas de ${tipo.charAt(0).toUpperCase()+tipo.slice(1)}</h4>
                        <div class="notes-grid">
                            ${perfume.notas[tipo].map(nota => `
                                <div class="note-item">
                                    <img src="${notasDisponibles[nota]}" alt="${nota}">
                                    <span>${nota}</span>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}

                <div class="detail-section">
                    <h4>¿Cuándo usarlo?</h4>
                    <div class="uso-grid">
                        ${renderUsoIcon("primavera", perfume.uso.primavera, "Primavera")}
                        ${renderUsoIcon("verano", perfume.uso.verano, "Verano")}
                        ${renderUsoIcon("otono", perfume.uso.otono, "Otoño")}
                        ${renderUsoIcon("invierno", perfume.uso.invierno, "Invierno")}
                        ${renderUsoIcon("dia", perfume.uso.dia, "Día")}
                        ${renderUsoIcon("noche", perfume.uso.noche, "Noche")}
                    </div>
                </div>

            </div>
        </div>
    `;
}


/* =================================================
   INICIALIZACION GLOBAL
================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initCatalogo();
    initAdminModal();
    initDiscountCalculation();
    initImageSelectorModal();
    loadImageGrid();
    initTagsSystem();
    initUsoAdmin();
    initAdminSubmit();
    renderDetallePerfume();

});
