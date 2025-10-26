import { useState } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { BASE_API_URL } from '../config/constants';

const SendMessageModal = ({ isOpen, onClose, student, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setStatus('error');
      return;
    }

    try {
      setSending(true);
      setStatus(null);
      
      const credentials = btoa(`${localStorage.getItem("email")}:${localStorage.getItem("password")}`);
      
      const response = await fetch(`${BASE_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: student.id,
          message: message.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setMessage('');
        if (onMessageSent) {
          onMessageSent(student, message.trim());
        }
        // Auto close after 2 seconds
        setTimeout(() => {
          onClose();
          setStatus(null);
        }, 2000);
      } else {
        setStatus('error');
        console.error('Error sending message:', result.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setMessage('');
      setStatus(null);
      onClose();
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0A0D14] border border-[#1F2937] rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Enviar Mensaje
              </h3>
              <p className="text-sm text-gray-400">
                Para: {student.nombre} {student.apellidos}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={sending}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Student Info */}
          <div className="bg-[#1F2937] p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="font-medium">Destinatario:</span>
              <span>{student.nombre} {student.apellidos}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <span>Email:</span>
              <span>{student.correo}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <span>Clase:</span>
              <span>{student.grado} {student.grupo} {student.especialidad}</span>
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensaje
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              disabled={sending}
              className="w-full h-32 px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {message.length}/500 caracteres
              </span>
              {message.length > 500 && (
                <span className="text-xs text-red-400">
                  Mensaje muy largo
                </span>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg mb-4">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">
                ¡Mensaje enviado correctamente!
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">
                {!message.trim() ? 'Por favor escribe un mensaje' : 'Error al enviar el mensaje. Inténtalo de nuevo.'}
              </span>
            </div>
          )}

          {/* Email Preview */}
          <div className="bg-[#1F2937] p-3 rounded-lg mb-4">
            <div className="text-xs text-gray-400 mb-2">Vista previa del email:</div>
            <div className="text-sm text-gray-300">
              <div className="font-medium mb-1">
                Asunto: Mensaje de la clase {student.grado} {student.grupo} {student.especialidad}
              </div>
              <div className="text-gray-400">
                De la clase {student.grado} {student.grupo} {student.especialidad}: {message || '[Tu mensaje aquí]'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1F2937]">
          <button
            onClick={handleClose}
            disabled={sending}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendMessage}
            disabled={sending || !message.trim() || message.length > 500}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Mensaje
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
