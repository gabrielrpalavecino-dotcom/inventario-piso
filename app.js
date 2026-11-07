// =====================================================
// VARIABLES GLOBALES
// =====================================================

let usuarioActual = null;
let zonaActual = null;
let pisoActual = null;

// =====================================================
// AUTH
// =====================================================

async function login() { }
async function logout() { }
async function cargarUsuario() { }

// =====================================================
// APP
// =====================================================

async function iniciarAplicacion() { }

// =====================================================
// DASHBOARD
// =====================================================

async function cargarDashboard() { }

// =====================================================
// PISOS
// =====================================================

async function cargarPisos() { }
async function crearPiso() { }
async function eliminarPiso() { }

// =====================================================
// PROPIETARIOS
// =====================================================

async function cargarPropietarios() { }
async function crearPropietario() { }

// =====================================================
// ZONAS
// =====================================================

async function cargarZonas() { }
async function crearZona() { }
async function abrirZona() { }

// =====================================================
// CATÁLOGO
// =====================================================

async function cargarCatalogo() { }
async function buscarObjetos() { }

// =====================================================
// INVENTARIO
// =====================================================

async function agregarObjeto() { }
async function eliminarObjeto() { }
async function actualizarObjeto() { }
async function cargarInventarioZona() { }

// =====================================================
// FOTOS
// =====================================================

async function subirFotoZona() { }
async function cargarFotosZona() { }
async function eliminarFoto() { }

// =====================================================
// SNAPSHOTS
// =====================================================

async function crearEntrada() { }
async function crearSalida() { }
async function cargarSnapshots() { }

// =====================================================
// COMPARATIVAS
// =====================================================

async function compararSnapshots() { }

// =====================================================
// FIRMAS
// =====================================================

function iniciarCanvas() { }
function dibujar() { }
async function guardarFirma() { }

// =====================================================
// INCIDENCIAS
// =====================================================

async function crearIncidencia() { }
async function cargarIncidencias() { }
async function cerrarIncidencia() { }

// =====================================================
// ADMIN
// =====================================================

async function cargarAdmin() { }
async function cargarUsuarios() { }
async function cargarEmpresas() { }

// =====================================================
// PDF
// =====================================================

async function generarPDF() { }

// =====================================================
// INIT
// =====================================================

window.addEventListener(
    "load",
    async () => {

        const {
            data: { session }
        } =
            await db.auth.getSession();

        if (session) {

            await iniciarAplicacion();

        }

    });
// =========================================
// LOGIN
// =========================================

async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const { error } =
        await db.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        alert(error.message);
        return;
    }

    await iniciarAplicacion();
}

async function logout() {

    await db.auth.signOut();

    location.reload();
}

async function cargarUsuario() {

    const {
        data: { user }
    } = await db.auth.getUser();

    if (!user) return null;

    const { data, error } =
        await db
            .from("usuarios")
            .select("*")
            .eq("auth_id", user.id)
            .single();

    if (error) {
        console.error(error);
        return null;
    }

    usuarioActual = data;

    return data;
}
// =====================================================
// APP
// =====================================================

async function iniciarAplicacion() {

    const usuario =
        await cargarUsuario();

    if (!usuario) return;

    document.getElementById(
        "login-screen"
    ).style.display = "none";

    document.getElementById(
        "app"
    ).style.display = "block";

    const info =
        document.getElementById(
            "usuario-logueado"
        );

    if (info) {
        info.innerText =
            usuario.nombre +
            " (" +
            usuario.rol +
            ")";
    }

    await cargarDashboard();
    await cargarPisos();

    if (usuario.rol === "admin") {
        await cargarAdmin();
    }

}

// =====================================================
// DASHBOARD
// =====================================================

