import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BASE_API_URL } from "../config/constants";
import { CheckCircle2, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [incorrectTextValue, setIncorrectTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const succesfull = useRef(null);
  const incorrectText = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    if (activeTab === "register") {
      await fetch(BASE_API_URL + "/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emailUser: email,
          password: password
        })
      })
        .then(data => data.json())
        .then((data) => {
          console.log(data);
          if (data.response === true) {
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);
            succesfull.current.style.display = "block";
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } else {
            incorrectText.current.style.display = "block";
            setIncorrectTextValue("Parece que el correo ya esta asociado a una cuenta o el servidor esta tardando más de lo normal");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      const credentials = btoa(`${email}:${password}`);
      await fetch(BASE_API_URL + "/verifyUser", {
        method: "GET",
        headers: {
          'Authorization': `Basic ${credentials}`,
          "Content-Type": "application/json"
        },
      })
        .then(data => data.json())
        .then(data => {
          if (data.response === true) {
            localStorage.setItem("email", data.data.email);
            localStorage.setItem("password", data.data.password);
            succesfull.current.style.display = "block";
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } else {
            incorrectText.current.style.display = "block";
            setIncorrectTextValue("Credenciales incorrectas");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background p-4">
      <Card className="w-full max-w-md border-border dark:border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground dark:text-foreground">
            {activeTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground dark:text-muted-foreground">
            {activeTab === "login"
              ? "Ingresa tus credenciales para acceder"
              : "Crea una nueva cuenta para comenzar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="grid w-full grid-cols-2 mb-4">
              <button
                className={`p-2 text-center transition-colors ${
                  activeTab === "login"
                    ? "border-b-2 border-primary text-primary dark:text-primary"
                    : "text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Iniciar Sesión
              </button>
              <button
                className={`p-2 text-center transition-colors ${
                  activeTab === "register"
                    ? "border-b-2 border-primary text-primary dark:text-primary"
                    : "text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary"
                }`}
                onClick={() => setActiveTab("register")}
              >
                Registrarse
              </button>
            </div>
            {activeTab === "login" ? (
              <div className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div ref={incorrectText} className="hidden text-sm text-destructive">
                    {incorrectTextValue}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div ref={incorrectText} className="hidden text-sm text-destructive">
                    {incorrectTextValue}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Crear Cuenta"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div ref={succesfull} className="hidden w-full">
            <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-green-700 dark:text-green-300 font-medium text-center">
                ¡Bienvenido a SmartClass!
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm text-center mt-1">
                Tu sesión ha sido iniciada correctamente
              </p>
              <div className="flex items-center justify-center mt-2 text-green-600 dark:text-green-400 text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo al dashboard...
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login; 