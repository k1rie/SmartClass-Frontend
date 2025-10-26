import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_API_URL } from "../config/constants";
import PerformanceChart from '../components/PerformanceChart';
import SendMessageModal from '../components/SendMessageModal';
import { 
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  School,
  Plus,
  Trash,
  Edit,
  X,
  BarChart3,
  Mail
} from "lucide-react";

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [student, setStudent] = useState({});
  const [task, setTask] = useState({});
  const [form, setForm] = useState(null);
  const [form2, setForm2] = useState(null);
  const [form3, setForm3] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [groupData, setGroupData] = useState({});
  const [showPerformanceChart, setShowPerformanceChart] = useState(false);
  const [messageModal, setMessageModal] = useState({ isOpen: false, student: null });

  // Fetch group info
  useEffect(() => {
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    fetch(`${BASE_API_URL}/getClassroom/${id}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then((data) => {
        setGroupInfo(data[0]);
      });
  }, [id]);

  // Fetch students and tasks
  useEffect(() => {
    getTasksGroup();
    getStudents();
  }, [id]);

  // Handle student creation
  useEffect(() => {
    if (student && Object.keys(student).length > 0) {
      addStudentDB();
    }
  }, [student]);

  // Handle task creation
  useEffect(() => {
    if (task && Object.keys(task).length > 0) {
      addTaskDB();
    }
  }, [task]);

  // Handle group edit
  useEffect(() => {
    if (groupData && Object.keys(groupData).length > 0) {
      editGroup();
    }
  }, [groupData]);

  const getStudents = () => {
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    fetch(`${BASE_API_URL}/getStudents/${id}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then((data) => {
        if (data.length > 0) {
          setStudents(data);
        } else {
          setStudents([]);
        }
      });
  };

  const getTasksGroup = () => {
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    fetch(`${BASE_API_URL}/getTasksGroup/${id}`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then(data => {
        if (data.length > 0) {
          setTasks(data);
        } else {
          setTasks([]);
        }
      });
  };

  const addStudentDB = async () => {
    if (Object.keys(student).length !== 0) {
      const response = await fetch(BASE_API_URL + "/createStudent", {
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
      setStudents([...students, {
        ...student,
        id: data.insertId,
        groupId: id
      }]);
    }
  };

  const addTaskDB = async () => {
    if (students.length !== 0) {
      await fetch(BASE_API_URL + "/createTask", {
        method: "POST",
        headers: {
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
      setTasks([...tasks, task]);
    }
  };

  const editGroup = async () => {
    if (groupData.area && groupData.area.length > 0) {
      await fetch(BASE_API_URL + "/updateGroup", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newGrade: Number(groupData.grade),
          newGroup: groupData.group,
          newArea: groupData.area,
          students: students,
          grade: groupInfo.grado,
          group: groupInfo.group,
          area: groupInfo.especialidad,
          id: id,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      navigate(0);
    }
  };

  const handleDeleteGroup = async () => {
    await fetch(`${BASE_API_URL}/deleteClassroom/${Number(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emailUser: localStorage.getItem("email"),
        password: localStorage.getItem("password")
      })
    });
    navigate("/grupos");
  };

  if (!groupInfo) return null;

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#0A0D14] border-[#1F2937] border rounded-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <School className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-semibold text-white">{groupInfo.nombre}</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-400">
                  <span className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                    {groupInfo.grado}° Grado
                  </span>
                  <span className="flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-blue-500" />
                    Grupo {groupInfo.grupo}
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                    {groupInfo.especialidad}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowPerformanceChart(!showPerformanceChart)}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showPerformanceChart ? 'Ocultar' : 'Ver'} Rendimiento
              </button>
              <button 
                onClick={() => setForm3({ style: { display: "flex" }})}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button 
                onClick={() => setConfirmDelete({ style: { display: "flex" }})}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Trash className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>

          {/* Performance Chart Section */}
          {showPerformanceChart && (
            <div className="mb-8">
              <PerformanceChart groupId={id} />
            </div>
          )}

          {/* Students Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-white">Estudiantes</h2>
              <button 
                onClick={() => setForm({ style: { display: "flex" }})}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Estudiante
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div key={student.id} className="bg-[#1F2937] p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{student.nombre} {student.apellidos}</h3>
                      <p className="text-gray-400 text-sm mt-1">{student.correo}</p>
                    </div>
                    <button
                      onClick={() => setMessageModal({ 
                        isOpen: true, 
                        student: student 
                      })}
                      className="p-2 text-green-500 hover:text-green-400 transition-colors ml-2"
                      title="Enviar mensaje"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-white">Tareas</h2>
              <button 
                onClick={() => setForm2({ style: { display: "flex" }})}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-[#1F2937] p-4 rounded-lg">
                  <h3 className="text-white font-medium">{task.nombre}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400 text-sm">Calificación: {task.rate}</span>
                    <span className="text-gray-400 text-sm">Final: {task.final_rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDelete?.style?.display === "flex" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#0A0D14] border border-[#1F2937] p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-white">Eliminar Grupo</h2>
              <button onClick={() => setConfirmDelete(null)}>
                <X className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
            <p className="text-gray-400 mb-6">¿Estás seguro que deseas eliminar este grupo? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteGroup}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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

export default GroupDetails;