async function cargarDashboard() {

    try {

        const pisos =
            await db
                .from("pisos")
                .select("*", { count: 'exact', head: true });

        const zonas =
            await db
                .from("zonas")
                .select("*", { count: 'exact', head: true });

        const inventario =
            await db
                .from("inventario")
                .select("*", { count: 'exact', head: true });

        const fotos =
            await db
                .from("fotos")
                .select("*", { count: 'exact', head: true });

        const inspecciones =
            await db
                .from("inspecciones")
                .select("*", { count: 'exact', head: true });

        actualizarStat(
            "total-pisos", pisos.count
        );
        actualizarStat(
            "total-zonas",
            zonas.count
        );

        actualizarStat(
            "total-objetos",
            inventario.count
        );

        actualizarStat(
            "total-fotos",
            fotos.count
        );

        actualizarStat(
            "total-inspecciones",
            inspecciones.count
        );

    }

    catch (error) {

        console.error(error);

    }

    function actualizarStat(id, valor) {

        const elemento =
            document.getElementById(id);

        if (elemento) {

            elemento.innerText =
                valor || 0;

        }
    }

    // =========================================
    // PISOS
    // =========================================

    async function cargarPisos() {

        const selector =
            document.getElementById(
                "selector-pisos"
            );

        const { data, error } =
            await db
                .from("pisos")
                .select("*")
                .order("nombre");

        if (error) {

            console.error(error);
            return;

        }

        selector.innerHTML = "";

        data.forEach(piso => {

            const option =
                document.createElement("option");

            option.value =
                piso.id;

            option.textContent =
                piso.nombre;

            selector.appendChild(option);

        });

        if (data.length) {

            pisoActual =
                data[0].id;

            selector.value =
                pisoActual;

            await cargarZonas();

        }
    }

    async function crearPiso() {

        const nombre =
            document.getElementById(
                "nuevo-piso"
            ).value;

        if (!nombre) return;

        const { error } =
            await db
                .from("pisos")
                .insert({

                    nombre: nombre,

                    empresa_id:
                        usuarioActual.empresa_id,

                    creado_por:
                        usuarioActual.id

                });

        if (error) {

            alert(error.message);
            return;

        }

        await cargarPisos();

    }

    // =========================================
    // CAMBIO PISO
    // =========================================

    async function seleccionarPiso() {

        pisoActual =
            document.getElementById(
                "selector-pisos"
            ).value;

        await cargarZonas();
    }

    // =========================================
    // ZONAS
    // =========================================

    async function cargarZonas() {

        if (!pisoActual) return;

        const {
            data,
            error
        } = await db
            .from("zonas")
            .select("*")
            .eq("piso_id", pisoActual)
            .order("nombre");

        if (error) {

            console.error(error);
            return;

        }

        const listado =
            document.getElementById(
                "zonas-listado"
            );

        if (!listado) return;

        listado.innerHTML = "";

        data.forEach(zona => {

            listado.innerHTML +=
                `
        <div class="panel zona-card">

            <h3>
                ${zona.icono || "🏠"}
                ${zona.nombre}
            </h3>

            <div class="zona-botones">

                <button
                onclick="
                abrirZona(
                '${zona.id}'
                )">

                Gestionar

                </button>

                <button
                onclick="
                eliminarZona(
                '${zona.id}'
                )">

                Eliminar

                </button>

            </div>

        </div>
        `;

        });

    }

    async function crearZona() {

        if (!pisoActual) {

            alert(
                "Selecciona un piso"
            );

            return;
        }

        const input =
            document.getElementById(
                "nueva-zona"
            );

        const nombre =
            input.value.trim();

        if (!nombre) {

            alert(
                "Introduce un nombre"
            );

            return;
        }

        const {
            error
        } = await db
            .from("zonas")
            .insert({

                piso_id: pisoActual,

                nombre: nombre,

                categoria: "general",

                icono: "🏠"

            });

        if (error) {

            alert(error.message);

            return;
        }

        input.value = "";

        await cargarZonas();

        await cargarDashboard();
    }

    async function agregarZonaFija() {

        const selector =
            document.getElementById(
                "selector-zonas-fijas"
            );

        if (!selector) return;

        const nombre =
            selector.value;

        if (!nombre) return;

        const {
            error
        } = await db
            .from("zonas")
            .insert({

                piso_id: pisoActual,

                nombre: nombre,

                categoria: "fija"

            });

        if (error) {

            alert(error.message);

            return;
        }

        await cargarZonas();
    }

    async function abrirZona(id) {

        zonaActual = id;

        await cargarCatalogo();

        await cargarInventarioZona(
            id
        );

        await cargarFotosZona();

        const panel =
            document.getElementById(
                "panel-zona"
            );

        if (panel) {

            panel.style.display =
                "block";

        }

    }

    async function eliminarZona(id) {

        const confirmar =
            confirm(
                "¿Eliminar la zona?"
            );

        if (!confirmar) return;

        const {
            error
        } = await db
            .from("zonas")
            .delete()
            .eq("id", id);

        if (error) {

            alert(error.message);
            return;

        }

        await cargarZonas();

        await cargarDashboard();
    }

    async function renombrarZona(
        id,
        nuevoNombre
    ) {

        if (!nuevoNombre) return;

        const {
            error
        } = await db
            .from("zonas")
            .update({

                nombre: nuevoNombre

            })
            .eq("id", id);

        if (error) {

            alert(error.message);

            return;
        }

        await cargarZonas();
    }

    async function cargarZonasBase() {

        const zonasBase = [

            "Salón",
            "Comedor",
            "Cocina",
            "Baño",
            "Habitación Principal",
            "Habitación 2",
            "Entrada",
            "Pasillo"

        ];

        for (const nombre of zonasBase) {

            await db
                .from("zonas")
                .insert({

                    piso_id: pisoActual,

                    nombre: nombre,

                    categoria: "base"

                });

        }

        await cargarZonas();
    }

    async function duplicarZona(id) {

        const {
            data,
            error
        } = await db
            .from("zonas")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {

            return;

        }

        await db
            .from("zonas")
            .insert({

                piso_id: pisoActual,

                nombre:
                    data.nombre +
                    " copia",

                categoria:
                    data.categoria,

                icono:
                    data.icono

            });

        await cargarZonas();
    }

    // =========================================
    // CATALOGO DE OBJETOS
    // =========================================

    async function cargarCatalogo() {

        const selector =
            document.getElementById(
                "selector-objetos"
            );

        if (!selector) return;

        const {
            data,
            error
        } = await db
            .from("vw_objetos_catalogo")
            .select("*")
            .order("categoria");

        if (error) {

            console.error(error);

            return;
        }

        selector.innerHTML = "";

        data.forEach(item => {

            const option =
                document.createElement("option");

            option.value =
                item.nombre;

            option.textContent =
                `${item.icono || "📦"} ${item.nombre}`;

            selector.appendChild(
                option
            );

        });

    }

    async function buscarObjetos() {

        const texto =
            document.getElementById(
                "buscar-objeto"
            )?.value || "";

        const {
            data,
            error
        } = await db
            .rpc(
                "buscar_objetos",
                {
                    texto: texto
                }
            );

        if (error) {

            console.error(error);

            return;
        }

        const selector =
            document.getElementById(
                "selector-objetos"
            );

        selector.innerHTML = "";

        data.forEach(item => {

            selector.innerHTML +=
                `
        <option value="${item.nombre}">
        ${item.icono}
        ${item.nombre}
        </option>
        `;

        });

    }

    // =========================================
    // INVENTARIO
    // =========================================

    async function agregarObjeto() {

        if (!zonaActual) {

            alert(
                "Selecciona una zona"
            );

            return;
        }

        const objeto =
            document.getElementById(
                "selector-objetos"
            ).value;

        const cantidad =
            parseInt(
                document.getElementById(
                    "cantidad-objeto"
                ).value
            ) || 1;

        const estado =
            document.getElementById(
                "estado-objeto"
            ).value;

        const observaciones =
            document.getElementById(
                "obs-objeto"
            )?.value || "";

        const {
            error
        } = await db
            .from("inventario")
            .insert({

                zona_id:
                    zonaActual,

                nombre_objeto:
                    objeto,

                cantidad:
                    cantidad,

                estado:
                    estado,

                observaciones:
                    observaciones,

                created_by:
                    usuarioActual.id

            });

        if (error) {

            alert(error.message);

            return;
        }

        await cargarInventarioZona(
            zonaActual
        );

        await cargarDashboard();

    }
    async function cargarInventarioZona(
        zonaId
    ) {

        const {
            data,
            error
        } = await db
            .from("inventario")
            .select("*")
            .eq(
                "zona_id",
                zonaId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (error) {

            console.error(error);

            return;
        }

        const listado =
            document.getElementById(
                "inventario-listado"
            );

        if (!listado) return;

        listado.innerHTML = "";

        data.forEach(item => {
            listado.innerHTML +=
                `
        <div class="item-row">

            <div>

                <strong>
                ${item.nombre_objeto}
                </strong>

                <br>

                Cantidad:
                ${item.cantidad}

                <br>

                Estado:
                ${item.estado}

                <br>

                ${item.observaciones || ""}

            </div>

            <div>

                <button
                onclick="
                editarObjeto(
                '${item.id}'
                )">

                ✏️

                </button>

                <button
                onclick="
                eliminarObjeto(
                '${item.id}'
                )">

                ❌

                </button>

               <div id="panel-zona" style="display:none;">

    <h2>Zona seleccionada</h2>

    <!-- INVENTARIO -->

    <input
    id="buscar-objeto"
    placeholder="Buscar objeto..."
    oninput="buscarObjetos()">

    <select id="selector-objetos"></select>

    <input
    id="cantidad-objeto"
    type="number"
    value="1">

    <select id="estado-objeto">
        <option>Perfecto</option>
        <option>Bueno</option>
        <option>Regular</option>
        <option>Dañado</option>
    </select>

    <textarea
    id="obs-objeto"
    placeholder="Observaciones">
    </textarea>

    <button onclick="agregarObjeto()">
        Añadir objeto
    </button>

    <div id="inventario-listado"></div>

    <hr>

    <!-- FOTOS -->

    <h3>Fotos de la zona</h3>

    <input
    type="file"
    id="foto-file"
    accept="image/*">

    <button onclick="subirFotoZona()">
        Subir foto
    </button>

    <div id="galeria-fotos"></div>

</div>

    }
    async function eliminarObjeto(
        id
    ) {

        const confirmar =
            confirm(
                "¿Eliminar objeto?"
            );

        if (!confirmar) return;

        const {
            error
        } = await db
            .from("inventario")
            .delete()
            .eq("id", id);

        if (error) {

            alert(error.message);

            return;

        }

        await cargarInventarioZona(
            zonaActual
        );

        await cargarDashboard();

    }
    async function editarObjeto(
        id
    ) {

        const cantidad =
            prompt(
                "Nueva cantidad"
            );

        if (
            cantidad === null
        ) return;

        const estado =
            prompt(
                "Estado"
            );

        if (
            estado === null
        ) return;

        const {
            error
        } = await db
            .from("inventario")
            .update({

                cantidad:
                    parseInt(cantidad),

                estado:
                    estado

            })
            .eq("id", id);

        if (error) {

            alert(error.message);

            return;

        }

        await cargarInventarioZona(
            zonaActual
        );

    }
    // =========================================
    // RESUMEN INVENTARIO
    // =========================================

    async function calcularTotalObjetos() {

        const {
            count
        } = await db
            .from("inventario")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );

        return count || 0;
    }
    // =========================================
    // DUPLICAR INVENTARIO
    // =========================================

    async function duplicarZonaInventario(

        zonaOrigen,
        zonaDestino

    ) {

        const {
            data,
            error
        } = await db
            .from("inventario")
            .select("*")
            .eq(
                "zona_id",
                zonaOrigen
            );

        if (error) {

            console.error(error);

            return;
        }

        for (const item of data) {

            await db
                .from("inventario")
                .insert({

                    zona_id:
                        zonaDestino,

                    nombre_objeto:
                        item.nombre_objeto,

                    cantidad:
                        item.cantidad,

                    estado:
                        item.estado,

                    observaciones:
                        item.observaciones,

                    created_by:
                        usuarioActual.id

                });

        }

    }
    // =========================================
    // FOTOS + STORAGE
    // =========================================

    async function subirFotoZona() {

        if (!zonaActual) {

            alert(
                "Selecciona una zona"
            );

            return;
        }

        const input =
            document.getElementById(
                "foto-file"
            );

        const archivo =
            input.files[0];

        if (!archivo) {

            alert(
                "Selecciona una imagen"
            );

            return;
        }

        const ruta =

            usuarioActual.empresa_id +
            "/" +

            pisoActual +
            "/" +

            zonaActual +
            "/" +

            Date.now() +
            "_" +

            archivo.name;

        const { error: uploadError }

            = await db.storage

                .from("fotos")

                .upload(
                    ruta,
                    archivo
                );

        if (uploadError) {

            alert(
                uploadError.message
            );

            return;
        }

        const { data: urlData }

            = db.storage

                .from("fotos")

                .getPublicUrl(ruta);

        const {

            error

        } = await db

            .from("fotos")

            .insert({

                zona_id:
                    zonaActual,

                url:
                    urlData.publicUrl,

                descripcion:
                    "",

                destacada:
                    false,

                created_by:
                    usuarioActual.id

            });

        if (error) {

            alert(error.message);

            return;
        }

        input.value = "";

        await cargarFotosZona();

        await cargarDashboard();
    }
    async function cargarFotosZona() {

        if (!zonaActual) return;

        const {

            data,
            error

        } = await db

            .from("fotos")

            .select("*")

            .eq(
                "zona_id",
                zonaActual
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (error) {

            console.error(error);

            return;
        }

        const galeria =
            document.getElementById(
                "galeria-fotos"
            );

        if (!galeria) return;

        galeria.innerHTML = "";

        data.forEach(foto => {

            galeria.innerHTML +=
                `
                < div
            class="foto-card" >

                <img
                    src="${foto.url}"
                    onclick="
            ampliarFoto(
            '${foto.url}'
            )">

                    <div
                        class="foto-tools">

                        <button
                            onclick="
                destacarFoto(
                '${foto.id}'
                )">

                            ⭐

                        </button>

                        <button
                            onclick="
                eliminarFoto(
                '${foto.id}'
                )">

                            🗑️

                        </button>

                    </div>

                </div>


            async function eliminarFoto(id) {

                const confirmar =
                    confirm(
                        "¿Eliminar foto?"
                    );

                if (!confirmar) return;

                const {

                    error

                } = await db

                    .from("fotos")

                    .delete()

                    .eq("id", id);

                if (error) {

                    alert(error.message);

                    return;
                }

                await cargarFotosZona();

                await cargarDashboard();
            }

            async function destacarFoto(id) {

                await db

                    .from("fotos")

                    .update({

                        destacada: true

                    })

                    .eq("id", id);

                await cargarFotosZona();
            }
            function ampliarFoto(url) {

                const modal =
                    document.getElementById(
                        "foto-modal"
                    );

                const img =
                    document.getElementById(
                        "foto-modal-img"
                    );

                img.src = url;

                modal.style.display =
                    "flex";
            }
            function cerrarModalFoto() {

                const modal =
                    document.getElementById(
                        "foto-modal"
                    );

                modal.style.display =
                    "none";
            }
            async function contarFotosZona() {

                if (!zonaActual)
                    return 0;

                const {

                    count

                } = await db

                    .from("fotos")

                    .select(
                        "*",
                        {
                            count: "exact",
                            head: true
                        }
                    )

                    .eq(
                        "zona_id",
                        zonaActual
                    );

                return count || 0;
            }

            <div id="foto-modal" class="foto-modal">

                <img
                    id="foto-modal-img">

                    <button
                        onclick="cerrarModalFoto()">
                        Cerrar
                    </button>

            </div>

</script >

</body >

</html >