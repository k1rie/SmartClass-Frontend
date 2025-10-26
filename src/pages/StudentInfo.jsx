import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import { 
  Users, 
  Delete, 
  Plus, 
  X, 
  Pencil, 
  Check, 
  FileText, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  Calendar,
  QrCode,
  Percent,
  Hash
} from "lucide-react";
import Navbar from "../components/Navbar";
import FaceRecognitionButton from "../components/FaceRecognitionButton";
import FaceRecordDeleteButton from "../components/FaceRecordDeleteButton";
import { BASE_API_URL } from "../config/constants";
import "../styles/scroll.css";

const StudentInfo = () => {
  const navigate = useNavigate();
  const { groupId, studentId } = useParams();
  
  // Student state
  const [studentInfo, setStudentInfo] = useState({
    nombre: '',
    apellidos: '',
    grado: '',
    grupo: '',
    especialidad: ''
  });

  const [tasks, setTasks] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteFaceModal, setShowDeleteFaceModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [newTask, setNewTask] = useState({
    nombre: "",
    rate: "",
    final_rate: ""
  });
  
  // Success states
  const [qrSuccess, setQrSuccess] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [permissionSuccess, setPermissionSuccess] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState(false);
  
  const attendanceSuccessRef = useRef(null);
  const permissionSuccessRef = useRef(null);


  // Función para cargar información del estudiante
  const getStudentInfo = async () => {
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/getStudent/${studentId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos del estudiante: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.length > 0) {
        setStudentInfo(data[0]);
      }
    } catch (error) {
      console.error("Error al cargar datos del estudiante:", error);
      setError(`Error: ${error.message}`);
    }
  };

  // Función para cargar las tareas desde el servidor
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const email = localStorage.getItem("email");
      const password = localStorage.getItem("password");
      
      if (!email || !password) {
        setError("No hay credenciales guardadas. Por favor inicie sesión.");
        setIsLoading(false);
        return;
      }

      // Crear credenciales en formato Basic Auth
      const credentials = btoa(`${email}:${password}`);
      
      console.log(`Solicitando tareas para el estudiante ID: ${studentId}`);
      
      const response = await fetch(`${BASE_API_URL}/getTasks/${studentId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener tareas: ${response.status}`);
      }

      const data = await response.json();
      console.log("Datos recibidos del servidor:", data);
      
      // Formatear los datos para el componente
      const formattedTasks = Array.isArray(data) ? data.map(task => ({
        id: task.id || task.name,
        name: task.name,
        rate: task.rate || 10,
        final_rate: task.final_rate,
        rateType: "points",
        inputValue: ""
      })) : [];

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos del estudiante y tareas al iniciar
  useEffect(() => {
    getStudentInfo();
    fetchTasks();
  }, [studentId]);

  // Función para manejar el cambio en el input del porcentaje o puntaje
  const handleValueChange = (e, taskId) => {
    const value = e.target.value;
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, inputValue: value }
          : task
      )
    );
  };

  // Función para alternar entre porcentaje y puntaje
  const toggleRateType = (task) => {
    const newTasks = tasks.map((t) => {
      if (t.id === task.id) {
        const newRateType = t.rateType === "percentage" ? "points" : "percentage"; // Cambiar tipo de calificación
        return { ...t, rateType: newRateType };
      }
      return t;
    });
    setTasks(newTasks);
  };

  // Función para enviar la calificación al servidor
  const changeFinalRate = async (task) => {
    try {
      // Validar que el input no esté vacío
      if (!task.inputValue) {
        alert("Por favor ingrese una calificación");
        return;
      }

      let finalRate;
      if (task.rateType === "percentage") {
        // Validar porcentaje
        if (Number(task.inputValue) < 0 || Number(task.inputValue) > 100) {
          alert("El porcentaje debe estar entre 0 y 100");
          return;
        }
        finalRate = (Number(task.inputValue) * task.rate) / 100; // Cálculo con porcentaje
      } else {
        // Validar puntaje
        if (Number(task.inputValue) < 0 || Number(task.inputValue) > task.rate) {
          alert(`La calificación debe estar entre 0 y ${task.rate}`);
          return;
        }
        finalRate = Number(task.inputValue); // Calificación directa (puntaje)
      }

      console.log("Datos enviados al servidor:", {
        newRate: finalRate,
        idStudent: Number(studentId),
        taskName: task.name,
        emailUser: localStorage.getItem("email"),
        password: localStorage.getItem("password"),
      });

      const response = await fetch(`${BASE_API_URL}/changeRateTask`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newRate: finalRate,
          idStudent: Number(studentId),
          taskName: task.name,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password"),
        }),
      });
      console.log( {newRate: finalRate,
        idStudent: Number(studentId),
        taskName: task.name,
        emailUser: localStorage.getItem("email"),
        password: localStorage.getItem("password"),});

      console.log("Estado de la respuesta:", response.status);
      
      // Intentar obtener el cuerpo de la respuesta
      const responseData = await response.json().catch(err => {
        console.log("La respuesta no es JSON válido:", err);
        return null;
      });
      
      console.log("Respuesta completa del servidor:", responseData);
      
      console.log(`Calificación actualizada para ${task.name}: ${finalRate}`);
      navigate(0);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar la calificación");
    }
  };

  // Delete confirmation modal
  const confirmDeleteState = async (confirm) => {
    if (confirm === true) {
      try {
        const response = await fetch(`${BASE_API_URL}/deleteStudent/${Number(studentId)}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            groupId: groupId,
            emailUser: localStorage.getItem("email"),
            password: localStorage.getItem("password")
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error al eliminar estudiante: ${response.status}`);
        }
        
        navigate(`/grupo/${groupId}`);
      } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        alert("Error al eliminar estudiante");
      }
    }
    setShowDeleteModal(false);
  };

  // Delete facial record confirmation modal
  const confirmDeleteFaceRecord = (confirm) => {
    if (confirm === true) {
       fetch(`${BASE_API_URL}/deleteFaceStudent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: studentId
        })
      })
      const event = new CustomEvent("delete-face-record", {
        detail: { studentId }
      });
      window.dispatchEvent(event);
    }
    setShowDeleteFaceModal(false);
  };

  // Function for QR code
  const sendQR = async () => {
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/sendQR`, {
        method: "POST",
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idStudent: studentId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al enviar QR: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("QR enviado exitosamente:", data);
      setQrSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        setShowQRModal(false);
        setQrSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error al enviar QR:", error);
      setError("Error al enviar el código QR");
    }
  };

  // Function to create attendance
  const createAttendance = async (e) => {
    e.preventDefault();
    if (!date) {
      setError("Por favor, seleccione una fecha");
      return;
    }
    
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/createAttendance`, {
        method: "POST",
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: studentInfo.nombre,
          lastName: studentInfo.apellidos,
          grade: studentInfo.grado,
          group: studentInfo.grupo,
          area: studentInfo.especialidad,
          date: date,
          id: studentId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al registrar asistencia: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Asistencia registrada:", data);
      
      setAttendanceSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        setShowAttendanceModal(false);
        setAttendanceSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error al registrar asistencia:", error);
      setError("Error al registrar la asistencia");
    }
  };

  // Function to create permission
  const createPermission = async (e) => {
    e.preventDefault();
    if (!date) {
      setError("Por favor, seleccione una fecha");
      return;
    }
    
    if (!reason) {
      setError("Por favor, ingrese una razón para el permiso");
      return;
    }
    
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/createPermission`, {
        method: "POST",
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: studentInfo.nombre,
          lastName: studentInfo.apellidos,
          grade: studentInfo.grado,
          group: studentInfo.grupo,
          area: studentInfo.especialidad,
          reason: reason,
          date: date,
          id: studentId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al registrar permiso: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Permiso registrado:", data);
      
      setPermissionSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        setShowPermissionModal(false);
        setPermissionSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error al registrar permiso:", error);
      setError("Error al registrar el permiso");
    }
  };

  // Function to create a new task
  const createTask = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!newTask.nombre || !newTask.rate || !newTask.final_rate) {
      setError("Por favor complete todos los campos");
      return;
    }
    
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/createTask`, {
        method: "POST",
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: newTask.nombre,
          rate: newTask.rate,
          grade: studentInfo.grado,
          group: studentInfo.grupo,
          area: studentInfo.especialidad,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password"),
          finalRate: newTask.final_rate,
          alumnosTask: [{ id: studentId }], // Just for this single student
          groupId: groupId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear tarea: ${response.status}`);
      }
      
      // We don't need to check the response body - if we got this far, consider it a success
      // Simplify the success handling, assuming the server response is valid
      // The task was created successfully
      setTaskSuccess(true);
      
      // Refresh tasks list
      await fetchTasks();
      
      // Auto-close after success
      setTimeout(() => {
        setShowNewTaskModal(false);
        setNewTask({ nombre: "", rate: "", final_rate: "" });
        setTaskSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error al crear tarea:", error);
      setError("Error al crear la tarea: " + error.message);
    }
  };

  return (
    <div className="pt-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col space-y-4">
          {/* Student Information Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">
                      {studentInfo.nombre} {studentInfo.apellidos}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {studentId}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <FaceRecognitionButton studentId={studentId} />
                  <FaceRecordDeleteButton
                    studentId={studentId}
                    onDelete={() => setShowDeleteFaceModal(true)}
                  />
                  <Button variant="outline" size="sm" onClick={() => setShowQRModal(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAttendanceModal(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Asistencia
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowPermissionModal(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Permiso
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Grado</Label>
                  <p className="text-base font-medium">{studentInfo.grado}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Grupo</Label>
                  <p className="text-base font-medium">{studentInfo.grupo}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Especialidad</Label>
                  <p className="text-base font-medium">{studentInfo.especialidad}</p>
                </div>
              </div>
            </CardContent>
          </Card>

         

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <CardTitle className="text-xl sm:text-2xl">Tareas</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowNewTaskModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  {error}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={fetchTasks}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No hay tareas disponibles para este estudiante
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[200px]">Tarea</TableHead>
                        <TableHead className="w-[100px]">Valor</TableHead>
                        <TableHead className="w-[150px]">Calificación Final</TableHead>
                        <TableHead className="text-right">Asignar Calificación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>{task.rate}</TableCell>
                          <TableCell>{task.final_rate !== null && task.final_rate !== undefined ? task.final_rate : 'No asignado'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRateType(task)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {task.rateType === "percentage" ? (
                                  <Percent className="w-4 h-4" />
                                ) : (
                                  <Hash className="w-4 h-4" />
                                )}
                              </Button>
                              <Input
                                type="number"
                                value={task.inputValue}
                                onChange={(e) => handleValueChange(e, task.id)}
                                placeholder={task.rateType === "percentage" ? "Porcentaje" : "Puntaje"}
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    changeFinalRate(task);
                                  }
                                }}
                                className="w-24"
                                min="0"
                                max={task.rateType === "percentage" ? "100" : task.rate}
                                step="0.1"
                              />
                              <Button
                                size="sm"
                                onClick={() => changeFinalRate(task)}
                                variant="outline"
                                className="px-2"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          
          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/60" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-card border rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 relative">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">Eliminar Estudiante</h3>
                  <p className="mb-6 text-sm sm:text-base">
                    ¿Estás seguro de que deseas eliminar a {studentInfo.nombre} {studentInfo.apellidos}? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        confirmDeleteState(true);
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Face Record confirmation modal */}
          {showDeleteFaceModal && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/60" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-card border rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 relative">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">Eliminar Registro Facial</h3>
                  <p className="mb-6 text-sm sm:text-base">
                    ¿Estás seguro de que deseas eliminar el registro facial de {studentInfo.nombre} {studentInfo.apellidos}? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteFaceModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        confirmDeleteFaceRecord(true);
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Modal */}
          {showQRModal && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/60" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-card border rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold">Enviar QR</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowQRModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {qrSuccess ? (
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">Código QR enviado correctamente.</span>
                      </div>
                    ) : (
                      <p className="text-center text-sm sm:text-base">
                        ¿Desea enviar el código QR para {studentInfo.nombre} {studentInfo.apellidos}?
                      </p>
                    )}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowQRModal(false)}
                        disabled={qrSuccess}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={sendQR}
                        disabled={qrSuccess}
                      >
                        Enviar QR
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Modal */}
          {showAttendanceModal && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/60" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-card border rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold">Registrar Asistencia</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowAttendanceModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {attendanceSuccess ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                      <span className="block sm:inline">Asistencia registrada correctamente.</span>
                    </div>
                  ) : (
                    <form onSubmit={createAttendance} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="attendance-date" className="text-sm sm:text-base">Fecha de Asistencia</Label>
                        <Input
                          id="attendance-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                          <span className="block sm:inline">{error}</span>
                        </div>
                      )}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAttendanceModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                        >
                          Registrar Asistencia
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permission Modal */}
          {showPermissionModal && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/60" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-card border rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold">Registrar Permiso</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPermissionModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {permissionSuccess ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                      <span className="block sm:inline">Permiso registrado correctamente.</span>
                    </div>
                  ) : (
                    <form onSubmit={createPermission} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="permission-date" className="text-sm sm:text-base">Fecha del Permiso</Label>
                        <Input
                          id="permission-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permission-reason" className="text-sm sm:text-base">Razón</Label>
                        <Input
                          id="permission-reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Ingrese el motivo del permiso"
                          required
                        />
                      </div>
                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                          <span className="block sm:inline">{error}</span>
                        </div>
                      )}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPermissionModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                        >
                          Registrar Permiso
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* New Task Modal */}
          {showNewTaskModal && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/60" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-card border rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold">Nueva Tarea</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewTaskModal(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {taskSuccess ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                      <span className="block sm:inline">Tarea creada correctamente.</span>
                    </div>
                  ) : (
                    <form onSubmit={createTask} className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="task-name" className="text-sm sm:text-base">Nombre de la Tarea</Label>
                          <Input
                            id="task-name"
                            value={newTask.nombre}
                            onChange={(e) => setNewTask({...newTask, nombre: e.target.value})}
                            placeholder="Ingrese el nombre de la tarea"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-rate" className="text-sm sm:text-base">Valor</Label>
                          <Input
                            id="task-rate"
                            type="number"
                            value={newTask.rate}
                            onChange={(e) => setNewTask({...newTask, rate: e.target.value})}
                            placeholder="Ingrese el valor de la tarea"
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-final-rate" className="text-sm sm:text-base">Calificación Inicial</Label>
                          <Input
                            id="task-final-rate"
                            type="number"
                            value={newTask.final_rate}
                            onChange={(e) => setNewTask({...newTask, final_rate: e.target.value})}
                            placeholder="Ingrese la calificación inicial"
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                      </div>
                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                          <span className="block sm:inline">{error}</span>
                        </div>
                      )}
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewTaskModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                        >
                          Crear Tarea
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentInfo; 