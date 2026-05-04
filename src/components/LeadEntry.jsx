import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, Phone, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { addLead, getLeads, updateLead } from '../api';
import { useNavigate } from 'react-router-dom';

export default function LeadEntry() {
  const [formData, setFormData] = useState({
    contacto: 'whatsapp',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    zona: '0-5 kms',
    estado: 'Consultó'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const [pendingLeads, setPendingLeads] = useState([]);

  useEffect(() => {
    fetchPendingLeads();
  }, []);

  const fetchPendingLeads = async () => {
    try {
      const { data } = await getLeads();
      const pending = data.map(lead => {
        if (!lead.status_date) return null;
        const hoursPassed = (new Date() - new Date(lead.status_date)) / (1000 * 60 * 60);
        
        if (lead.estado === 'Presupuesto Enviado' && hoursPassed >= 24) {
            return { ...lead, alertType: 'Seguimiento 24hs', instruction: 'Hoy enviar mensaje (Máximo)', color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100', nextState: 'Seguimiento 1' };
        }
        if (lead.estado === 'Seguimiento 1' && hoursPassed >= 48) {
            return { ...lead, alertType: 'Seguimiento 72hs', instruction: 'Hoy enviar mensaje (Dayana)', color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100', nextState: 'Seguimiento 2' };
        }
        if (lead.estado === 'Seguimiento 2' && hoursPassed >= 72) {
            return { ...lead, alertType: 'Seguimiento 144hs', instruction: 'Hoy enviar video', color: 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100', nextState: 'Seguimiento 3' };
        }
        return null;
      }).filter(Boolean);
      
      setPendingLeads(pending);
    } catch (error) {
      console.error("Error fetching leads for alarms", error);
    }
  };

  const handleCompleteTask = async (lead) => {
    if (!lead.nextState) return;
    setLoading(true);
    try {
        await updateLead(lead.id, lead.nextState);
        setMessage({ type: 'success', text: `✅ Tarea completada: ${lead.nombre} movido a ${lead.nextState}` });
        fetchPendingLeads();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: '❌ Error al completar la tarea' });
    } finally {
        setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await addLead(formData);
      fetchPendingLeads(); // Refrescar listas por si acaso

      setMessage({ type: 'success', text: '✅ Lead agregado correctamente' });
      setFormData({
        contacto: 'whatsapp',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        zona: '0-5 kms',
        estado: 'Consultó'
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER SIMPLE */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Lead App</h1>
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto p-8 flex flex-col gap-8">
        {/* FORMULARIO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-black text-white p-1.5 rounded-lg"><Send className="w-4 h-4" /></span>
              Nuevo Lead
            </h2>
          </div>

          <div className="p-6">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleAddLead} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Origen del Contacto</label>
                <select
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                  className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
                    autoFocus
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Email (opcional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Zona</label>
                  <select
                    value={formData.zona}
                    onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                    className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
                    disabled={loading}
                  >
                    <option value="0-5 kms">0-5 kms</option>
                    <option value="CABA">CABA</option>
                    <option value="Pcia">Pcia</option>
                    <option value="Interior">Interior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Estado Inicial</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition bg-gray-50"
                    disabled={loading}
                  >
                    <option value="Consultó">Consultó</option>
                    <option value="Agendado">Agendado</option>
                    <option value="Asistió">Asistió</option>
                    <option value="Presupuesto Enviado">Presupuesto Enviado</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg mt-4 active:scale-[0.98]"
              >
                {loading ? 'GUARDANDO...' : 'GUARDAR LEAD'}
              </button>
            </form>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: ALARMAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
          <div className="p-6 border-b border-gray-100 bg-red-50/30">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 p-1.5 rounded-lg"><Clock className="w-4 h-4" /></span>
              Seguimientos Pendientes
              <span className="ml-auto bg-red-600 text-white text-xs px-2.5 py-1 rounded-full">{pendingLeads.length}</span>
            </h2>
          </div>
          
          <div className="p-6">
            {pendingLeads.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay seguimientos pendientes.</p>
                <p className="text-sm mt-1">¡Buen trabajo!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLeads.map((lead) => (
                  <button 
                    key={lead.id} 
                    onClick={() => handleCompleteTask(lead)}
                    disabled={loading}
                    className={`w-full text-left p-5 rounded-xl border ${lead.color} relative overflow-hidden group transition cursor-pointer active:scale-[0.98]`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-xl -mr-12 -mt-12 group-hover:bg-white/30 transition"></div>
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          Paciente: {lead.nombre} {lead.apellido}
                        </h3>
                        <p className="text-sm font-bold text-gray-700 bg-white/60 inline-block px-2.5 py-1 rounded-md mb-1 shadow-sm">
                           🎯 Tarea: {lead.instruction}
                        </p>
                        <div className="flex items-center gap-4 text-sm mt-1 opacity-80 text-gray-800">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone className="w-4 h-4" />
                            {lead.telefono}
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-1.5 font-medium">
                              <Mail className="w-4 h-4" />
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/60 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 group-hover:bg-white transition shadow-sm border border-gray-200/50">
                        Marcar como Completado <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
