const perfumes = [
    {
        id: 1,
        nombre: "Erba Pura",
        marca: "Xerjoff",
        subtitulo: "edp",
        genero: "unisex",
        precioOriginal: 4500,
        precioFinal: 3690,
        imagen: "assets/img/erba-pura.png",
        
        notas: {
        salida: ["bergamota de Calabria", "naranja siliciana"],
        corazon: ["frutas"],
        fondo: ["almizcle","vainilla de Madagascar","ámbar"]
        },

        uso: {
            primavera: { porcentaje: 84, activo: true },
            verano: { porcentaje: 95, activo: true },
            otono: { porcentaje: 55, activo: false },
            invierno: { porcentaje: 30, activo: false },
            dia: { porcentaje: 85, activo: true },
            noche: { porcentaje: 53, activo: true }
        }
    }
];
