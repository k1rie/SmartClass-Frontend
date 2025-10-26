// Configuración para el test de reconocimiento facial
module.exports = {
    // Configuración de la API
    API: {
        BASE_URL: "http://localhost:8000",
        EMAIL: "tu_email@ejemplo.com", // ⚠️ CAMBIA ESTO por tu email real
        PASSWORD: "tu_password", // ⚠️ CAMBIA ESTO por tu password real
        GROUP_ID: 1 // ID del grupo para las pruebas (cambia según necesites)
    },
    
    // Configuración de archivos
    PATHS: {
        FACES_DIR: "./public/faces",
        MODELS_DIR: "./public/models",
        RESULTS_FILE: "./face_recognition_results.json"
    },
    
    // Condiciones de calidad (iguales que en tu modal)
    QUALITY: {
        MIN_SCORE: 0.9,
        MIN_FACE_SIZE_PX: 150
    },
    
    // Configuración del procesamiento
    PROCESSING: {
        BATCH_SIZE: 10, // Mostrar progreso cada N imágenes
        API_TIMEOUT: 10000, // Timeout para requests a la API (ms)
        MAX_RETRIES: 3 // Máximo número de reintentos para requests fallidos
    }
};
