import { useEffect, useState } from 'react';
import { BASE_API_URL } from '../config/constants';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Users,
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
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const PerformanceChart = ({ groupId }) => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    strugglingStudents: 0,
    goodStudents: 0,
    averageGrade: 0
  });

  useEffect(() => {
    if (groupId) {
      fetchPerformanceData();
    }
  }, [groupId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const response = await fetch(`${BASE_API_URL}/getAllStudentsGrades/${groupId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Performance data received:', data); // Debug log
      const analyzedData = analyzeStudentPerformance(data);
      setPerformanceData(analyzedData);
      calculateStats(analyzedData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceData([]);
      setStats({
        totalStudents: 0,
        strugglingStudents: 0,
        goodStudents: 0,
        averageGrade: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeStudentPerformance = (students) => {
    return students.map(student => {
      const grades = student.grades || [];
      
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
        : null; // Use null for students with no valid grades
      
      const performanceLevel = totalScore !== null ? getPerformanceLevel(totalScore) : 'no-data';
      
      // Debug log para verificar los datos
      console.log(`Student ${student.nombre}:`, {
        allGrades: grades.map(g => ({ task_name: g.task_name, final_grade: g.final_grade })),
        validGrades: numericGrades,
        totalScore: totalScore,
        completedTasks: validGrades.length,
        totalTasks: grades.length
      });
      
      return {
        ...student,
        averageGrade: totalScore !== null ? Math.round(totalScore * 100) / 100 : null, // Mantengo el nombre pero ahora es totalScore
        performanceLevel,
        totalTasks: grades.length,
        completedTasks: validGrades.length
      };
    }).sort((a, b) => {
      // Sort students with data first, then by total score
      if (a.averageGrade === null && b.averageGrade === null) return 0;
      if (a.averageGrade === null) return 1;
      if (b.averageGrade === null) return -1;
      return b.averageGrade - a.averageGrade; // Sort by best performance first
    });
  };

  const getPerformanceLevel = (totalGrade) => {
    if (totalGrade === null) return 'no-data';
    if (totalGrade >= 100) return 'excellent';
    if (totalGrade >= 80) return 'good';
    if (totalGrade >= 60) return 'average';
    return 'critical';
  };

  const calculateStats = (data) => {
    const totalStudents = data.length;
    const strugglingStudents = data.filter(s => s.performanceLevel === 'critical').length;
    const goodStudents = data.filter(s => s.performanceLevel === 'good' || s.performanceLevel === 'excellent').length;
    
    // Calculate average total score from students with valid grades
    const studentsWithGrades = data.filter(s => s.averageGrade !== null);
    const averageTotalScore = studentsWithGrades.length > 0 
      ? studentsWithGrades.reduce((sum, s) => sum + s.averageGrade, 0) / studentsWithGrades.length 
      : 0;

    setStats({
      totalStudents,
      strugglingStudents,
      goodStudents,
      averageGrade: Math.round(averageTotalScore * 100) / 100
    });
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'excellent': return 'text-green-500 bg-green-100';
      case 'good': return 'text-green-600 bg-green-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'struggling': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'no-data': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPerformanceIcon = (level) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'average': return <BarChart3 className="w-4 h-4" />;
      case 'struggling': return <TrendingDown className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'no-data': return <BarChart3 className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getPerformanceLabel = (level) => {
    switch (level) {
      case 'excellent': return 'Excelente (100)';
      case 'good': return 'Bien (80-99)';
      case 'average': return 'Regular (60-79)';
      case 'critical': return 'Insuficiente (<60)';
      case 'no-data': return 'Sin calificaciones';
      default: return 'Sin datos';
    }
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (performanceData.length === 0) return null;

    // Bar chart data - Student performance
    const studentNames = performanceData.map(s => `${s.nombre} ${s.apellidos}`);
    const studentGrades = performanceData.map(s => s.averageGrade || 0); // Use 0 for null values
    const studentColors = performanceData.map(s => {
      switch (s.performanceLevel) {
        case 'excellent': return '#10B981';
        case 'good': return '#34D399';
        case 'average': return '#FBBF24';
        case 'struggling': return '#F59E0B';
        case 'critical': return '#EF4444';
        case 'no-data': return '#6B7280';
        default: return '#6B7280';
      }
    });

    // Doughnut chart data - Performance distribution
    const performanceCounts = {
      excellent: performanceData.filter(s => s.performanceLevel === 'excellent').length,
      good: performanceData.filter(s => s.performanceLevel === 'good').length,
      average: performanceData.filter(s => s.performanceLevel === 'average').length,
      critical: performanceData.filter(s => s.performanceLevel === 'critical').length,
      'no-data': performanceData.filter(s => s.performanceLevel === 'no-data').length
    };

    return {
      barChart: {
        labels: studentNames,
        datasets: [{
          label: 'Puntuación Total (sobre 100)',
          data: studentGrades,
          backgroundColor: studentColors,
          borderColor: studentColors,
          borderWidth: 1
        }]
      },
      doughnutChart: {
        labels: ['Excelente (100)', 'Bien (80-99)', 'Regular (60-79)', 'Insuficiente (<60)', 'Sin Calificaciones'],
        datasets: [{
          data: [
            performanceCounts.excellent,
            performanceCounts.good,
            performanceCounts.average,
            performanceCounts.critical,
            performanceCounts['no-data']
          ],
          backgroundColor: [
            '#10B981',
            '#34D399',
            '#FBBF24',
            '#EF4444',
            '#6B7280'
          ],
          borderColor: [
            '#059669',
            '#10B981',
            '#F59E0B',
            '#DC2626',
            '#4B5563'
          ],
          borderWidth: 2
        }]
      }
    };
  };

  const chartData = prepareChartData();

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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          padding: 20
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0A0D14] border border-[#1F2937] rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[#1F2937] rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#1F2937] rounded"></div>
            <div className="h-4 bg-[#1F2937] rounded w-3/4"></div>
            <div className="h-4 bg-[#1F2937] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0D14] border border-[#1F2937] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Análisis de Rendimiento del Grupo</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            He analizado el desempeño de tus estudiantes para identificar oportunidades
          </p>
        </div>
        <button
          onClick={fetchPerformanceData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Assistant Message */}
      {performanceData.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-blue-300 text-sm leading-relaxed">
                {stats.strugglingStudents > 0 
                  ? `He identificado ${stats.strugglingStudents} estudiante${stats.strugglingStudents > 1 ? 's con menos de 60 puntos que necesitan' : ' con menos de 60 puntos que necesita'} atención urgente. Te recomiendo revisar su progreso individualmente.`
                  : stats.averageGrade >= 80
                  ? `¡Excelente trabajo! El grupo tiene un promedio de ${stats.averageGrade} puntos. La mayoría de tus estudiantes están teniendo un buen desempeño. 🎉`
                  : stats.averageGrade >= 60
                  ? `El grupo está avanzando con un promedio de ${stats.averageGrade} puntos. Algunos estudiantes podrían beneficiarse de apoyo adicional para llegar a 80+ puntos.`
                  : `El promedio del grupo es ${stats.averageGrade} puntos. Considera implementar estrategias de refuerzo para que más estudiantes alcancen los 60 puntos mínimos.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1F2937] p-4 rounded-lg hover:bg-[#2a3544] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-400">Total Estudiantes</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalStudents > 30 ? "Grupo numeroso" : stats.totalStudents > 15 ? "Tamaño ideal" : "Grupo pequeño"}
          </p>
        </div>
        
        <div className="bg-[#1F2937] p-4 rounded-lg hover:bg-[#2a3544] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-400">Necesitan Apoyo</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.strugglingStudents}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.strugglingStudents === 0 
              ? "¡Todos van bien! 🎯" 
              : `${Math.round((stats.strugglingStudents/stats.totalStudents)*100)}% del grupo`}
          </p>
        </div>
        
        <div className="bg-[#1F2937] p-4 rounded-lg hover:bg-[#2a3544] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-400">Sobresalientes</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.goodStudents}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.goodStudents > 0 
              ? `${Math.round((stats.goodStudents/stats.totalStudents)*100)}% destacan` 
              : "Área de oportunidad"}
          </p>
        </div>
        
        <div className="bg-[#1F2937] p-4 rounded-lg hover:bg-[#2a3544] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-400">Promedio del Grupo</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.averageGrade}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.averageGrade >= 80 
              ? "¡Excelente nivel!" 
              : stats.averageGrade >= 60 
              ? "Nivel regular" 
              : "Requiere atención"}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      {performanceData.length === 0 ? (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No hay datos de calificaciones disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Individual Performance */}
          <div className="bg-[#1F2937] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Rendimiento Individual</h3>
            <div className="h-80">
              <Bar data={chartData.barChart} options={chartOptions} />
            </div>
          </div>

          {/* Doughnut Chart - Performance Distribution */}
          <div className="bg-[#1F2937] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Distribución de Rendimiento</h3>
            <div className="h-80">
              <Doughnut data={chartData.doughnutChart} options={doughnutOptions} />
            </div>
          </div>
        </div>
      )}

      {/* All Students List */}
      {performanceData.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-white">
                Ranking de Estudiantes
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Ordenados del mejor al menor desempeño actual
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {performanceData.map((student, index) => {
              const getStudentMessage = () => {
                if (student.performanceLevel === 'excellent') return '¡Perfecto! 100 puntos ';
                if (student.performanceLevel === 'good') return 'Muy bien! 80+ puntos ';
                if (student.performanceLevel === 'average') return 'Regular, 60+ puntos';
                if (student.performanceLevel === 'critical') return 'Urgente: <60 puntos';
                return 'Sin calificaciones';
              };

              return (
                <div 
                  key={student.student_id} 
                  className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
                    student.performanceLevel === 'excellent' ? 'border-green-500/30 bg-green-900/10' :
                    student.performanceLevel === 'good' ? 'border-green-500/30 bg-green-900/10' :
                    student.performanceLevel === 'average' ? 'border-yellow-500/30 bg-yellow-900/10' :
                    student.performanceLevel === 'struggling' ? 'border-orange-500/30 bg-orange-900/10' :
                    student.performanceLevel === 'critical' ? 'border-red-500/30 bg-red-900/10' :
                    'border-gray-500/30 bg-gray-900/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${
                        student.performanceLevel === 'excellent' ? 'bg-green-600' :
                        student.performanceLevel === 'good' ? 'bg-green-600' :
                        student.performanceLevel === 'average' ? 'bg-yellow-600' :
                        student.performanceLevel === 'struggling' ? 'bg-orange-600' :
                        student.performanceLevel === 'critical' ? 'bg-red-600' :
                        'bg-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {student.nombre} {student.apellidos}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {student.completedTasks} de {student.totalTasks} tareas • {getStudentMessage()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          student.performanceLevel === 'excellent' ? 'text-green-400' :
                          student.performanceLevel === 'good' ? 'text-green-400' :
                          student.performanceLevel === 'average' ? 'text-yellow-400' :
                          student.performanceLevel === 'struggling' ? 'text-orange-400' :
                          student.performanceLevel === 'critical' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {student.averageGrade !== null ? student.averageGrade.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">Puntaje total</div>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                        student.performanceLevel === 'excellent' ? 'bg-green-100 text-green-800' :
                        student.performanceLevel === 'good' ? 'bg-green-100 text-green-800' :
                        student.performanceLevel === 'average' ? 'bg-yellow-100 text-yellow-800' :
                        student.performanceLevel === 'struggling' ? 'bg-orange-100 text-orange-800' :
                        student.performanceLevel === 'critical' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getPerformanceIcon(student.performanceLevel)}
                        <span className="text-sm font-medium">
                          {getPerformanceLabel(student.performanceLevel)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progreso</span>
                      <span>{student.averageGrade !== null ? `${Math.round((student.averageGrade / 100) * 100)}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-[#0A0D14] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          student.performanceLevel === 'excellent' ? 'bg-green-500' :
                          student.performanceLevel === 'good' ? 'bg-green-500' :
                          student.performanceLevel === 'average' ? 'bg-yellow-500' :
                          student.performanceLevel === 'struggling' ? 'bg-orange-500' :
                          student.performanceLevel === 'critical' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{ 
                          width: `${(() => {
                            if (student.averageGrade === null) return 0;
                            return Math.min((student.averageGrade / 100) * 100, 100);
                          })()}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;
