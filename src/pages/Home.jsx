import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Clock, Users, BookOpen, BarChart, TrendingUp, Award, AlertCircle, CheckCircle2, Calendar, Target, Sparkles } from "lucide-react";
import { BASE_API_URL } from "../config/constants";

const Home = () => {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalStudents: 0,
    largestGroup: null,
    smallestGroup: null,
    recentActivity: null,
  });
  const [greeting, setGreeting] = useState("");
  const [insights, setInsights] = useState([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const userName = localStorage.getItem("email")?.split('@')[0] || "Profesor";
    
    if (hour < 12) return `¡Buenos días, ${userName}! ☀️`;
    if (hour < 18) return `¡Buenas tardes, ${userName}! 🌤️`;
    return `¡Buenas noches, ${userName}! 🌙`;
  };

  const generateInsights = (data) => {
    const insights = [];
    const totalGroups = data.length;
    const totalStudents = data.reduce((sum, group) => sum + group.alumnos, 0);
    const avgStudents = totalGroups > 0 ? Math.round(totalStudents / totalGroups) : 0;

    // Insight 1: Estado general
    if (totalStudents === 0) {
      insights.push({
        icon: <Sparkles className="w-5 h-5 text-blue-500" />,
        message: "¡Comencemos! Te ayudaré a crear tu primer grupo de estudiantes.",
        type: "info"
      });
    } else {
      insights.push({
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        message: `Genial! Estás gestionando ${totalStudents} estudiante${totalStudents !== 1 ? 's' : ''} en ${totalGroups} grupo${totalGroups !== 1 ? 's' : ''}. 🎓`,
        type: "success"
      });
    }

    // Insight 2: Balance de grupos
    if (totalGroups > 0) {
      const sorted = [...data].sort((a, b) => b.alumnos - a.alumnos);
      const largest = sorted[0];
      const smallest = sorted[sorted.length - 1];
      
      if (largest.alumnos - smallest.alumnos > 10) {
        insights.push({
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
          message: `Nota: El grupo "${largest.grado}°${largest.grupo}" tiene ${largest.alumnos} estudiantes, mientras que "${smallest.grado}°${smallest.grupo}" tiene ${smallest.alumnos}. Considera balancear la carga.`,
          type: "warning"
        });
      }
    }

    // Insight 3: Tamaño ideal
    if (avgStudents > 35) {
      insights.push({
        icon: <Target className="w-5 h-5 text-purple-500" />,
        message: `Tus grupos tienen un promedio de ${avgStudents} estudiantes. Para una atención más personalizada, considera grupos de 25-30 estudiantes.`,
        type: "tip"
      });
    } else if (avgStudents > 0 && avgStudents <= 25) {
      insights.push({
        icon: <Award className="w-5 h-5 text-yellow-500" />,
        message: `¡Excelente! Tus grupos tienen un tamaño ideal (${avgStudents} estudiantes en promedio) para atención personalizada.`,
        type: "success"
      });
    }

    // Insight 4: Motivación
    const today = new Date().getDay();
    if (today === 1) {
      insights.push({
        icon: <Calendar className="w-5 h-5 text-blue-500" />,
        message: "¡Feliz inicio de semana! Un buen momento para revisar el progreso de tus estudiantes. 💪",
        type: "info"
      });
    } else if (today === 5) {
      insights.push({
        icon: <Calendar className="w-5 h-5 text-green-500" />,
        message: "¡Ya es viernes! Recuerda exportar los reportes semanales antes del fin de semana. 📊",
        type: "info"
      });
    }

    return insights;
  };

  const getStats = async () => {
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    try {
      const response = await fetch(`${BASE_API_URL}/getClassrooms`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.length > 0) {
        calculateStats(data);
        setInsights(generateInsights(data));
      } else {
        setInsights(generateInsights([]));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateStats = (data) => {
    const totalGroups = data.length;
    const totalStudents = data.reduce((sum, group) => sum + group.alumnos, 0);
    
    // Encontrar el grupo más grande y más pequeño
    const sorted = [...data].sort((a, b) => b.alumnos - a.alumnos);
    const largestGroup = sorted[0];
    const smallestGroup = sorted[sorted.length - 1];
    
    setStats({
      totalGroups,
      totalStudents,
      largestGroup,
      smallestGroup,
      recentActivity: data[data.length - 1], // Último grupo creado
    });
  };

  useEffect(() => {
    setGreeting(getGreeting());
    getStats();
  }, []);

  const getInsightColor = (type) => {
    switch(type) {
      case 'success': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'warning': return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      case 'info': return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      case 'tip': return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-2">
            {greeting}
          </h1>
          <p className="text-muted-foreground">
            Te mostraré un resumen de tu actividad y algunas recomendaciones personalizadas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalGroups === 0 
                  ? "Crea tu primer grupo"
                  : stats.totalGroups === 1 
                  ? "¡Comienza muy bien!"
                  : "Gestión múltiple activa"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalStudents > 100 
                  ? "¡Impresionante alcance!"
                  : stats.totalStudents > 30
                  ? "Buen tamaño de clases"
                  : "Grupos manejables"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Grupo</CardTitle>
              <BarChart className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalGroups > 0 
                  ? Math.round(stats.totalStudents / stats.totalGroups) 
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalGroups > 0 && Math.round(stats.totalStudents / stats.totalGroups) <= 25
                  ? "Tamaño ideal 👌"
                  : stats.totalGroups > 0 && Math.round(stats.totalStudents / stats.totalGroups) <= 35
                  ? "Tamaño aceptable"
                  : stats.totalGroups > 0 
                  ? "Considera dividir grupos"
                  : "Estudiantes por grupo"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grupo Mayor</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.largestGroup ? stats.largestGroup.alumnos : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {stats.largestGroup 
                  ? `${stats.largestGroup.grado}° ${stats.largestGroup.grupo} - ${stats.largestGroup.especialidad}`
                  : "Sin datos aún"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold text-foreground">
                Insights Personalizados
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight, index) => (
                <Card key={index} className={`border-2 ${getInsightColor(insight.type)}`}>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {insight.icon}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">Gestionar Grupos</h3>
                <p className="text-sm text-muted-foreground">
                  Organiza y administra tus clases
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">Tomar Asistencia</h3>
                <p className="text-sm text-muted-foreground">
                  Registra presencia con QR o Face ID
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <BarChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">Ver Reportes</h3>
                <p className="text-sm text-muted-foreground">
                  Analiza el rendimiento académico
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home; 