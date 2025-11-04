import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BASE_API_URL } from "../config/constants";
import { 
  Link2, 
  Copy, 
  Check, 
  Plus, 
  Calendar, 
  Users, 
  Eye, 
  GraduationCap,
  Loader2,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  Trash2
} from "lucide-react";
import { X } from "lucide-react";

const GroupLinks = () => {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [error, setError] = useState(null);
  const [deletingLinkId, setDeletingLinkId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState({ isOpen: false, link: null });

  useEffect(() => {
    fetchGroups();
    fetchLinks();
  }, []);

  const fetchGroups = async () => {
    try {
      const credentials = btoa(
        `${localStorage.getItem("email")}:${localStorage.getItem("password")}`
      );
      const response = await fetch(`${BASE_API_URL}/getClassrooms`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        setGrupos(data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Error al cargar grupos");
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const credentials = btoa(
        `${localStorage.getItem("email")}:${localStorage.getItem("password")}`
      );
      const response = await fetch(`${BASE_API_URL}/getGroupLinks`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success && data.links) {
        setLinks(data.links);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedGroup) return;

    setGenerating(true);
    setError(null);

    try {
      const credentials = btoa(
        `${localStorage.getItem("email")}:${localStorage.getItem("password")}`
      );
      const response = await fetch(`${BASE_API_URL}/generateGroupLink`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLinks([data.link, ...links]);
        setShowModal(false);
        setSelectedGroup(null);
      } else {
        setError(data.error || "Error al generar enlace");
      }
    } catch (error) {
      console.error("Error generating link:", error);
      setError("Error al generar enlace. Intenta nuevamente.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (hash, fullLink) => {
    navigator.clipboard.writeText(fullLink);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const openLink = (hash) => {
    const fullLink = `${window.location.origin}/#/grades/${hash}`;
    window.open(fullLink, "_blank");
  };

  const handleDeleteLink = async (linkId) => {
    setDeletingLinkId(linkId);
    setError(null);

    try {
      const credentials = btoa(
        `${localStorage.getItem("email")}:${localStorage.getItem("password")}`
      );
      const response = await fetch(`${BASE_API_URL}/deleteGroupLink/${linkId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Eliminar el enlace de la lista local
        setLinks(links.filter((link) => link.id !== linkId));
        setShowDeleteModal({ isOpen: false, link: null });
      } else {
        setError(data.error || "Error al eliminar enlace");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      setError("Error al eliminar enlace. Intenta nuevamente.");
    } finally {
      setDeletingLinkId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/grupos")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Grupos</span>
          </button>
          <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Enlaces de Calificaciones
              </h1>
              <p className="text-muted-foreground">
                Genera y gestiona enlaces únicos para compartir calificaciones con tus estudiantes
              </p>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Generar Enlace
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Links List */}
        {links.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Link2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay enlaces generados
              </h3>
              <p className="text-muted-foreground mb-4">
                Genera tu primer enlace para compartir calificaciones con tus estudiantes
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generar Primer Enlace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {links.map((link) => (
              <Card key={link.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-foreground">
                          {link.groupName}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Creado: {formatDate(link.createdAt)}</span>
                        </div>
                        {link.lastAccessedAt && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Último acceso: {formatDate(link.lastAccessedAt)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{link.accessCount} accesos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className="flex-1 p-3 bg-muted rounded-lg border border-border">
                      <code className="text-sm text-foreground break-all">
                        {link.fullLink}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.hash, link.fullLink)}
                      className="flex-shrink-0 w-full sm:w-auto"
                    >
                      {copiedHash === link.hash ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLink(link.hash)}
                      className="flex-shrink-0 w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteModal({ isOpen: true, link })}
                      className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                      disabled={deletingLinkId === link.id}
                    >
                      {deletingLinkId === link.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>
                      <strong>Hash:</strong> {link.hash.substring(0, 16)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal.isOpen && showDeleteModal.link && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Card className="max-w-md w-full relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">
                      Confirmar Eliminación
                    </CardTitle>
                    <button
                      onClick={() => setShowDeleteModal({ isOpen: false, link: null })}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-foreground mb-2">
                        ¿Estás seguro de que deseas eliminar este enlace?
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {showDeleteModal.link.groupName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Una vez eliminado, el enlace dejará de funcionar y los estudiantes no podrán acceder a las calificaciones a través de él.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteModal({ isOpen: false, link: null })}
                        disabled={deletingLinkId === showDeleteModal.link.id}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleDeleteLink(showDeleteModal.link.id)}
                        disabled={deletingLinkId === showDeleteModal.link.id}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        {deletingLinkId === showDeleteModal.link.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Generate Link Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Card className="max-w-md w-full relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">
                      Generar Nuevo Enlace
                    </CardTitle>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedGroup(null);
                        setError(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Seleccionar Grupo
                      </label>
                      <select
                        value={selectedGroup?.id || ""}
                        onChange={(e) => {
                          const group = grupos.find(
                            (g) => g.id === parseInt(e.target.value)
                          );
                          setSelectedGroup(group);
                        }}
                        className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">Selecciona un grupo</option>
                        {grupos.map((grupo) => {
                          const groupName = grupo.nombre || `${grupo.grado}° ${grupo.grupo} - ${grupo.especialidad}`;
                          return (
                            <option key={grupo.id} value={grupo.id}>
                              {groupName}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedGroup && (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground mb-2">
                          Grupo seleccionado:
                        </p>
                        <p className="font-semibold text-foreground">
                          {selectedGroup.nombre || `${selectedGroup.grado}° ${selectedGroup.grupo} - ${selectedGroup.especialidad}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedGroup.alumnos || 0} estudiantes
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Nota:</strong> El enlace generado será permanente y no
                        expirará. Los estudiantes podrán ver sus calificaciones sin
                        necesidad de autenticación.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowModal(false);
                          setSelectedGroup(null);
                          setError(null);
                        }}
                        disabled={generating}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleGenerateLink}
                        disabled={!selectedGroup || generating}
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 mr-2" />
                            Generar Enlace
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupLinks;

