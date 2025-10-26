import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle,
  Clock,
  User,
  LoaderCircle,
  GraduationCap
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useTheme } from "../context/ThemeContext";
import { BASE_API_URL } from "../config/constants";

const Scanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStudentInfo, setLoadingStudentInfo] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [response, setResponse] = useState(null);
  const { theme } = useTheme();
  
  const correctSVGHTML = useRef(null);
  const notCorrectSVGHTML = useRef(null);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null); // Reference to store the scanner instance

  // Inicialización y limpieza del escáner
  useEffect(() => {
    if (isScanning && !scannerInitialized) {
      setLoading(true);
      
      try {
        // Configuración de colores según el tema
        const isDarkMode = theme === 'dark';
        
        // Crear nuevo escáner con colores adaptados al tema
        const scanner = new Html5QrcodeScanner(
          "qr-reader", 
          { 
            fps: 10,
            qrbox: 250,
            disableFlip: false,
            showTorchButtonIfSupported: true,
            rememberLastUsedCamera: true,
            // Personalización para tema oscuro/claro
            formatsToSupport: [0], // Solo formato QR
            videoConstraints: {
              facingMode: "environment"
            }
          },
          false // No iniciar escaneo automáticamente
        );
        
        // Store the scanner instance in ref for later access
        scannerInstanceRef.current = scanner;
        
        // Configurar callbacks
        scanner.render(onScanSuccess, onScanError);
        setScannerInitialized(true);
        setLoading(false);
        
        // Aplicar estilos al escáner según el tema
        setTimeout(() => {
          applyThemeStyles(isDarkMode);
        }, 100);
      } catch (error) {
        console.error("Error initializing scanner:", error);
        setCameraError(`Error al iniciar el escáner: ${error.message}`);
        setIsScanning(false);
        setLoading(false);
      }
    }

    // Limpieza cuando el componente se desmonta o se detiene el escaneo
    return () => {
      if (scannerInstanceRef.current && !isScanning) {
        try {
          scannerInstanceRef.current.clear();
          scannerInstanceRef.current = null;
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
      }
    };
  }, [isScanning, scannerInitialized, theme]);

  // Función para aplicar estilos según el tema
  const applyThemeStyles = (isDarkMode) => {
    try {
      const scannerElement = document.getElementById('qr-reader');
      if (!scannerElement) return;
      
      // Aplicar estilos al contenedor principal
      scannerElement.style.border = isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb';
      scannerElement.style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
      
      // Encontrar y estilizar los elementos internos
      const headerElement = scannerElement.querySelector('div:first-child');
      if (headerElement) {
        headerElement.style.backgroundColor = isDarkMode ? '#111827' : '#f3f4f6';
        headerElement.style.color = isDarkMode ? '#e5e7eb' : '#111827';
        headerElement.style.borderBottom = isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb';
      }
      
      // Estilizar botones
      const buttons = scannerElement.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.innerText.includes('Stop')) {
          button.style.backgroundColor = '#ef4444';
          button.style.color = 'white';
          button.style.border = 'none';
        } else {
          button.style.backgroundColor = isDarkMode ? '#3b82f6' : '#3b82f6';
          button.style.color = 'white';
          button.style.border = 'none';
        }
        
        button.style.padding = '0.5rem 1rem';
        button.style.borderRadius = '0.375rem';
      });
      
      // Estilizar mensajes y textos
      const paragraphs = scannerElement.querySelectorAll('p, span, div');
      paragraphs.forEach(p => {
        if (!p.style.backgroundColor) {
          p.style.color = isDarkMode ? '#e5e7eb' : '#111827';
        }
      });
      
      // Estilizar select para cámaras
      const selects = scannerElement.querySelectorAll('select');
      selects.forEach(select => {
        select.style.backgroundColor = isDarkMode ? '#374151' : '#f9fafb';
        select.style.color = isDarkMode ? '#e5e7eb' : '#111827';
        select.style.border = isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db';
        select.style.borderRadius = '0.375rem';
        select.style.padding = '0.5rem';
      });
    } catch (error) {
      console.error("Error applying theme styles:", error);
    }
  };

  const startScanner = () => {
    setCameraError("");
    setIsScanning(true);
  };

  const stopScanner = () => {
    // First, try to stop the scanner directly if we have access to the Html5Qrcode instance
    if (scannerInstanceRef.current) {
      try {
        // Try to stop scanning directly using the scanner instance
        scannerInstanceRef.current.clear();
        scannerInstanceRef.current = null;
      } catch (e) {
        console.error("Error during direct scanner stop:", e);
      }
    }
    
    setIsScanning(false);
    setScannerInitialized(false);
    
    // Clean up the DOM
    try {
      const scannerElement = document.getElementById('qr-reader');
      if (scannerElement) {
        while (scannerElement.firstChild) {
          scannerElement.removeChild(scannerElement.firstChild);
        }
      }
    } catch (e) {
      console.error("Error cleaning up scanner DOM:", e);
    }
  };

  const getStudent = (studentId) => {
    if (!studentId) return;
    
    setLoadingStudentInfo(true);
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    fetch(`${BASE_API_URL}/getStudent/${studentId}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        "Content-Type": "application/json"
      }
    })
    .then(data => data.json())
    .then(data => {
      setLoadingStudentInfo(false);
      if (data && data.length > 0) {
        setStudentInfo(data[0]);
      }
    })
    .catch(error => {
      setLoadingStudentInfo(false);
      console.error("Error fetching student info:", error);
    });
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
      setResponse(data.response);
      setScannedData(prev => ({
        ...prev,
        estado: data.response === true ? "Presente" : 
               data.message === "attendance already registered" ? "Asistencia ya registrada" : 
               "Error al registrar"
      }));
    })
    .catch(error => {
      console.error("Error registering attendance:", error);
      setResponse(false);
      setScannedData(prev => ({
        ...prev,
        estado: "Error al registrar"
      }));
    });
  };

  const onScanSuccess = (decodedText) => {
    console.log("QR escaneado:", decodedText);
    
    // Detener el escaneo de inmediato - usando una actualización inmediata del estado
    // y manejando directamente el scanner
    if (scannerInstanceRef.current) {
      try {
        // Try to immediately pause/stop scanning
        const videoElement = document.querySelector('#qr-reader video');
        if (videoElement) {
          // Pause the video immediately
          videoElement.pause();
          
          // Try accessing the media stream and stopping it
          if (videoElement.srcObject) {
            const tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
          }
        }
      } catch (e) {
        console.error("Error stopping video stream:", e);
      }
    }
    
    // Now call the regular stopScanner function
    stopScanner();
    
    try {
      let studentData;
      let studentId = null;
      
      // Check if it's a URL format (like the tasks-flow URL pattern)
      if (decodedText.startsWith("http") && decodedText.includes("/attendance/")) {
        // Parse URL format: .../attendance/id/name/s/grade/group/area/email
        const url = new URL(decodedText);
        const pathParts = url.pathname.split('/').filter(part => part);
        
        // Find the index of "attendance" in the path
        const attendanceIndex = pathParts.findIndex(part => part === "attendance");
        
        if (attendanceIndex >= 0 && pathParts.length >= attendanceIndex + 7) {
          studentId = pathParts[attendanceIndex + 1] || "";
          const name = pathParts[attendanceIndex + 2] || "";
          // pathParts[attendanceIndex + 3] should be "s"
          const grade = pathParts[attendanceIndex + 4] || "";
          const group = pathParts[attendanceIndex + 5] || "";
          const area = pathParts[attendanceIndex + 6] || "";
          const email = pathParts[attendanceIndex + 7] || "";
          
          studentData = {
            nombre: decodeURIComponent(name),
            apellidos: "",
            id: decodeURIComponent(studentId),
            grupo: decodeURIComponent(group),
            grado: decodeURIComponent(grade),
            especialidad: decodeURIComponent(area),
            hora: new Date().toLocaleTimeString(),
            estado: "Procesando..."
          };
        } else {
          throw new Error("URL format not recognized");
        }
      } else {
        // Try to parse as JSON
        const data = JSON.parse(decodedText);
        
        studentId = data.id;
        studentData = {
          nombre: data.name || data.nombre || "No disponible",
          apellidos: data.lastName || data.apellidos || "",
          id: data.id || "No disponible",
          grupo: data.group || data.grupo || "No disponible",
          grado: data.grade || data.grado || "No disponible",
          especialidad: data.area || data.especialidad || "No disponible",
          hora: new Date().toLocaleTimeString(),
          estado: "Procesando..."
        };
      }
      
      setScannedData(studentData);
      
      // Fetch detailed student info
      if (studentId) {
        getStudent(studentId);
      }
      
      // Call attendance API
      registerAttendance(studentData);
    } catch (error) {
      console.error("Error parsing QR:", error);
      // If parsing fails, display as raw data
      setScannedData({
        nombre: "Formato desconocido",
        id: decodedText.substring(0, 20) + (decodedText.length > 20 ? "..." : ""),
        grupo: "Desconocido",
        hora: new Date().toLocaleTimeString(),
        estado: "Detectado (Formato inválido)"
      });
      setResponse(false);
    }
  };

  const onScanError = (error) => {
    // No mostrar errores de escaneo normales (ocurren constantemente mientras se busca un QR)
    // console.error("Error de escaneo:", error);
  };

  const resetScanner = () => {
    setScannedData(null);
    setStudentInfo(null);
    setResponse(null);
  };

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground">Scanner QR</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Camera className="w-5 h-5 mr-2" />
                Área de Escaneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-2 sm:p-4">
                {isScanning ? (
                  <div className="w-full max-w-md">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-48 sm:h-64">
                        <LoaderCircle className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-blue-500 mb-2 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Iniciando cámara...</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div 
                          id="qr-reader" 
                          className="w-full rounded-lg overflow-hidden" 
                          style={{ 
                            minHeight: "200px",
                            maxHeight: "400px",
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        ></div>
                        <p className="mt-2 sm:mt-4 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
                          Apunta la cámara al código QR
                        </p>
                      </div>
                    )}
                    
                    {cameraError && (
                      <p className="mt-2 sm:mt-4 text-center text-sm sm:text-base text-red-500 dark:text-red-400">{cameraError}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 sm:p-8">
                    <QrCode className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4 sm:mb-6" />
                    <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Presiona el botón para activar la cámara y escanear un código QR
                    </p>
                    <button
                      onClick={startScanner}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base"
                      disabled={scannedData !== null}
                    >
                      Iniciar Escaneo
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="w-5 h-5 mr-2" />
                Resultado del Escaneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scannedData ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {response === true ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2" />
                          <span className="font-medium text-sm sm:text-base">Registro Exitoso</span>
                        </>
                      ) : response === false ? (
                        <>
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
                          <span className="font-medium text-sm sm:text-base">
                            {scannedData.estado === "Asistencia ya registrada" 
                              ? "Ya Registrado" 
                              : "Error en Registro"}
                          </span>
                        </>
                      ) : (
                        <>
                          <LoaderCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 animate-spin" />
                          <span className="font-medium text-sm sm:text-base">Procesando...</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{scannedData.hora}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
                    {loadingStudentInfo ? (
                      <div className="flex flex-col items-center justify-center py-3 sm:py-4">
                        <LoaderCircle className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500 mb-2" />
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Cargando información del estudiante...</p>
                      </div>
                    ) : studentInfo ? (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2" />
                          <h3 className="font-semibold text-base sm:text-lg">Información del Estudiante</h3>
                        </div>
                        <div className="space-y-2 divide-y divide-gray-200 dark:divide-gray-700">
                          <div className="flex justify-between py-1">
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Nombre Completo:</span>
                            <span className="font-medium text-xs sm:text-sm">
                              {studentInfo.nombre} {studentInfo.apellidos}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Grado:</span>
                            <span className="font-medium text-xs sm:text-sm">{studentInfo.grado}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Grupo:</span>
                            <span className="font-medium text-xs sm:text-sm">{studentInfo.grupo}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Especialidad:</span>
                            <span className="font-medium text-xs sm:text-sm">{studentInfo.especialidad}</span>
                          </div>
                          {studentInfo.email && (
                            <div className="flex justify-between py-1">
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Email:</span>
                              <span className="font-medium text-xs sm:text-sm">{studentInfo.email}</span>
                            </div>
                          )}
                          {studentInfo.telefono && (
                            <div className="flex justify-between py-1">
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Teléfono:</span>
                              <span className="font-medium text-xs sm:text-sm">{studentInfo.telefono}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Nombre:</span>
                          <span className="font-medium text-xs sm:text-sm">{scannedData.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">ID:</span>
                          <span className="font-medium text-xs sm:text-sm">{scannedData.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Grupo:</span>
                          <span className="font-medium text-xs sm:text-sm">{scannedData.grupo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Estado:</span>
                          <span className="font-medium text-xs sm:text-sm text-green-500">{scannedData.estado}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm sm:text-base"
                      onClick={resetScanner}
                    >
                      Nuevo Escaneo
                    </button>
                    <button 
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm sm:text-base"
                      onClick={startScanner}
                    >
                      Escanear Otro
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500 dark:text-gray-400">
                  <XCircle className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base">No se ha escaneado ningún código QR</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scanner;