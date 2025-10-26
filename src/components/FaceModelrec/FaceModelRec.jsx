import React, { useRef, useEffect } from 'react';
import * as faceapi from "face-api.js";

const CameraFeed = () => {
    // 1. Crear la referencia al elemento <video>
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    // ... lógica de conexión a la cámara ...
    // ... dentro del componente CameraFeed ...

useEffect(() => {
    const initializeDetection = async () => {
        await loadModels();
        // Wait a bit for models to load before detection
        setTimeout(() => {
            faceMyDetect();
        }, 1000);
    };
    
    initializeDetection();
}, [])


    const loadModels = async () => {
        try {
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            console.log("Modelos cargados correctamente");
        } catch (error) {
            console.error("Error cargando modelos:", error);
        }
    }

    const faceMyDetect = async () => {
        try {
            if (!imageRef.current) return;
            
            const fullFaceDescription = await faceapi.detectSingleFace(imageRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors().withFaceExpressions();
            console.log(fullFaceDescription);
        } catch (error) {
            console.error("Error detectando cara:", error);
        }
    }




    return (
        <div>
            {/* 2. Asignar la referencia al elemento video */}
            <img ref={imageRef} src='https://img.freepik.com/foto-gratis/retrato-hombre-blanco-aislado_53876-40306.jpg?semt=ais_hybrid&w=740&q=80' autoPlay muted width="640" height="480" />
            <canvas ref={canvasRef} width="640" height="480" />
        </div>
    );
};

export default CameraFeed;