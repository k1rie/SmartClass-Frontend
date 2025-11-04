import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import logo from "../assets/logo.png";

function Landing() {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Smartclass" className="h-8 w-8 rounded" />
            <span className="font-semibold tracking-tight">Smartclass</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#login">
              <Button size="sm" variant="secondary" onClick={() => (window.location.hash = "#/login")}>Iniciar sesión</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-20 grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Administra grupos, estudiantes y calificaciones desde un solo lugar
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Smartclass permite crear y gestionar grupos, registrar estudiantes, tomar asistencia con QR y registrar calificaciones por actividad con reportes exportables. Incluye búsqueda de alumnos, enlaces de unión y visualizaciones de rendimiento.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => (window.location.hash = "#/login")}>Empezar ahora</Button>
              <Button variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Saber más</Button>
            </div>
            {/* Nota removida por solicitud */}
          </div>
          <div>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>¿Qué es Smartclass?</CardTitle>
                <CardDescription>Gestión académica centrada en el aula</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Crea y edita grupos con grado, grupo y especialidad</li>
                  <li>• Importa listas desde grupos existentes para alta rápida</li>
                  <li>• Registra estudiantes (nombre, apellidos, correo)</li>
                  <li>• Toma asistencia con QR y descarga por fecha</li>
                  <li>• Añade tareas con valor; cálculo de promedios por estudiante y grupo</li>
                  <li>• Exporta calificaciones y resúmenes (Excel/CSV)</li>
                  <li>• Genera enlaces para solicitudes de unión de estudiantes</li>
                  <li>• Vista enfocada a docentes para gestión completa del curso</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Características clave</h2>
          <p className="text-muted-foreground mt-2">Construido con componentes reutilizables y una experiencia moderna.</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Resumen de actividad</CardDescription>
              </CardHeader>
              <CardContent>
                Inicio muestra grupos totales, estudiantes, promedios y consejos automáticos.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Asistencia</CardTitle>
                <CardDescription>QR y verificación</CardDescription>
              </CardHeader>
              <CardContent>
                Escaneo rápido con QR para pase de lista; asistencias descargables. Soporte de verificación facial con face-api.js.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Modo oscuro</CardTitle>
                <CardDescription>Automático por preferencia</CardDescription>
              </CardHeader>
              <CardContent>
                Paleta accesible y tipografía legible con `Inter`.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section id="tecnologia" className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Tecnología</h2>
          <p className="text-muted-foreground mt-2">Aplicación Full Stack moderna.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
              <CardTitle>Frontend</CardTitle>
              <CardDescription>UI modular y consistente</CardDescription>
              </CardHeader>
              <CardContent>
                React + JavaScript, Vite, Tailwind CSS y componentes tipo Shadcn/ui (`button`, `card`, `input`). Rutas: dashboard, grupos, grupo, links, solicitudes, escáner, reconocimiento facial, calificaciones públicas y join.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Backend</CardTitle>
                <CardDescription>API REST</CardDescription>
              </CardHeader>
              <CardContent>
                Node.js + Express; endpoints de aulas, estudiantes y tareas (crear, listar, actualizar, borrar), exportación de datos y enlaces de unión. Autenticación Basic con email y password.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Base de datos</CardTitle>
                <CardDescription>Persistencia relacional</CardDescription>
              </CardHeader>
              <CardContent>
                MySQL para almacenamiento de grupos, estudiantes, tareas y asistencias.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Despliegue</CardTitle>
                <CardDescription>Infraestructura</CardDescription>
              </CardHeader>
              <CardContent>
                Desplegado en Hostgator y Koyeb según el entorno.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Smartclass</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-foreground" href="#features">Características</a>
            <a className="hover:text-foreground" href="#tecnologia">Tecnología</a>
            <button className="hover:text-foreground" onClick={() => (window.location.hash = "#/login")}>Iniciar sesión</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;


