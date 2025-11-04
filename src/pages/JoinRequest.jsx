import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BASE_API_URL } from "../config/constants";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

const JoinRequest = () => {
  const { hash } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ nombre: "", apellidos: "", correo: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellidos || !form.correo) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/join/${hash}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Error al enviar solicitud");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Solicitud enviada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Tu solicitud fue enviada al profesor. Recibirás confirmación cuando sea aprobada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-foreground">Solicitud para unirse al grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-foreground block mb-2">Nombre</label>
              <Input name="nombre" value={form.nombre} onChange={onChange} placeholder="Ingresa tu nombre" />
            </div>
            <div>
              <label className="text-sm text-foreground block mb-2">Apellidos</label>
              <Input name="apellidos" value={form.apellidos} onChange={onChange} placeholder="Ingresa tus apellidos" />
            </div>
            <div>
              <label className="text-sm text-foreground block mb-2">Correo</label>
              <Input type="email" name="correo" value={form.correo} onChange={onChange} placeholder="Ingresa tu correo" />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>) : "Enviar solicitud"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinRequest;
