import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BASE_API_URL } from "../config/constants";
import { Loader2, GraduationCap, BookOpen, Users, Calendar, TrendingUp, Copy, Check } from "lucide-react";
import Loader from "../components/ui/loader";

const GradesView = () => {
  const { hash } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${BASE_API_URL}/grades/${hash}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Error al cargar las calificaciones');
        }
        
        if (result.success) {
          setData(result);
        } else {
          throw new Error('Error al cargar las calificaciones');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      fetchGrades();
    } else {
      setError('Enlace no válido');
      setLoading(false);
    }
  }, [hash]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-foreground" />
          <p className="text-muted-foreground">Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              El enlace puede haber expirado o no ser válido. Contacta a tu profesor para obtener un nuevo enlace.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Calificaciones del Grupo</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-foreground" />
                  <span className="text-foreground font-medium">{data.group.nombre}</span>
                </div>
                {data.linkInfo && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Creado: {new Date(data.linkInfo.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 text-foreground border border-border rounded-md hover:bg-accent/90 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                  <p className="text-2xl font-bold text-foreground">{data.students.length}</p>
                </div>
                <Users className="w-8 h-8 text-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tareas</p>
                  <p className="text-2xl font-bold text-foreground">{data.tasks.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accesos</p>
                  <p className="text-2xl font-bold text-foreground">{data.linkInfo?.accessCount || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Calificaciones por Estudiante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Estudiante</th>
                    {data.tasks.map((task, index) => (
                      <th key={index} className="text-center py-3 px-4 font-semibold text-foreground">
                        {task.nombre}
                        <span className="block text-xs text-muted-foreground font-normal">
                          ({task.valor} pts)
                        </span>
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-b border-border ${
                        index % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        {student.apellidos}, {student.nombre}
                      </td>
                      {data.tasks.map((task, taskIndex) => {
                        const grade = student.calificaciones.find(
                          (g) => g.tarea === task.nombre
                        );
                        return (
                          <td key={taskIndex} className="text-center py-3 px-4 text-foreground">
                            {grade ? grade.calificacion : '-'}
                          </td>
                        );
                      })}
                      <td className="text-center py-3 px-4 font-semibold text-foreground">
                        {student.total !== undefined && student.total !== null ? (
                          <span>{student.total}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>SmartClass - Sistema de Gestión Académica</p>
          <p className="mt-1">Este enlace es privado. No lo compartas con personas no autorizadas.</p>
        </div>
      </div>
    </div>
  );
};

export default GradesView;

