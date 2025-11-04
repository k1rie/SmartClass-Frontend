import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Users, Delete, Plus, X, Pencil, Check, FileText, BarChart2, Trash2, Search, Download, Upload, Calendar, ArrowRight, Camera, BarChart3, TrendingUp, Mail, Link2, Copy } from "lucide-react";
import { BASE_API_URL } from "../config/constants";
import Navbar from "../components/Navbar";
import { useRef } from "react";
import "../styles/scroll.css";
import Loader from "../components/ui/loader";
import FaceVerificationModal from "../components/FaceVerificationModal";
import PerformanceChart from "../components/PerformanceChart";
import StudentPerformanceChart from "../components/StudentPerformanceChart";
import SendMessageModal from "../components/SendMessageModal";

const Grupo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [groupInfo, setGroupInfo] = useState({
    grado: '',
    group: '',
    especialidad: ''
  });
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingRateId, setEditingRateId] = useState(null);
  const [newNameTask, setNewNameTask] = useState("");
  const [newRateTask, setNewRateTask] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskRate, setTaskRate] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupData, setGroupData] = useState({
    grade: '',
    group: '',
    area: ''
  });
  const [editError, setEditError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [verificationModal, setVerificationModal] = useState({ isOpen: false, studentId: null });
  const [showPerformanceChart, setShowPerformanceChart] = useState(false);
  const [studentPerformanceModal, setStudentPerformanceModal] = useState({ isOpen: false, studentId: null, studentName: '' });
  const [messageModal, setMessageModal] = useState({ isOpen: false, student: null });

  // Join link generation state
  const [showJoinLinkModal, setShowJoinLinkModal] = useState(false);
  const [generatingJoinLink, setGeneratingJoinLink] = useState(false);
  const [generatedJoinLink, setGeneratedJoinLink] = useState(null);
  const [copiedJoin, setCopiedJoin] = useState(false);

  const generateJoinLinkForGroup = async () => {
    try {
      setGeneratingJoinLink(true);
      setGeneratedJoinLink(null);
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const res = await fetch(`${BASE_API_URL}/generateJoinLink`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId: Number(id) })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedJoinLink(data.link);
      }
    } catch (e) {
      console.error('Error generando enlace de unión:', e);
    } finally {
      setGeneratingJoinLink(false);
    }
  };

  const copyJoinLink = () => {
    if (!generatedJoinLink?.fullLink) return;
    navigator.clipboard.writeText(generatedJoinLink.fullLink);
    setCopiedJoin(true);
    setTimeout(() => setCopiedJoin(false), 1500);
  };

  const removeDuplicates = (data) => {
    if (!Array.isArray(data)) return [];
    
    const uniqueMap = new Map();
    
    data.forEach(student => {
      const key = `${student.apellidos}-${student.nombre}-${student.grado}-${student.grupo}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, student);
      }
    });
    
    return Array.from(uniqueMap.values());
  };

  

  const [showAttendances, setShowAttendances] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [date, setDate] = useState("");
  const confirmDeleteRef = useRef(null);
  const attendanceModalRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Actualizar groupData cuando groupInfo cambie
  // Cargar información del grupo
  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
        const response = await fetch(`${BASE_API_URL}/getClassroom/${id}`, {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.length > 0) {
          setGroupInfo(data[0]);
          setGroupData({
            grade: data[0].grado,
            group: data[0].grupo,
            area: data[0].especialidad
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchGroupInfo();
  }, [id]);

  // Actualizar groupData cuando groupInfo cambie
  useEffect(() => {
    setGroupData({
      grade: groupInfo.grado || "",
      group: groupInfo.grupo || "",
      area: groupInfo.especialidad || ""
    });
  }, [groupInfo]);

  // Buscar estudiantes
  const fetchStudentResults = async (query) => {
    if (!query.trim()) {
      setStudentResults([]);
      return;
    }

    setLoading(true);
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/getStudentByName/${query}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.status}`);
      }

      const data = await response.json();
      const uniqueResults = removeDuplicates(data);
      setStudentResults(uniqueResults);
    } catch (error) {
      console.error('Error buscando estudiantes:', error);
      setStudentResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar grupos para importar
  const fetchGroupResults = async (query) => {
    if (!query.trim()) {
      setGroupResults([]);
      return;
    }

    setLoading(true);
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/getClassroomByName/${query}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Basic ${credentials}`,
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      setGroupResults(data);
    } catch (error) {
      console.error('Error buscando grupos:', error);
      setGroupResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Importar grupo
  const importGroup = async (idGroup, idNewGroup) => {
    try {
      setLoadingText("Importando grupo...");
      setIsLoading(true);
      
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/importGroup`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idGroup: idGroup,
          idNewGroup: idNewGroup,
          emailUser: localStorage.getItem("email")
        })
      });

      if (!response.ok) {
        throw new Error(`Error al importar: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        navigate(0);
      } else {
        throw new Error(data.message || 'Error al importar el grupo');
      }
    } catch (error) {
      console.error('Error importando grupo:', error);
      alert('Error al importar el grupo: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar calificaciones
  const exportCalifications = async () => {
    try {
      setLoadingText("Exportando calificaciones...");
      setIsLoading(true);
      
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/getDataList/${id}/${groupInfo.grado}/${groupInfo.grupo}/${groupInfo.especialidad}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error exportando calificaciones:', error);
      alert('Error al exportar calificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar resumen
  const exportResume = async () => {
    try {
      setLoadingText("Exportando resumen...");
      setIsLoading(true);
      
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/getResume/${id}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Resumen.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error exportando resumen:', error);
      alert('Error al exportar resumen');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar búsqueda de estudiantes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (studentSearchTerm) {
        fetchStudentResults(studentSearchTerm);
      } else {
        setStudentResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [studentSearchTerm]);

  // Manejar búsqueda de grupos
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (groupSearchTerm) {
        fetchGroupResults(groupSearchTerm);
      } else {
        setGroupResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [groupSearchTerm]);

  // Navegar al perfil del estudiante
  const handleStudentClick = (student) => {
    navigate(`/student/group/${id}/${student.id}`);
    setStudentSearchTerm('');
    setStudentResults([]);
  };

  // Funciones de eliminación
  const addConfirmDelete = (element) => {
    if (element) {
      element.style.display = "flex";
    }
  };

  const confirmDeleteState = async (confirm) => {
    if (confirm) {
      try {
        setLoadingText("Eliminando grupo...");
        setIsLoading(true);
        
        const response = await fetch(`${BASE_API_URL}/deleteClassroom/${Number(id)}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            emailUser: localStorage.getItem("email"),
            password: localStorage.getItem("password")
          })
        });

        if (!response.ok) {
          throw new Error(`Error al eliminar: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        navigate("/grupos");
      } catch (error) {
        console.error('Error al eliminar grupo:', error);
        alert('Error al eliminar el grupo: ' + error.message);
      } finally {
        setIsLoading(false);
        setShowDeleteModal(false);
      }
    } else {
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    getGroupInfo();
    getStudents();
    getTasksGroup();
  }, [id]);

  async function getGroupInfo() {
    const credentials = btoa(`${localStorage.getItem('email')}:${localStorage.getItem('password')}`);
    try {
      const response = await fetch(`${BASE_API_URL}/getClassroom/${id}`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        setGroupInfo(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function getStudents() {
    const credentials = btoa(`${localStorage.getItem('email')}:${localStorage.getItem('password')}`);
    try {
      const response = await fetch(`${BASE_API_URL}/getStudents/${id}`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        setStudents(data);
        console.log(data)

      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function getTasksGroup(){
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    fetch(`${BASE_API_URL}/getTasksGroup/${id}`,{
      headers:{
        'Authorization': `Basic ${credentials}`,
        "Content-Type": "application/json"
      },
    }).then(data=>data.json()).then(data=>{
      if(data.length > 0){
        console.log("Tasks data:", data);
        // Make sure each task has a name property
        const processedTasks = data.map(task => ({
          ...task,
          name: task.name || task.nombre
        }));
        setTasks(processedTasks);
      }else{
        setTasks([]);
      }
    })
  }

  const handleNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      changeNameTask(task.id, task.name);
      task.name = newNameTask;
    }
  };

  const handleRateKeyDown = (e, task) => {
    if (e.key === "Enter") {
      changeRateTaskGroup(task.id);
    }
  };

  const changeNameTask = async (id, oldName) => {
    try {
      await fetch(BASE_API_URL + "/changeNameTask", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          alumnosTask: students,
          newTaskName: newNameTask,
          nameTask: oldName,
          idTask: id,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      // Actualizar estado local inmediatamente
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, name: newNameTask } : task
      ));
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error updating task name:', error);
    }
  };

  const changeRateTaskGroup = async (id) => {
    try {
      setLoadingText("Actualizando valor de la tarea...");
      setIsLoading(true);
      
      // Find the task to get its name
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) {
        throw new Error("Tarea no encontrada");
      }
      
      const taskName = taskToUpdate.name || taskToUpdate.nombre;
      const oldRate = taskToUpdate.rate;
      
      console.log("Updating task:", { id, taskName, oldRate, newRate: newRateTask });
      console.log("Students:", students);
      
      const response = await fetch(BASE_API_URL + "/changeRateTaskGroup", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          alumnosTask: students,
          newRate: newRateTask,
          nameTask: taskName,
          rate: oldRate,
          idTask: id,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Response from server:", data);
      
      // Actualizar estado local inmediatamente
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, rate: newRateTask } : task
      ));
      
      // Actualizar la lista de estudiantes para reflejar los cambios
      await getStudents();
      
      setEditingRateId(null);
    } catch (error) {
      console.error('Error updating task rate:', error);
      alert('Error al actualizar el valor de la tarea. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id, taskName) => {
    try {
      await fetch(BASE_API_URL + "/deleteTask", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          alumnosTask: students,
          id,
          nameTask: taskName,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      // Update local state
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const [student, setStudent] = useState({
    nombre: "",
    apellidos: "",
    correo: ""
  });
  const [task, setTask] = useState({
    nombre: "",
    rate: ""
  });
  const [form2, setForm2] = useState(null);

  async function addStudentDB() {
    if (!student.nombre || !student.apellidos || !student.correo) {
      alert('Por favor complete todos los campos');
      return;
    }
    
    try {
      setLoadingText("Añadiendo estudiante...");
      setIsLoading(true);
      
      const credentials = btoa(`${localStorage.getItem('email')}:${localStorage.getItem('password')}`);
      const response = await fetch(`${BASE_API_URL}/createStudent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: student.nombre,
          apellidos: student.apellidos,
          grupo: groupInfo.grupo,
          grado: groupInfo.grado,
          especialidad: groupInfo.especialidad,
          correo: student.correo,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password"),
          groupId: id
        })
      });
      
      const data = await response.json();
      if (data.insertId) {
        await getStudents();
        setShowForm(false);
        setStudent({ nombre: "", apellidos: "", correo: "" });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al añadir estudiante');
    } finally {
      setIsLoading(false);
    }
  }

  async function addTaskDB() {
    if (students.length !== 0) {
      try {
        setLoadingText("Añadiendo tarea...");
        setIsLoading(true);
        
        const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
        const response = await fetch(`${BASE_API_URL}/createTask`, {
          method: "POST",
          headers: {
            'Authorization': `Basic ${credentials}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: task.nombre,
            rate: task.rate,
            grade: groupInfo.grado,
            group: groupInfo.grupo,
            area: groupInfo.especialidad,
            emailUser: localStorage.getItem("email"),
            password: localStorage.getItem("password"),
            finalRate: task.final_rate,
            alumnosTask: students,
            groupId: id
          })
        });

        if (!response.ok) {
          throw new Error(`Error al crear tarea: ${response.status}`);
        }

        await getTasksGroup();
        setShowTaskForm(false);
        setTask({ nombre: "", rate: "" });
      } catch (error) {
        console.error("Error al crear tarea:", error);
        alert('Error al crear tarea');
      } finally {
        setIsLoading(false);
      }
    }
  }

  function showCreateTask(){
    form2.style.display ="flex"
  }

  function addTask(taskData){
    setTask(taskData)
    console.log("xfff")
    console.log(taskData)
  }

  function addForm2(form){
    setForm2(form)
  }

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/getAttendances/${id}/${date}`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) throw new Error('Error en la descarga del archivo.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asistencia ${groupInfo.grado} ${groupInfo.grupo} ${groupInfo.especialidad}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowAttendances(false);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  };

  useEffect(() => {
    if (attendanceModalRef.current) {
      if (showAttendances) {
        attendanceModalRef.current.style.display = "flex";
      } else {
        attendanceModalRef.current.style.display = "none";
      }
    }
  }, [showAttendances]);

  const editGroup = async () => {
    setEditError("");
    
    try {
      // Validate inputs
      if (!groupData.grade || !groupData.group || !groupData.area) {
        setEditError("Todos los campos son obligatorios");
        return;
      }
      
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/updateGroup`, {
        method: "PATCH",
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newGrade: Number(groupData.grade),
          newGroup: groupData.group,
          newArea: groupData.area,
          students: students,
          grade: groupInfo.grado,
          group: groupInfo.grupo,
          area: groupInfo.especialidad,
          id: id,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar el grupo: ${response.status}`);
      }
      
      // Update local state with new group info
      setGroupInfo({
        grado: groupData.grade,
        grupo: groupData.group,
        especialidad: groupData.area
      });
      
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating group:', error);
      setEditError("Error al actualizar el grupo. Por favor, intente de nuevo.");
    }
  };

  const [showStudentEditForm, setShowStudentEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentData, setStudentData] = useState({
    nombre: "",
    apellidos: "",
    correo: ""
  });

  async function updateStudent() {
    console.log(studentData);
    if (Object.values(studentData).every(value => value !== '')) {
      console.log("aqui");
      
      console.log(studentData);
      const data = await fetch(`${BASE_API_URL}/updateStudent/${editingStudent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: studentData.nombre,
          apellidos: studentData.apellidos,
          correo: studentData.correo,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password"),
          groupId: id
        })
      }).then(data => data.json());
      
      navigate(0);
    }
  }

  return (
    <div className="pt-16">
      {isLoading && <Loader text={loadingText} />}
      <Navbar />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-card-foreground">
              {groupInfo.grado}° {groupInfo.grupo} - {groupInfo.especialidad}
            </h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowEditForm(true)}
              className="h-9"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar Grupo
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowForm(true)}
              className="h-9 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Alumno
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowTaskForm(true)}
              className="h-9 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir Tarea
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 w-full sm:w-auto"
              onClick={() => setShowAttendances(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Asistencias
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 w-full sm:w-auto"
              onClick={() => setVerificationModal({ isOpen: true, studentId: null })}
            >
              <Camera className="w-4 h-4 mr-2" />
              Verificar Grupo
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar estudiante..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {studentResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {studentResults.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className="p-2 hover:bg-secondary cursor-pointer"
                  >
                    {student.nombre} {student.apellidos}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar grupo para importar..."
              value={groupSearchTerm}
              onChange={(e) => setGroupSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {groupResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {groupResults.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => importGroup(group.id, id)}
                    className="p-2 hover:bg-secondary cursor-pointer"
                  >
                    {group.grado}° {group.grupo} - {group.especialidad}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-full sm:w-auto"
            onClick={() => setShowPerformanceChart(!showPerformanceChart)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showPerformanceChart ? 'Ocultar' : 'Ver'} Rendimiento
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-full sm:w-auto"
            onClick={exportCalifications}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Calificaciones
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-full sm:w-auto"
            onClick={exportResume}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar Resumen
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 w-full sm:w-auto"
            onClick={() => setShowJoinLinkModal(true)}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Generar enlace de unión
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-9 w-full sm:w-auto"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>

        {showJoinLinkModal && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Card className="max-w-md w-full relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Enlace de unión del grupo</CardTitle>
                    <button onClick={() => { setShowJoinLinkModal(false); setGeneratedJoinLink(null); }} className="text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!generatedJoinLink ? (
                      <Button onClick={generateJoinLinkForGroup} disabled={generatingJoinLink} className="w-full">
                        {generatingJoinLink ? (<><Loader className="w-4 h-4 mr-2 animate-spin" /> Generando...</>) : (<><Link2 className="w-4 h-4 mr-2" /> Generar enlace</>)}
                      </Button>
                    ) : (
                      <>
                        <div className="p-3 bg-muted rounded-lg border border-border">
                          <code className="text-sm text-foreground break-all">{generatedJoinLink.fullLink}</code>
                        </div>
                        <Button variant="outline" onClick={copyJoinLink} className="w-full">
                          {copiedJoin ? (<><Check className="w-4 h-4 mr-2" /> Copiado</>) : (<><Copy className="w-4 h-4 mr-2" /> Copiar enlace</>)}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Students Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Estudiantes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {students.map((student) => (
              <Card key={student.id} className="hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{student.nombre} {student.apellidos}</h3>
                      <p className="text-sm text-muted-foreground">{student.correo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMessageModal({ 
                          isOpen: true, 
                          student: student 
                        })}
                        className="p-2 text-green-500 hover:text-green-400 transition-colors"
                        title="Enviar mensaje"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentPerformanceModal({ 
                          isOpen: true, 
                          studentId: student.id, 
                          studentName: `${student.nombre} ${student.apellidos}` 
                        })}
                        className="p-2 text-blue-500 hover:text-blue-400 transition-colors"
                        title="Ver rendimiento"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/student/group/${id}/${student.id}`)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Ver perfil"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-card-foreground">Tareas del Grupo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    {editingTaskId === task.id ? (
                      <Input
                        type="text"
                        value={newNameTask}
                        onChange={(e) => setNewNameTask(e.target.value)}
                        onKeyDown={(e) => handleNameKeyDown(e, task)}
                        className="w-full"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-lg font-medium">{task.name || task.nombre}</h3>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (editingTaskId === task.id) {
                            changeNameTask(task.id, task.name || task.nombre);
                          } else {
                            setNewNameTask(task.name || task.nombre);
                            setEditingTaskId(task.id);
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {editingTaskId === task.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Pencil className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id, task.name || task.nombre)}
                        className="p-2 text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor</span>
                      {editingRateId === task.id ? (
                        <Input
                          type="number"
                          value={newRateTask}
                          onChange={(e) => setNewRateTask(e.target.value)}
                          onKeyDown={(e) => handleRateKeyDown(e, task)}
                          className="w-24"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{task.rate}</span>
                          <button
                            onClick={() => {
                              if (editingRateId === task.id) {
                                changeRateTaskGroup(task.id);
                              } else {
                                setNewRateTask(task.rate);
                                setEditingRateId(task.id);
                              }
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {editingRateId === task.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Pencil className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Chart Section - At the bottom */}
        {showPerformanceChart && (
          <div className="mt-8">
            <PerformanceChart groupId={id} />
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Add Student Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-background border border-border rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Agregar Estudiante</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={student.nombre}
                  onChange={(e) => setStudent({ ...student, nombre: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  type="text"
                  value={student.apellidos}
                  onChange={(e) => setStudent({ ...student, apellidos: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  value={student.correo}
                  onChange={(e) => setStudent({ ...student, correo: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 sm:px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addStudentDB}
                  className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-background border border-border rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Agregar Tarea</h2>
              <button
                onClick={() => setShowTaskForm(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="taskName">Nombre de la tarea</Label>
                <Input
                  id="taskName"
                  type="text"
                  value={task.nombre}
                  onChange={(e) => setTask({ ...task, nombre: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="taskRate">Valor</Label>
                <Input
                  id="taskRate"
                  type="number"
                  value={task.rate}
                  onChange={(e) => setTask({ ...task, rate: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="px-3 sm:px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addTaskDB}
                  className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-background border border-border rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Editar Grupo</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="grade">Grado</Label>
                <Input
                  id="grade"
                  type="number"
                  value={groupData.grade}
                  onChange={(e) => setGroupData({ ...groupData, grade: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="group">Grupo</Label>
                <Input
                  id="group"
                  type="text"
                  value={groupData.group}
                  onChange={(e) => setGroupData({ ...groupData, group: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="area">Especialidad</Label>
                <Input
                  id="area"
                  type="text"
                  value={groupData.area}
                  onChange={(e) => setGroupData({ ...groupData, area: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              {editError && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
              <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowEditForm(false)}
                  className="px-3 sm:px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={editGroup}
                  className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendances && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-background border border-border rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Asistencias</h2>
              <button
                onClick={() => setShowAttendances(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Selecciona la fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAttendances(false)}
                  className="h-9"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAttendanceSubmit}
                  className="h-9"
                  disabled={!date}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="text-sm text-muted-foreground mb-6">
              ¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => confirmDeleteState(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDeleteState(true)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Face Verification Modal */}
      <FaceVerificationModal 
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, studentId: null })}
      />

      {/* Student Performance Modal */}
      <StudentPerformanceChart 
        isOpen={studentPerformanceModal.isOpen}
        studentId={studentPerformanceModal.studentId}
        studentName={studentPerformanceModal.studentName}
        groupId={id}
        onClose={() => setStudentPerformanceModal({ isOpen: false, studentId: null, studentName: '' })}
      />

      {/* Send Message Modal */}
      <SendMessageModal 
        isOpen={messageModal.isOpen}
        student={messageModal.student}
        onClose={() => setMessageModal({ isOpen: false, student: null })}
        onMessageSent={(student, message) => {
          console.log(`Mensaje enviado a ${student.nombre} ${student.apellidos}: ${message}`);
        }}
      />
    </div>
  );
};

export default Grupo; 