const SUPABASE_URL =
    "https://TU-PROYECTO.supabase.co";

const SUPABASE_KEY =
    "TU_ANON_KEY";

const db =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

let usuarioActual = null;
let zonaActual = null;