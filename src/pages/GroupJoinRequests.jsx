import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BASE_API_URL } from "../config/constants";
import { Users, Check, X, Loader2, ArrowLeft, Inbox, Link2, Copy, Check as CheckIcon } from "lucide-react";

const GroupJoinRequests = () => {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    const res = await fetch(`${BASE_API_URL}/getClassrooms`, {
      headers: { Authorization: `Basic ${credentials}` }
    });
    const data = await res.json();
    setGrupos(Array.isArray(data) ? data : []);
  };

  const fetchRequests = async (groupId) => {
    if (!groupId) return;
    setLoading(true);
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    const res = await fetch(`${BASE_API_URL}/getJoinRequests/${groupId}`, {
      headers: { Authorization: `Basic ${credentials}` }
    });
    const data = await res.json();
    setRequests(data.success ? data.requests : []);
    setLoading(false);
  };

  const generateJoinLink = async () => {
    if (!selectedGroupId) return;
    setGenerating(true);
    setGeneratedLink(null);
    try {
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      const res = await fetch(`${BASE_API_URL}/generateJoinLink`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: Number(selectedGroupId) })
      });
      const data = await res.json();
      if (data.success) setGeneratedLink(data.link);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    if (!generatedLink?.fullLink) return;
    navigator.clipboard.writeText(generatedLink.fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const approve = async (id) => {
    setActionLoadingId(id);
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    await fetch(`${BASE_API_URL}/approveJoinRequest/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Basic ${credentials}` }
    });
    await fetchRequests(selectedGroupId);
    setActionLoadingId(null);
  };

  const reject = async (id) => {
    setActionLoadingId(id);
    const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
    await fetch(`${BASE_API_URL}/rejectJoinRequest/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Basic ${credentials}` }
    });
    await fetchRequests(selectedGroupId);
    setActionLoadingId(null);
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
          <button
            onClick={() => navigate("/grupos")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Grupos
          </button>
          <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Solicitudes de Ingreso</h1>
              <p className="text-muted-foreground">Revisa y gestiona solicitudes enviadas por estudiantes.</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-4 py-2 text-foreground border border-border rounded-md hover:bg-accent/90 transition-colors w-full sm:w-auto justify-center"
            >
              <Link2 className="w-4 h-4 mr-2" /> Generar enlace de unión
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <label className="text-sm text-foreground block mb-2">Selecciona un grupo</label>
          <select
            value={selectedGroupId}
            onChange={(e) => { setSelectedGroupId(e.target.value); fetchRequests(e.target.value); }}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">Selecciona</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.grado}° {g.grupo} - {g.especialidad}</option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" /> Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Inbox className="w-10 h-10 mb-2" />
                No hay solicitudes para este grupo.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20 gap-3 flex-col sm:flex-row">
                    <div>
                      <div className="text-foreground font-medium">{r.apellidos}, {r.nombre}</div>
                      <div className="text-sm text-muted-foreground">{r.correo}</div>
                      <div className="text-xs text-muted-foreground">Enviada: {new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <Button
                        size="sm"
                        onClick={() => approve(r.id)}
                        disabled={actionLoadingId === r.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reject(r.id)}
                        disabled={actionLoadingId === r.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {actionLoadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {showGenerateModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Card className="max-w-md w-full relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Generar enlace de unión</CardTitle>
                  <button onClick={() => { setShowGenerateModal(false); setGeneratedLink(null); }} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-foreground block mb-2">Selecciona un grupo</label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">Selecciona</option>
                      {grupos.map((g) => (
                        <option key={g.id} value={g.id}>{g.grado}° {g.grupo} - {g.especialidad}</option>
                      ))}
                    </select>
                  </div>

                  {!generatedLink ? (
                    <button
                      onClick={generateJoinLink}
                      disabled={!selectedGroupId || generating}
                      className="w-full flex items-center justify-center px-4 py-2 text-foreground border border-border rounded-md hover:bg-accent/90 transition-colors"
                    >
                      {generating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...</>) : (<><Link2 className="w-4 h-4 mr-2" /> Generar enlace</>)}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg border border-border">
                        <code className="text-sm text-foreground break-all">{generatedLink.fullLink}</code>
                      </div>
                      <button
                        onClick={copyLink}
                        className="w-full flex items-center justify-center px-4 py-2 text-foreground border border-border rounded-md hover:bg-accent/90 transition-colors"
                      >
                        {copied ? (<><CheckIcon className="w-4 h-4 mr-2" /> Copiado</>) : (<><Copy className="w-4 h-4 mr-2" /> Copiar enlace</>)}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupJoinRequests;
