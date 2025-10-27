import { useEffect, useState } from 'react';
import { BASE_API_URL } from '../config/constants';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  X,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const StudentPerformanceChart = ({ studentId, studentName, groupId, isOpen, onClose }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && studentId && groupId) {
      fetchStudentPerformance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentId, groupId]);

  const fetchStudentPerformance = async () => {
    try {
      setLoading(true);
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      
      // Get student grades data using groupId
      const gradesResponse = await fetch(`${BASE_API_URL}/getAllStudentsGrades/${groupId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        }
      });
      
      let gradesData = [];
      if (gradesResponse.ok) {
        const allGrades = await gradesResponse.json();
        console.log('All grades received:', allGrades);
        console.log('Looking for student_id:', studentId);
        
        // Find the specific student's grades
        const studentGrades = allGrades.find(s => s.student_id === studentId);
        console.log('Student grades found:', studentGrades);
        
        if (studentGrades) {
          gradesData = studentGrades.grades || [];
        }
      }
      
      setStudentData({
        grades: gradesData,
        name: studentName
      });
    } catch (error) {
      console.error('Error fetching student performance:', error);
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };


  const prepareGradesChart = () => {
    if (!studentData?.grades || studentData.grades.length === 0) return null;

    const taskNames = studentData.grades.map(grade => grade.task_name || 'Tarea');
    const finalGrades = studentData.grades.map(grade => {
      const value = grade.final_grade;
      return (value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(value))) 
        ? parseFloat(value) 
        : 0;
    });
    const taskRates = studentData.grades.map(grade => {
      const value = grade.task_rate;
      return (value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(value))) 
        ? parseFloat(value) 
        : 0;
    });

    return {
      labels: taskNames,
      datasets: [
        {
          label: 'Puntos Obtenidos',
          data: finalGrades,
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderWidth: 1
        },
        {
          label: 'Puntos Máximos',
          data: taskRates,
          backgroundColor: '#8B5CF6',
          borderColor: '#7C3AED',
          borderWidth: 1
        }
      ]
    };
  };


  const calculateStats = () => {
    if (!studentData) return null;

    const grades = studentData.grades || [];
    
    // Filtrar solo las calificaciones que tienen valor y no son null
    const validGrades = grades.filter(grade => 
      grade.final_grade !== null && 
      grade.final_grade !== undefined && 
      grade.final_grade !== '' &&
      !isNaN(parseFloat(grade.final_grade))
    );
    
    // SUMAR todas las calificaciones finales para obtener el puntaje total
    const numericGrades = validGrades.map(grade => parseFloat(grade.final_grade));
    const totalScore = numericGrades.length > 0 
      ? numericGrades.reduce((sum, grade) => sum + grade, 0)
      : 0;
    
    const totalTasks = grades.length;
    const completedTasks = validGrades.length;

    // Debug log para verificar los datos
    console.log('Grades data:', grades);
    console.log('Valid grades:', numericGrades);
    console.log('Stats calculated:', { totalScore, totalTasks, completedTasks });

    return {
      averageGrade: Math.round(totalScore * 100) / 100, // Mantengo el nombre pero ahora es totalScore
      totalTasks,
      completedTasks
    };
  };

  const stats = calculateStats();
  const gradesChartData = prepareGradesChart();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: '#374151'
        }
      },
      x: {
        ticks: {
          color: '#9CA3AF',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: '#374151'
        }
      }
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0A0D14] border border-[#1F2937] rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1F2937]">
          <div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">
                Análisis de {studentData?.name || studentName}
              </h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Perfil académico detallado con recomendaciones personalizadas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStudentPerformance}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : !studentData ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No se pudieron cargar los datos del estudiante</p>
            </div>
          ) : (
            <>
              {/* Assistant Insight */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-blue-300 text-sm leading-relaxed">
                      {stats?.averageGrade >= 80 
                        ? `¡${studentData?.name || studentName} está destacando! Con ${stats?.averageGrade} puntos demuestra excelente comprensión del material. Considera asignarle roles de liderazgo en el grupo. `
                        : stats?.averageGrade >= 60
                        ? `${studentData?.name || studentName} va regular con ${stats?.averageGrade} puntos. Con ${stats?.completedTasks} de ${stats?.totalTasks} tareas completadas, puede mejorar para llegar a 80+ puntos. `
                        : stats?.averageGrade > 0
                        ? `${studentData?.name || studentName} necesita apoyo urgente. Con ${stats?.averageGrade} puntos (menos de 60), requiere atención personalizada y posiblemente tutorías. `
                        : `${studentData?.name || studentName} aún no tiene calificaciones registradas. Asegúrate de calificar sus tareas para hacer seguimiento a su progreso. `
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1F2937] p-4 rounded-lg hover:bg-[#2a3544] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-400">Puntaje Total</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.averageGrade || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.averageGrade >= 80 ? '¡Excelente nivel!' : 
                     stats?.averageGrade >= 60 ? 'Nivel regular' : 
                     stats?.averageGrade > 0 ? 'Necesita apoyo urgente' : 'Sin datos'}
                  </p>
                </div>
                
                <div className="bg-[#1F2937] p-4 rounded-lg hover:bg-[#2a3544] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-400">Tareas Calificadas</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.completedTasks || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    De {stats?.totalTasks || 0} tareas totales
                  </p>
                </div>
                
                <div className="bg-[#1F2937] p-4 rounded-lg hover:bg-[#2a3544] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-400">Estado Académico</span>
                  </div>
                  <div className={`text-lg font-bold ${
                    stats?.averageGrade >= 100 ? 'text-green-400' :
                    stats?.averageGrade >= 80 ? 'text-blue-400' :
                    stats?.averageGrade >= 60 ? 'text-yellow-400' :
                    stats?.averageGrade > 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {stats?.averageGrade >= 100 ? 'Excelente' :
                     stats?.averageGrade >= 80 ? 'Bien' :
                     stats?.averageGrade >= 60 ? 'Regular' :
                     stats?.averageGrade > 0 ? 'Insuficiente' : 'Sin evaluar'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.averageGrade >= 60 ? 'Aprobado ✓' : stats?.averageGrade > 0 ? 'Reprobado ✗' : 'Pendiente'}
                  </p>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grades Chart */}
                {gradesChartData && (
                  <div className="bg-[#1F2937] p-4 rounded-lg">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-white">Puntos por Tarea</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Puntos obtenidos vs puntos máximos por evaluación
                      </p>
                    </div>
                    <div className="h-64">
                      <Bar data={gradesChartData} options={chartOptions} />
                    </div>
                  </div>
                )}

                {/* Grades Trend */}
                {gradesChartData && (
                  <div className="bg-[#1F2937] p-4 rounded-lg">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-white">Tendencia de Rendimiento</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Porcentaje obtenido en cada tarea (puntos obtenidos / puntos máximos)
                      </p>
                    </div>
                    <div className="h-64">
                      <Line 
                        data={{
                          labels: gradesChartData.labels,
                          datasets: [{
                            label: 'Porcentaje de Rendimiento',
                            data: gradesChartData.labels.map((_, index) => {
                              const finalGrade = gradesChartData.datasets[0].data[index];
                              const taskRate = gradesChartData.datasets[1].data[index];
                              return taskRate > 0 ? Math.round((finalGrade / taskRate) * 100) : 0;
                            }),
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.3,
                            fill: true
                          }]
                        }} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: {
                                color: '#9CA3AF'
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              ticks: {
                                color: '#9CA3AF',
                                callback: function(value) {
                                  return value + '%';
                                }
                              },
                              grid: {
                                color: '#374151'
                              }
                            },
                            x: {
                              ticks: {
                                color: '#9CA3AF'
                              },
                              grid: {
                                color: '#374151'
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceChart;
