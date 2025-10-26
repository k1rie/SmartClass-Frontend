import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from "face-api.js";
import styles from "../styles/FaceRecognition.module.css";
import image from "../assets/Fotolia_hexagonal.jpg";
import { BASE_API_URL } from "../config/constants";

const FaceRecognition = () => {
    // 1. Crear la referencia al elemento <video>
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [detectionInterval, setDetectionInterval] = useState(null);
  
useEffect(() => {
    startVideo();
    loadModels();
}, [])

// Cleanup function to clear interval when component unmounts
useEffect(() => {
    return () => {
        if (detectionInterval) {
            clearInterval(detectionInterval);
        }
    };
}, [detectionInterval])

const startVideo = () => {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  }).catch(error => {
    console.error("Error accessing camera:", error);
  });
}



    const loadModels = async () => {
        try {
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            await faceapi.nets.faceExpressionNet.loadFromUri("/models");
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            
            console.log("Modelos cargados correctamente");

        } catch (error) {
            console.error("Error cargando modelos:", error);
        }
    }

    const startScanningRegister = () => {
        if (!isScanning) {
            console.log("Iniciando reconocimiento facial...");
            setIsScanning(true);
            const interval = setInterval(async() => {
                try {
                    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;
                    
                    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
                    console.log(detections);
                    if(detections.length > 0){
                        console.log("Cara detectada"); 
                        clearInterval(interval);
                        registerFaceStudent(detections[0].descriptor);
                        localStorage.setItem("idStudent", detections[0].id);
                    }
                    // Clear canvas before drawing
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    
                    faceapi.matchDimensions(canvasRef.current, { width:640, height: 480 });
                    const resizedDetections = faceapi.resizeResults(detections, { width:640, height: 480 });
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

                } catch (error) {
                    console.error("Error in face detection:", error);
                }
            }, 1000);
            setDetectionInterval(interval);
        }
    };

    const startScanningVerify = () => {
        if (!isScanning) {
            console.log("Iniciando reconocimiento facial...");
            setIsScanning(true);
            const interval = setInterval(async() => {
                try {
                    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;
                    
                    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
                    console.log(detections);
                    if(detections.length > 0){
                        console.log("Cara detectada"); 
                        clearInterval(interval);
                        verifyFaceStudent(detections[0].descriptor);
                        localStorage.setItem("idStudent", detections[0].id);
                    }
                    // Clear canvas before drawing
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    
                    faceapi.matchDimensions(canvasRef.current, { width:640, height: 480 });
                    const resizedDetections = faceapi.resizeResults(detections, { width:640, height: 480 });
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

                } catch (error) {
                    console.error("Error in face detection:", error);
                }
            }, 1000);
            setDetectionInterval(interval);
        }
    }

    const stopScanning = () => {
        if (isScanning && detectionInterval) {
            console.log("Deteniendo reconocimiento facial...");
            clearInterval(detectionInterval);
            setDetectionInterval(null);
            setIsScanning(false);
            
            // Clear canvas when stopping
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };



    const registerFaceStudent = (descriptor) => {
        console.log(`El embeding es: ${descriptor}`);
        const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
        const embedding = new Float32Array(descriptor);
        fetch(`${BASE_API_URL}/registerFaceStudent`, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                "Content-Type": "application/json"
              },
            method: "POST",
            body: JSON.stringify({
                user_id: '4655',
                embedding: Array.from(embedding)
            })
        })
        .then(data => data.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error("Error registrando cara:", error);
        })
    }

    const verifyFaceStudent = (descriptor) => {
        console.log(`El embeding es: ${descriptor}`);
        const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
        const embedding = new Float32Array(descriptor);
        fetch(`${BASE_API_URL}/searchFaceStudent`, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                "Content-Type": "application/json"
              },
            method: "POST",
            body: JSON.stringify({
                user_id: 4655,
                embedding: Array.from(embedding),
                k: 1
            })
        })
        .then(data => data.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error("Error verificando cara:", error);
        })
    }



    return (
        <div className="pt-16 min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-4">Reconocimiento Facial</h1>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-blue-400">Instrucciones</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                        Para un mejor reconocimiento, asegúrate de tener buena iluminación y posicionarte de frente a la cámara.
                    </p>
                </div>
            </div>
            
            <div className={styles.container}>
                <video
                    ref={videoRef}
                    className={styles.video}
                    crossOrigin="anonymous"
                    muted
                    playsInline
                />
                <canvas 
                    ref={canvasRef} 
                    className={styles.canvas}
                    width="640"
                    height="480"
                />
                <div className={styles.buttonContainer}>
                    {!isScanning ? (
                        <button 
                            className={styles.scanButton} 
                            onClick={startScanningRegister}
                        >
                            Iniciar Scanning
                        </button>
                    ) : (
                        <button 
                            className={styles.stopButton} 
                            onClick={stopScanning}
                        >
                            Detener Scanning
                        </button>
                    )}
                    {localStorage.getItem("idStudent") && (
                        <button 
                            className={styles.verifyButton} 
                            onClick={startScanningVerify}
                        >
                            Verificar Scanning
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaceRecognition;