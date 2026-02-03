import React, { useState, useEffect } from 'react';
import { getLeads, updateLead, deleteLead as apiDeleteLead, addInteraction, getLeadHistory } from '../api';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Search, X, CheckCircle, AlertCircle, Eye, Users, MessageCircle, Calendar, Stethoscope } from 'lucide-react';

const HeartIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

export default function InvisalignApple() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data } = await getLeads();
            // Ensure every lead has a history array for the UI
            const processed = data.map(l => ({
                ...l,
                historial: [],
                fecha: l.created_at ? l.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            setLeads(processed);
        } catch (error) {
            console.error("Error loading leads", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (id) => {
        try {
            const { data } = await getLeadHistory(id);
            setLeads(prev => prev.map(l =>
                l.id === id ? { ...l, historial: data } : l
            ));
        } catch (error) {
            console.error("Error loading history", error);
        }
    };

    const templates = {
        email: [
            { name: 'Seguimiento', desc: 'Contacto amistoso', body: 'Hola [nombre], ¿cómo estás? Te gustaría agendar una consulta con nosotros para hablar sobre tus opciones de tratamiento.' },
            { name: 'Promoción', desc: 'Oferta especial', body: 'Hola [nombre], 20% de descuento en Invisalign este mes. Agende tu consulta gratuita hoy mismo.' }
        ],
        sms: [
            { name: 'Seguimiento', desc: 'Con video de Invisalign', body: 'Hola [nombre], mira cómo funciona Invisalign: https://youtu.be/xyz' },
            { name: 'Promoción', desc: 'Con video promocional', body: '20% desc en Invisalign. Mira el video: https://youtu.be/promo' }
        ]
    };

    const [selectedLeads, setSelectedLeads] = useState([]);
    const [filterState, setFilterState] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedLead, setExpandedLead] = useState(null);

    const stats = {
        visitasSitio: 450,
        leads: leads.length,
        consulto: leads.filter(l => l.estado === 'Consultó').length,
        agendo: leads.filter(l => l.estado === 'Agendado').length,
        ganado: leads.filter(l => l.estado === 'Ganado').length,
        perdido: leads.filter(l => l.estado === 'Perdido').length,
    };

    const filteredLeads = leads.filter(lead => {
        const matchState = filterState === 'todos' || lead.estado === filterState;
        const matchSearch = lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.telefono.includes(searchTerm);
        return matchState && matchSearch;
    });

    const toggleSelect = (id) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLeads.length === filteredLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredLeads.map(l => l.id));
        }
    };

    const handleSend = async () => {
        if (!selectedTemplate) {
            setMessage({ type: 'error', text: 'Selecciona una plantilla' });
            return;
        }

        const template = templates[modalType].find(t => t.name === selectedTemplate);

        try {
            // Send to all selected leads
            const operations = selectedLeads.map(leadId =>
                addInteraction(leadId, {
                    tipo: modalType,
                    plantilla: template.name
                })
            );

            await Promise.all(operations);

            // Refresh UI (optimistic or refetch)
            // Here we just refetch data for simplicity to ensure sync
            // For improved UX we could update local state immediately
            selectedLeads.forEach(id => fetchHistory(id));

            setMessage({
                type: 'success',
                text: `${selectedLeads.length} mensaje(s) enviado(s)`
            });

            setTimeout(() => {
                setShowModal(false);
                setSelectedLeads([]);
                setMessage({ type: '', text: '' });
            }, 2500);

        } catch (error) {
            console.error("Error sending messages", error);
            setMessage({ type: 'error', text: 'Error enviando mensajes' });
        }
    };

    const deleteLead = async (id) => {
        if (!confirm('¿Eliminar este lead?')) return;
        try {
            await apiDeleteLead(id);
            setLeads(leads.filter(l => l.id !== id));
            setMessage({ type: 'success', text: 'Lead eliminado' });
            setTimeout(() => setMessage({ type: '', text: '' }), 2000);
        } catch (error) {
            console.error("Delete failed", error);
            setMessage({ type: 'error', text: 'Error al eliminar' });
        }
    };

    const updateLeadStatus = async (id, newStatus) => {
        try {
            await updateLead(id, newStatus);
            setLeads(leads.map(l => l.id === id ? { ...l, estado: newStatus } : l));
        } catch (error) {
            console.error("Update failed", error);
            setMessage({ type: 'error', text: 'Error actualizando estado' });
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* HEADER */}
            <div className="border-b border-gray-200/50 sticky top-0 z-20 bg-white/80 backdrop-blur">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-black p-2 rounded-xl shadow-lg">
                                    <HeartIcon className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-4xl font-semibold text-black tracking-tight">Dental Life</h1>
                            </div>
                            <p className="text-lg text-gray-500 font-light ml-14">Panel de Invisalign Leads</p>
                        </div>
                        <button
                            onClick={() => navigate('/entry')}
                            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
                        >
                            <span>Ingresar Lead</span>
                            <div className="bg-white/20 p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* MENSAJES */}
                {message.text && (
                    <div className={`mb-8 p-5 rounded-2xl flex items-center gap-3 backdrop-blur ${message.type === 'success'
                        ? 'bg-green-50/80 border border-green-200/50'
                        : 'bg-red-50/80 border border-red-200/50'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-6 h-6 text-green-700" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-red-700" />
                        )}
                        <p className={`text-base font-medium ${message.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* MÉTRICAS - ESTILO APACHE */}
                <div className="mb-16">
                    <h2 className="text-2xl font-semibold text-black mb-8">Dashboard</h2>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { Icon: Eye, label: 'Visitas Sitio', value: stats.visitasSitio, color: 'from-blue-500 to-blue-600' },
                            { Icon: Users, label: 'Leads', value: stats.leads, color: 'from-purple-500 to-purple-600' },
                            { Icon: MessageCircle, label: 'Consultó', value: stats.consulto, color: 'from-orange-500 to-orange-600' },
                            { Icon: Calendar, label: 'Agendo', value: stats.agendo, color: 'from-pink-500 to-pink-600' },
                            { Icon: Stethoscope, label: 'Ganado', value: stats.ganado, color: 'from-green-500 to-green-600' },
                            { Icon: X, label: 'Perdido', value: stats.perdido, color: 'from-gray-500 to-gray-600' }
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className={`bg-gradient-to-br ${stat.color} rounded-3xl p-8 hover:shadow-2xl hover:scale-105 transition duration-300 cursor-default text-white group relative overflow-hidden`}
                            >
                                <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:blur-3xl transition duration-300"></div>
                                <stat.Icon className="w-12 h-12 mb-4 group-hover:scale-125 transition duration-300" strokeWidth={1.5} />
                                <p className="text-sm font-semibold uppercase tracking-wide opacity-90 relative z-10">{stat.label}</p>
                                <p className="text-5xl font-bold mt-3 relative z-10">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FILTROS */}
                <div className="mb-12">
                    <div className="flex gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:bg-gray-150 text-base border-0"
                            />
                        </div>
                        <select
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                            className="px-6 py-4 bg-gray-100 rounded-2xl focus:outline-none text-base font-medium text-gray-900 border-0 cursor-pointer"
                        >
                            <option value="todos">Todos</option>
                            <option value="Consultó">Consultó</option>
                            <option value="Ganado">Ganado</option>
                            <option value="Perdido">Perdido</option>
                        </select>
                    </div>
                </div>

                {/* TABLA */}
                <div className="mb-16">
                    <div className="bg-gray-50 rounded-3xl overflow-hidden">
                        <table className="w-full">
                            <thead className="border-b border-gray-200">
                                <tr className="bg-white/50">
                                    <th className="px-8 py-5 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-5 h-5 rounded"
                                        />
                                    </th>
                                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                    <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                    <th className="px-8 py-5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLeads.map((lead) => (
                                    <React.Fragment key={lead.id}>
                                        <tr className="hover:bg-white/50 transition">
                                            <td className="px-8 py-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.includes(lead.id)}
                                                    onChange={() => toggleSelect(lead.id)}
                                                    className="w-5 h-5 rounded"
                                                />
                                            </td>
                                            <td className="px-8 py-6 text-base font-semibold text-black">{lead.nombre}</td>
                                            <td className="px-8 py-6 text-base text-gray-600">{lead.telefono}</td>
                                            <td className="px-8 py-6 text-base text-gray-600">{lead.email}</td>
                                            <td className="px-8 py-6">
                                                <select
                                                    value={lead.estado}
                                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium border-0 focus:outline-none cursor-pointer"
                                                >
                                                    <option value="Agendado">Agendado</option>
                                                    <option value="Consultó">Consultó</option>
                                                    <option value="Ganado">Ganado</option>
                                                    <option value="Perdido">Perdido</option>
                                                </select>
                                            </td>
                                            <td className="px-8 py-6 text-base text-gray-600">{lead.fecha}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => deleteLead(lead.id)}
                                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"
                                                    title="Eliminar Lead"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>

                                        {/* HISTORIAL */}
                                        <tr className={`${expandedLead === lead.id ? 'bg-gray-100' : 'hidden'}`}>
                                            <td colSpan="6" className="px-8 py-6">
                                                <button
                                                    onClick={() => {
                                                        const isExpanding = expandedLead !== lead.id;
                                                        setExpandedLead(isExpanding ? lead.id : null);
                                                        if (isExpanding) fetchHistory(lead.id);
                                                    }}
                                                    className="flex items-center gap-2 text-black font-semibold mb-4 hover:text-gray-600 transition"
                                                >
                                                    {expandedLead === lead.id ? '▼' : '▶'} Historial
                                                </button>

                                                {expandedLead === lead.id && (
                                                    <div className="space-y-3">
                                                        {lead.historial.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {lead.historial.map((item, idx) => (
                                                                    <div key={idx} className="bg-white rounded-xl p-4 flex items-start gap-3">
                                                                        {item.tipo === 'email' ? (
                                                                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                                                                        ) : (
                                                                            <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                                                                        )}
                                                                        <div>
                                                                            <p className="text-base font-semibold text-black">{item.plantilla}</p>
                                                                            <p className="text-sm text-gray-600 mt-1">📅 {item.fecha}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-600">Sin historial</p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ACCIONES - REDISEÑADO */}
                <div className="mb-16">
                    <h2 className="text-2xl font-semibold text-black mb-8">Acciones</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {/* SEGUIMIENTO */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-black">Seguimiento</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        const allLeads = leads.map(l => l.id);
                                        const template = templates.sms.find(t => t.name === 'Seguimiento');
                                        const updatedLeads = leads.map(lead => ({
                                            ...lead,
                                            historial: [
                                                ...lead.historial,
                                                {
                                                    tipo: 'sms',
                                                    fecha: new Date().toISOString().split('T')[0],
                                                    plantilla: template.name
                                                }
                                            ]
                                        }));
                                        setLeads(updatedLeads);
                                        setMessage({ type: 'success', text: `${allLeads.length} SMS enviado(s)` });
                                        setTimeout(() => setMessage({ type: '', text: '' }), 2500);
                                    }}
                                    className="w-full bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl p-6 transition group border border-green-200 text-left active:scale-95"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">SMS</p>
                                            <p className="text-2xl font-bold text-green-900 mt-1">Contacto rápido</p>
                                        </div>
                                        <MessageSquare className="w-8 h-8 text-green-600 group-hover:scale-125 transition" />
                                    </div>
                                    <p className="text-sm text-green-700">Mira cómo funciona Invisalign: [video]</p>
                                </button>

                                <button
                                    onClick={() => {
                                        const allLeads = leads.map(l => l.id);
                                        const template = templates.email.find(t => t.name === 'Seguimiento');
                                        const updatedLeads = leads.map(lead => ({
                                            ...lead,
                                            historial: [
                                                ...lead.historial,
                                                {
                                                    tipo: 'email',
                                                    fecha: new Date().toISOString().split('T')[0],
                                                    plantilla: template.name
                                                }
                                            ]
                                        }));
                                        setLeads(updatedLeads);
                                        setMessage({ type: 'success', text: `${allLeads.length} Email(s) enviado(s)` });
                                        setTimeout(() => setMessage({ type: '', text: '' }), 2500);
                                    }}
                                    className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-2xl p-6 transition group border border-blue-200 text-left active:scale-95"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Email</p>
                                            <p className="text-2xl font-bold text-blue-900 mt-1">Contacto personal</p>
                                        </div>
                                        <Mail className="w-8 h-8 text-blue-600 group-hover:scale-125 transition" />
                                    </div>
                                    <p className="text-sm text-blue-700">¿Cómo estás? Te gustaría agendar...</p>
                                </button>
                            </div>
                        </div>

                        {/* PROMOCIÓN */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-black">Promoción</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        const allLeads = leads.map(l => l.id);
                                        const template = templates.sms.find(t => t.name === 'Promoción');
                                        const updatedLeads = leads.map(lead => ({
                                            ...lead,
                                            historial: [
                                                ...lead.historial,
                                                {
                                                    tipo: 'sms',
                                                    fecha: new Date().toISOString().split('T')[0],
                                                    plantilla: template.name
                                                }
                                            ]
                                        }));
                                        setLeads(updatedLeads);
                                        setMessage({ type: 'success', text: `${allLeads.length} SMS enviado(s)` });
                                        setTimeout(() => setMessage({ type: '', text: '' }), 2500);
                                    }}
                                    className="w-full bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-2xl p-6 transition group border border-orange-200 text-left active:scale-95"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">SMS</p>
                                            <p className="text-2xl font-bold text-orange-900 mt-1">Oferta rápida</p>
                                        </div>
                                        <MessageSquare className="w-8 h-8 text-orange-600 group-hover:scale-125 transition" />
                                    </div>
                                    <p className="text-sm text-orange-700">20% descuento + video Invisalign</p>
                                </button>

                                <button
                                    onClick={() => {
                                        const allLeads = leads.map(l => l.id);
                                        const template = templates.email.find(t => t.name === 'Promoción');
                                        const updatedLeads = leads.map(lead => ({
                                            ...lead,
                                            historial: [
                                                ...lead.historial,
                                                {
                                                    tipo: 'email',
                                                    fecha: new Date().toISOString().split('T')[0],
                                                    plantilla: template.name
                                                }
                                            ]
                                        }));
                                        setLeads(updatedLeads);
                                        setMessage({ type: 'success', text: `${allLeads.length} Email(s) enviado(s)` });
                                        setTimeout(() => setMessage({ type: '', text: '' }), 2500);
                                    }}
                                    className="w-full bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-2xl p-6 transition group border border-pink-200 text-left active:scale-95"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-pink-700 uppercase tracking-wide">Email</p>
                                            <p className="text-2xl font-bold text-pink-900 mt-1">Oferta final</p>
                                        </div>
                                        <Mail className="w-8 h-8 text-pink-600 group-hover:scale-125 transition" />
                                    </div>
                                    <p className="text-sm text-pink-700">20% descuento + consulta gratuita</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-8 py-8 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {modalType === 'email' ? (
                                        <Mail className="w-7 h-7 text-black" />
                                    ) : (
                                        <MessageSquare className="w-7 h-7 text-black" />
                                    )}
                                    <h2 className="text-2xl font-semibold text-black">
                                        {modalType === 'email' ? 'Email' : 'SMS'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-600 hover:text-black transition"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-4">
                                    Plantilla
                                </label>
                                <div className="space-y-3">
                                    {templates[modalType].map((template, idx) => (
                                        <label
                                            key={idx}
                                            className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition ${selectedTemplate === template.name
                                                ? 'bg-gray-100'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="template"
                                                value={template.name}
                                                checked={selectedTemplate === template.name}
                                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                                className="w-5 h-5 mt-1"
                                            />
                                            <div>
                                                <p className="font-semibold text-black">{template.name}</p>
                                                <p className="text-sm text-gray-600">{template.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedTemplate && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                                        Vista previa
                                    </label>
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <p className="text-base leading-relaxed text-gray-900">
                                            {templates[modalType].find(t => t.name === selectedTemplate)?.body}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 p-8 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-3 text-black font-semibold hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!selectedTemplate}
                                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${selectedTemplate
                                    ? 'bg-black text-white hover:bg-gray-900'
                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
