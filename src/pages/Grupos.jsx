import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  School,
  Plus,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Pencil, Trash2, Check } from 'lucide-react';
import { Input } from '../components/ui/input';
import { BASE_API_URL } from "../config/constants";

const Grupos = () => {
  const [grupos, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingRateId, setEditingRateId] = useState(null);
  const [newNameTask, setNewNameTask] = useState('');
  const [newRateTask, setNewRateTask] = useState('');
  const [newGroup, setNewGroup] = useState({
    grado: '',
    grupo: '',
    especialidad: ''
  });
  const navigate = useNavigate();

  const getGroups = async () => {
    const credentials = btoa(`${localStorage.getItem('email')}:${localStorage.getItem('password')}`);
    await fetch(`${BASE_API_URL}/getClassrooms`, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.length > 0) {
          console.log(data);
          setGroups(data);
        } else {
          setGroups([]);
        }
      });
  };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Grupos</h1>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-foreground border-[0.5px] border-accent rounded-md hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Grupo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map((grupo) => (
            <div key={grupo.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="border-b border-border p-4 bg-muted/20">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-foreground">{grupo.nombre}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{grupo.grado}° {grupo.grupo}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="space-y-4 flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center bg-muted/30 p-3 rounded-md h-12">
                      <GraduationCap className="w-5 h-5 mr-2 text-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">
                        {grupo.grado}° Grado
                      </span>
                    </div>
                    <div className="flex items-center bg-muted/30 p-3 rounded-md h-12">
                      <Layers className="w-5 h-5 mr-2 text-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">
                        Grupo {grupo.grupo}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center bg-muted/30 p-3 rounded-md h-12">
                    <BookOpen className="w-5 h-5 mr-2 text-foreground flex-shrink-0" />
                    <span className="text-foreground font-medium truncate">
                      {grupo.especialidad}
                    </span>
                  </div>
                  <div className="flex items-center bg-muted/30 p-3 rounded-md h-12">
                    <Users className="w-5 h-5 mr-2 text-foreground flex-shrink-0" />
                    <span className="text-foreground font-medium truncate">
                      {grupo.alumnos || 0} estudiantes
                    </span>
                  </div>
                  
                  {/* Tasks Section */}
                  {grupo.tasks && grupo.tasks.length > 0 && (
                    <div className="border-t border-border mt-4 pt-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Tareas</h4>
                      <div className="space-y-2">
                        {grupo.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between gap-2 text-sm bg-muted/30 p-2 rounded-md h-10">
                            {editingTaskId === task.id ? (
                              <Input
                                type="text"
                                defaultValue={task.name}
                                onChange={(e) => setNewNameTask(e.target.value)}
                                onKeyDown={(e) => handleNameKeyDown(e, task)}
                                className="flex-1 h-8"
                                autoFocus
                              />
                            ) : (
                              <span className="text-foreground flex-1 truncate">{task.name}</span>
                            )}
                            
                            {editingRateId === task.id ? (
                              <Input
                                type="number"
                                defaultValue={task.rate}
                                onChange={(e) => setNewRateTask(e.target.value)}
                                onKeyDown={(e) => handleRateKeyDown(e, task)}
                                className="w-20 h-8"
                                autoFocus
                              />
                            ) : (
                              <span className="text-foreground w-12 text-right font-medium">{task.rate}</span>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (editingTaskId === task.id || editingRateId === task.id) {
                                    if (editingTaskId) changeNameTask(task.id, task.name);
                                    if (editingRateId) changeRateTaskGroup(task.id);
                                  } else {
                                    setEditingTaskId(task.id);
                                    setNewNameTask(task.name);
                                  }
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                              >
                                {editingTaskId === task.id ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => deleteTask(task.id, task.name)}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-muted"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 mt-auto">
                    <button 
                      onClick={() => navigate(`/grupo/${grupo.id}`)} 
                      className="w-full px-4 py-2.5 border border-border text-foreground text-sm rounded-md hover:bg-muted transition-all duration-300 flex items-center justify-center group"
                    >
                      Ver Detalles
                      <ArrowRight className="w-4 h-4 ml-2 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-lg relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Crear Nuevo Grupo</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Grado</label>
                  <Input
                    type="number"
                    value={newGroup.grado}
                    onChange={(e) => setNewGroup({ ...newGroup, grado: e.target.value })}
                    placeholder="Ingrese el grado"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Grupo</label>
                  <Input
                    type="text"
                    value={newGroup.grupo}
                    onChange={(e) => setNewGroup({ ...newGroup, grupo: e.target.value })}
                    placeholder="Ingrese el grupo"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Especialidad</label>
                  <Input
                    type="text"
                    value={newGroup.especialidad}
                    onChange={(e) => setNewGroup({ ...newGroup, especialidad: e.target.value })}
                    placeholder="Ingrese la especialidad"
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createGroup}
                    className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
                  >
                    Crear Grupo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      changeNameTask(task.id, task.name);
      task.name = newNameTask;
    }
  };

  const handleRateKeyDown = (e, task) => {
    if (e.key === "Enter") {
      changeRateTaskGroup(task.id);
      task.rate = newRateTask;
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
          alumnosTask: [],
          newTaskName: newNameTask,
          nameTask: oldName,
          idTask: id,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      setEditingTaskId(null);
      // Update local state
      setGroups(grupos.map(grupo => ({
        ...grupo,
        tasks: grupo.tasks?.map(task =>
          task.id === id ? { ...task, name: newNameTask } : task
        )
      })));
    } catch (error) {
      console.error('Error updating task name:', error);
    }
  };

  const changeRateTaskGroup = async (id) => {
    try {
      await fetch(BASE_API_URL + "/changeRateTaskGroup", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          alumnosTask: [],
          newRate: newRateTask,
          idTask: id,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      setEditingRateId(null);
      // Update local state
      setGroups(grupos.map(grupo => ({
        ...grupo,
        tasks: grupo.tasks?.map(task =>
          task.id === id ? { ...task, rate: newRateTask } : task
        )
      })));
    } catch (error) {
      console.error('Error updating task rate:', error);
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
          alumnosTask: [],
          id,
          nameTask: taskName,
          emailUser: localStorage.getItem("email"),
          password: localStorage.getItem("password")
        })
      });
      // Update local state
      setGroups(grupos.map(grupo => ({
        ...grupo,
        tasks: grupo.tasks?.filter(task => task.id !== id)
      })));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  async function createGroup() {
    if (!newGroup.grado || !newGroup.grupo || !newGroup.especialidad) return;

    try {
      const response = await fetch(`${BASE_API_URL}/createClassroom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          especialidad: newGroup.especialidad,
          grado: newGroup.grado,
          grupo: newGroup.grupo,
          emailUser: localStorage.getItem('email'),
          password: localStorage.getItem('password')
        })
      });

      const data = await response.json();
      
      if (data[0]?.insertId) {
        const newGroupData = {
          grado: newGroup.grado,
          grupo: newGroup.grupo,
          especialidad: newGroup.especialidad,
          estudiantes: 0,
          id: data[0].insertId
        };

        setGroups([...grupos, newGroupData]);
        setShowCreateModal(false);
        setNewGroup({ grado: '', grupo: '', especialidad: '' });
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }
};

export default Grupos; 