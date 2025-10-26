import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from "face-api.js";
import styles from "../styles/FaceRecognition.module.css";
import { BASE_API_URL } from "../config/constants";
import { Button } from "./ui/button";
import { X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { useParams } from 'react-router-dom';

const FaceVerificationModal = ({ isOpen, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
    const [isScanning, setIsScanning] = useState(false);
    const [detectionInterval, setDetectionInterval] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [verifiedStudent, setVerifiedStudent] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', 'quality_error', null
    const [attendanceStatus, setAttendanceStatus] = useState(null); // 'registered', 'already_registered', 'error', null
    const [qualityError, setQualityError] = useState(null); // 'low_score', 'small_face', 'no_face'
    const [qualityStatus, setQualityStatus] = useState(null); // 'good', 'poor', null
    const [currentScore, setCurrentScore] = useState(0);
    const [currentSize, setCurrentSize] = useState({ width: 0, height: 0 });
    const { id } = useParams();
    useEffect(() => {
        if (isOpen) {
            startVideo();
            loadModels();
        }
        return () => {
            if (detectionInterval) {
                clearInterval(detectionInterval);
            }
        };
    }, [isOpen]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    const width = videoRef.current.videoWidth || 640;
                    const height = videoRef.current.videoHeight || 480;
                    setVideoDimensions({ width, height });
                    if (canvasRef.current) {
                        canvasRef.current.width = width;
                        canvasRef.current.height = height;
                    }
                };
                videoRef.current.play();
            }
        }).catch(error => {
            console.error("Error accessing camera:", error);
        });
    };

    const loadModels = async () => {
        try {
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            await faceapi.nets.faceExpressionNet.loadFromUri("/models");
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            
            console.log("Modelos cargados correctamente");
            setModelsLoaded(true);
        } catch (error) {
            console.error("Error cargando modelos:", error);
        }
    };

    const startScanningVerify = () => {
        if (!isScanning && modelsLoaded) {
            console.log("Iniciando reconocimiento facial para verificación...");
            setIsScanning(true);
            setVerificationStatus(null);
            setQualityError(null);
            setQualityStatus(null);
            
            const interval = setInterval(async() => {
                try {
                    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) return;
                    
                    const detections = await faceapi
                        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors();
                    
                    if(detections.length > 0){
                        const detection = detections[0];
                        const score = detection.detection.score;
                        const box = detection.detection.box;
                        const minScore = 0.9;
                        const MIN_FACE_SIZE_PX = 150;
                        
                        // Actualizar valores actuales
                        setCurrentScore(score);
                        setCurrentSize({ width: box.width, height: box.height });
                        
                        // Evaluar calidad
                        if (score >= minScore && box.width >= MIN_FACE_SIZE_PX && box.height >= MIN_FACE_SIZE_PX) {
                            setQualityStatus('good');
                            setQualityError(null);
                            
                            // Calidad aceptable, proceder con la verificación
                            console.log("Calidad aceptable - Score:", score, "Tamaño:", box.width, "x", box.height);
                            clearInterval(interval);
                            verifyFaceStudent(detection.descriptor, score, box);
                            localStorage.setItem("groupId", id);
                        } else {
                            setQualityStatus('poor');
                            if (score < minScore) {
                                setQualityError('low_score');
                            } else if (box.width < MIN_FACE_SIZE_PX || box.height < MIN_FACE_SIZE_PX) {
                                setQualityError('small_face');
                            }
                        }
                    } else {
                        setQualityStatus(null);
                        setQualityError(null);
                        setCurrentScore(0);
                        setCurrentSize({ width: 0, height: 0 });
                    }
                    
                    // Clear canvas before drawing
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    
                    const drawSize = { width: videoDimensions.width, height: videoDimensions.height };
                    faceapi.matchDimensions(canvasRef.current, drawSize);
                    const resizedDetections = faceapi.resizeResults(detections, drawSize);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

                } catch (error) {
                    console.error("Error in face detection:", error);
                }
            }, 500); // Reducir intervalo para mejor responsividad
            setDetectionInterval(interval);
        }
    };

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

    const registerAttendance = (studentData) => {
        const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
        
        fetch(`${BASE_API_URL}/attendance`, {
            method: "POST",
            headers: {
                'Authorization': `Basic ${credentials}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: studentData.nombre,
                lastName: studentData.apellidos,
                grade: studentData.grado,
                group: studentData.grupo,
                area: studentData.especialidad,
                id: studentData.id,
                emailUser: localStorage.getItem("email")
            })
        })
        .then(data => data.json())
        .then(data => {
            console.log("Attendance response:", data);
            if (data.response === true) {
                setAttendanceStatus('registered');
            }else{
                setAttendanceStatus('Dont recognize');
            }
        })
        .catch(error => {
            console.error("Error registering attendance:", error);
            setAttendanceStatus('error');
        });
    };

    const verifyFaceStudent = (descriptor, score, box) => {
        console.log(`El embeding es: ${descriptor}`);
        const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
        const embedding = new Float32Array(descriptor);
        
        // Stop scanning while processing
        setIsScanning(false);
        if (detectionInterval) {
            clearInterval(detectionInterval);
            setDetectionInterval(null);
        }
        
        // La calidad ya fue validada en tiempo real, proceder directamente con la verificación
        fetch(`${BASE_API_URL}/searchFaceStudent`, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                "Content-Type": "application/json"
              },
            method: "POST",
            body: JSON.stringify({
                groupId: id,
                embedding: Array.from(embedding),
                k: 20
            })
        })
        .then(data => data.json())
        .then(data => {
            console.log(data);
            if (data && data.id) {
                // Student found successfully
                setVerifiedStudent(data);
                setVerificationStatus('success');
                // Register attendance automatically
                registerAttendance(data);
            } else {
                // No student found
                setVerifiedStudent(null);
                setVerificationStatus('error');
                setAttendanceStatus(null);
            }
        })
        .catch(error => {
            console.error("Error verificando cara:", error);
            setVerifiedStudent(null);
            setVerificationStatus('error');
            setAttendanceStatus(null);
        });
    };

    const continueVerification = () => {
        setVerifiedStudent(null);
        setVerificationStatus(null);
        setAttendanceStatus(null);
        setQualityError(null);
        setQualityStatus(null);
        setCurrentScore(0);
        setCurrentSize({ width: 0, height: 0 });
        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleClose = () => {
        stopScanning();
        // Stop video stream
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        // Reset states
        setVerifiedStudent(null);
        setVerificationStatus(null);
        setAttendanceStatus(null);
        setQualityError(null);
        setQualityStatus(null);
        setCurrentScore(0);
        setCurrentSize({ width: 0, height: 0 });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/60 dark:bg-black/80" />
            <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
                <div className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            {id ? "Verificación Facial" : "Verificación de Grupo"}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-6">
                        {/* Video Section - Centered */}
                        <div className="flex flex-col items-center w-full">
                            <div className="relative w-full max-w-[640px] mx-auto">
                                <video
                                    ref={videoRef}
                                    className={`w-full h-auto rounded-xl shadow-2xl border-2 object-cover transition-colors duration-300 ${
                                        qualityStatus === 'good' 
                                            ? 'border-green-500 shadow-green-500/30' 
                                            : qualityStatus === 'poor' 
                                                ? 'border-yellow-500 shadow-yellow-500/30' 
                                                : 'border-blue-500/30'
                                    }`}
                                    style={{ transform: 'scaleX(-1)' }}
                                    crossOrigin="anonymous"
                                    muted
                                    playsInline
                                />
                                <canvas 
                                    ref={canvasRef} 
                                    className="absolute inset-0 w-full h-full rounded-xl pointer-events-none"
                                />
                                
                                {/* Indicador de calidad en tiempo real */}
                                {isScanning && (
                                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${
                                                qualityStatus === 'good' 
                                                    ? 'bg-green-500 animate-pulse' 
                                                    : qualityStatus === 'poor' 
                                                        ? 'bg-yellow-500' 
                                                        : 'bg-gray-500'
                                            }`}></div>
                                            <span className="text-sm font-medium">
                                                {qualityStatus === 'good' 
                                                    ? 'Calidad Excelente' 
                                                    : qualityStatus === 'poor' 
                                                        ? 'Ajustando...' 
                                                        : 'Buscando rostro...'}
                                            </span>
                                        </div>
                                        {currentScore > 0 && (
                                            <div className="text-xs space-y-1">
                                                <div>Score: {(currentScore * 100).toFixed(1)}%</div>
                                                <div>Tamaño: {Math.round(currentSize.width)}x{Math.round(currentSize.height)}px</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-center">
                                {!isScanning && verificationStatus === null ? (
                                    <button 
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={startScanningVerify}
                                        disabled={!modelsLoaded}
                                    >
                                        {id ? "Verificar Cara" : "Verificar Grupo"}
                                    </button>
                                ) : isScanning ? (
                                    <button 
                                        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-lg"
                                        onClick={stopScanning}
                                    >
                                        Detener Verificación
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        {/* Results Section - Below video and button */}
                        <div className="w-full max-w-md">
                            {verificationStatus === 'success' && verifiedStudent && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Verificación Exitosa</h3>
                                    </div>
                                    <div className="space-y-2 text-gray-700 dark:text-gray-300">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                                            <span className="ml-2 font-medium text-foreground">{verifiedStudent.nombre} {verifiedStudent.apellidos}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Correo:</span>
                                            <span className="ml-2 text-foreground">{verifiedStudent.correo}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Especialidad:</span>
                                            <span className="ml-2 text-foreground">{verifiedStudent.especialidad}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Grado:</span>
                                            <span className="ml-2 text-foreground">{verifiedStudent.grado}°</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Grupo:</span>
                                            <span className="ml-2 text-foreground">{verifiedStudent.grupo}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Attendance Status */}
                                    <div className="mt-4 p-3 rounded-md">
                                        {attendanceStatus === 'registered' && (
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-medium">✓ Asistencia registrada exitosamente</span>
                                            </div>
                                        )}
                                        {attendanceStatus === 'already_registered' && (
                                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                <span className="text-sm font-medium">⚠ Asistencia ya registrada anteriormente</span>
                                            </div>
                                        )}
                                        {attendanceStatus === 'error' && (
                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span className="text-sm font-medium">✗ Error al registrar asistencia</span>
                                            </div>
                                        )}
                                        {attendanceStatus === 'Dont recognize' && (
                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span className="text-sm font-medium">✗ No se pudo identificar al estudiante</span>
                                            </div>
                                        )}
                                        {attendanceStatus === null && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm">Registrando asistencia...</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-4 flex gap-2">
                                        <button 
                                            onClick={continueVerification}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                                        >
                                            Verificar Otro Alumno
                                        </button>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === 'error' && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Verificación Fallida</h3>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                        No se pudo identificar al estudiante. Asegúrate de que el rostro esté bien iluminado y visible.
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={continueVerification}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                                        >
                                            Intentar Nuevamente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === 'quality_error' && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Calidad de Imagen Insuficiente</h3>
                                    </div>
                                    {qualityError === 'low_score' && (
                                        <div className="space-y-3">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                La calidad de la detección facial es muy baja. Por favor:
                                            </p>
                                            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1 ml-4">
                                                <li>• Mejora la iluminación de tu rostro</li>
                                                <li>• Asegúrate de estar de frente a la cámara</li>
                                                <li>• Evita sombras en tu cara</li>
                                                <li>• Mantén una expresión neutra</li>
                                            </ul>
                                        </div>
                                    )}
                                    {qualityError === 'small_face' && (
                                        <div className="space-y-3">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                Tu rostro aparece muy pequeño en la imagen. Por favor:
                                            </p>
                                            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1 ml-4">
                                                <li>• Acércate más a la cámara</li>
                                                <li>• Asegúrate de que tu rostro ocupe la mayor parte del video</li>
                                                <li>• Mantén una distancia de 30-50 cm de la cámara</li>
                                            </ul>
                                        </div>
                                    )}
                                    <div className="mt-4 flex gap-2">
                                        <button 
                                            onClick={continueVerification}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
                                        >
                                            Intentar Nuevamente
                                        </button>
                                    </div>
                                </div>
                            )}

                            {verificationStatus === null && (
                                <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-400">Listo para Verificar</h3>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        Haz clic en "Verificar Cara" para comenzar el reconocimiento facial.
                                    </p>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Consejos para mejor reconocimiento:</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                            • Asegúrate de tener buena iluminación<br/>
                                            • Posiciónate de frente a la cámara<br/>
                                            • Mantén el rostro centrado en el video
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceVerificationModal;
