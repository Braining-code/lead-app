import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { addLead } from '../api';

export default function LeadEntry() {
  const [formData, setFormData] = useState({
    contacto: 'whatsapp',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    zona: '0-5 kms',
    estado: 'consulta'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAddLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await addLead(formData);

      setMessage({ type: 'success', text: '✅ Lead agregado correctamente' });
      setFormData({
        contacto: 'whatsapp',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        zona: '0-5 kms',
        estado: 'consulta'
      });
      document.getElementById('nombre').focus();

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al guardar lead';
      setMessage({ type: 'error', text: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden">

        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Agregar Lead</h2>

          {/* Message */}
          {message.text && (
            <div className={`mb-4 p-3 rounded flex items-center gap-2 text-sm ${message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleAddLead} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cómo se contactó</label>
              <select
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="telefono">Teléfono</option>
                <option value="email">Email</option>
                <option value="formulario">Formulario Web</option>
                <option value="paciente">Paciente</option>
                <option value="referenciado_paciente">Referenciado Paciente</option>
                <option value="referenciado_profesional">Referenciado Profesional</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                id="nombre"
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                autoFocus
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                disabled={loading}
              />
            </div>

            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
              disabled={loading}
            />

            <input
              type="email"
              placeholder="Email (opcional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
              disabled={loading}
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                disabled={loading}
              >
                <option value="0-5 kms">0-5 kms</option>
                <option value="CABA">CABA</option>
                <option value="Pcia">Pcia</option>
                <option value="Interior">Interior</option>
              </select>

              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                disabled={loading}
              >
                <option value="consulta">Consulta</option>
                <option value="agendado">Agendado</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white py-2.5 rounded font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              {loading ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
