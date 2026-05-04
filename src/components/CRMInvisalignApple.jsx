import React, { useState, useEffect } from 'react';
import { getLeads, updateLead, deleteLead as apiDeleteLead, addInteraction, getLeadHistory } from '../api';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Search, X, CheckCircle, AlertCircle, Eye, Users, MessageCircle, Calendar, Stethoscope, Clock, Phone, ArrowRight, Download, ChevronDown } from 'lucide-react';

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
                fecha: l.created_at ? l.created_at.substring(0, 10) : new Date().toISOString().split('T')[0]
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

    const [selectedLeads, setSelectedLeads] = useState([]);
    const [filterState, setFilterState] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedLead, setExpandedLead] = useState(null);

    const getNextState = (currentState) => {
        const flow = [
            'Consultó', 'Agendado', 'Asistió', 'Presupuesto Enviado', 
            'Seguimiento 1', 'Seguimiento 2', 'Seguimiento 3'
        ];
        const idx = flow.indexOf(currentState);
        if (idx !== -1 && idx < flow.length - 1) return flow[idx + 1];
        return null;
    };

    const getStatusColor = (status) => {
        const colors = {
            'todos': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', gradient: 'from-gray-700 to-gray-900' },
            'Consultó': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', gradient: 'from-blue-400 to-blue-500' },
            'Agendado': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', gradient: 'from-indigo-400 to-indigo-500' },
            'Asistió': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', gradient: 'from-purple-400 to-purple-500' },
            'Presupuesto Enviado': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', gradient: 'from-pink-400 to-pink-500' },
            'Seguimiento 1': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', gradient: 'from-orange-400 to-orange-500' },
            'Seguimiento 2': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', gradient: 'from-yellow-400 to-yellow-500' },
            'Seguimiento 3': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', gradient: 'from-red-400 to-red-500' },
            'Ganado': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', gradient: 'from-emerald-400 to-emerald-500' },
            'Perdido': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', gradient: 'from-slate-500 to-slate-600' }
        };
        return colors[status] || colors['todos'];
    };

    const getTrackingAlert = (lead) => {
        if (!lead.status_date) return null;
        
        const hoursPassed = (new Date() - new Date(lead.status_date)) / (1000 * 60 * 60);
        
        if (lead.estado === 'Presupuesto Enviado' && hoursPassed >= 24) {
            return { color: 'text-red-500', text: 'Seguimiento 24hs: Hoy enviar mensaje (Máximo)' };
        }
        if (lead.estado === 'Seguimiento 1' && hoursPassed >= 48) {
            return { color: 'text-orange-500', text: 'Seguimiento 72hs: Hoy enviar mensaje (Dayana)' };
        }
        if (lead.estado === 'Seguimiento 2' && hoursPassed >= 72) {
            return { color: 'text-yellow-500', text: 'Seguimiento 144hs: Hoy enviar video' };
        }
        return null;
    };

    const pendingLeads = leads.map(lead => {
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

    const stats = {
        todos: leads.length,
        consulto: leads.filter(l => l.estado === 'Consultó').length,
        agendo: leads.filter(l => l.estado === 'Agendado').length,
        asistio: leads.filter(l => l.estado === 'Asistió').length,
        presupuesto: leads.filter(l => l.estado === 'Presupuesto Enviado').length,
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

    const updateLeadStatus = async (id, newStatus) => {
        try {
            await updateLead(id, newStatus);
            fetchLeads(); // Fetch to get new dates and refresh pendingLeads
            setMessage({ type: 'success', text: `Estado actualizado a ${newStatus}` });
            setTimeout(() => setMessage({ type: '', text: '' }), 2000);
        } catch (error) {
            console.error("Update failed", error);
            setMessage({ type: 'error', text: 'Error actualizando estado' });
        }
    }

    const exportToCSV = () => {
        const headers = ["Nombre", "Apellido", "Contacto", "Telefono", "Email", "Estado", "Fecha"];
        const rows = filteredLeads.map(l => [
            l.nombre, l.apellido, l.contacto, l.telefono, l.email, l.estado, l.fecha
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {[
                            { Icon: Users, label: 'Todos', filter: 'todos', value: stats.todos },
                            { Icon: MessageCircle, label: 'Consultó', filter: 'Consultó', value: stats.consulto },
                            { Icon: Calendar, label: 'Agendado', filter: 'Agendado', value: stats.agendo },
                            { Icon: Users, label: 'Asistió', filter: 'Asistió', value: stats.asistio },
                            { Icon: Eye, label: 'Presupuesto', filter: 'Presupuesto Enviado', value: stats.presupuesto },
                            { Icon: Stethoscope, label: 'Ganado', filter: 'Ganado', value: stats.ganado },
                            { Icon: X, label: 'Perdido', filter: 'Perdido', value: stats.perdido }
                        ].map((stat, idx) => {
                            const isActive = filterState === stat.filter;
                            const gradient = getStatusColor(stat.filter).gradient;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setFilterState(stat.filter)}
                                    className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 hover:shadow-2xl hover:scale-105 transition duration-300 text-white group relative overflow-hidden text-left border-4 ${isActive ? 'border-white shadow-xl scale-105' : 'border-transparent'}`}
                                >
                                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:blur-2xl transition duration-300"></div>
                                    <stat.Icon className="w-8 h-8 mb-3 opacity-90 group-hover:scale-110 transition duration-300" strokeWidth={1.5} />
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-90 relative z-10">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1 relative z-10">{stat.value}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FILTROS Y EXPORTAR */}
                <div className="mb-8 flex justify-between items-center gap-4">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar paciente o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:bg-gray-150 text-base border-0"
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        Exportar CSV
                    </button>
                </div>

                {/* TABLA */}
                <div className="mb-16">
                    <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto relative">
                            <table className="w-full text-left">
                            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-5 w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-5 h-5 rounded"
                                        />
                                    </th>
                                    <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Apellido</th>
                                    <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Origen</th>
                                    <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado Actual</th>
                                    <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Siguiente Acción</th>
                                    <th className="px-4 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-4 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100 bg-white">
                                {filteredLeads.map((lead) => (
                                    <React.Fragment key={lead.id}>
                                        <tr className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.includes(lead.id)}
                                                    onChange={() => toggleSelect(lead.id)}
                                                    className="w-5 h-5 rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-base font-bold text-gray-900">{lead.nombre}</div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-base font-bold text-gray-900">{lead.apellido}</div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-xs text-gray-500 mt-0.5 capitalize flex items-center gap-1 font-semibold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                    {lead.contacto?.replace(/_/g, ' ')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-sm font-semibold text-gray-700">{lead.telefono}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{lead.email}</div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex flex-col items-start gap-1.5">
                                                    <div className="relative inline-block w-full max-w-[160px]">
                                                        <select
                                                            value={lead.estado}
                                                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                            className={`w-full appearance-none px-3 py-1.5 pr-8 border rounded-full text-xs font-bold tracking-wide focus:outline-none cursor-pointer ${getStatusColor(lead.estado).bg} ${getStatusColor(lead.estado).text} ${getStatusColor(lead.estado).border}`}
                                                        >
                                                            <option value="Consultó">Consultó</option>
                                                            <option value="Agendado">Agendado</option>
                                                            <option value="Asistió">Asistió</option>
                                                            <option value="Presupuesto Enviado">Presupuesto</option>
                                                            <option value="Seguimiento 1">Seg. 1</option>
                                                            <option value="Seguimiento 2">Seg. 2</option>
                                                            <option value="Seguimiento 3">Seg. 3</option>
                                                            <option value="Ganado">Ganado</option>
                                                            <option value="Perdido">Perdido</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                                            <ChevronDown className={`w-3.5 h-3.5 ${getStatusColor(lead.estado).text}`} />
                                                        </div>
                                                    </div>
                                                    {getTrackingAlert(lead) && (
                                                        <div className={`text-xs font-bold flex items-center gap-1 ${getTrackingAlert(lead).color}`}>
                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                            {getTrackingAlert(lead).text}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                {getNextState(lead.estado) ? (
                                                    <button 
                                                        onClick={() => updateLeadStatus(lead.id, getNextState(lead.estado))}
                                                        className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${getStatusColor(getNextState(lead.estado)).bg} ${getStatusColor(getNextState(lead.estado)).text} ${getStatusColor(getNextState(lead.estado)).border}`}
                                                    >
                                                        Pasar a {getNextState(lead.estado)} ➔
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic font-semibold flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4" /> Finalizado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-5 text-sm font-medium text-gray-500">{lead.fecha}</td>
                                            <td className="px-4 py-5 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <button
                                                        onClick={() => deleteLead(lead.id)}
                                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"
                                                        title="Eliminar Lead"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* HISTORIAL */}
                                        <tr className={`${expandedLead === lead.id ? 'bg-gray-100' : 'hidden'}`}>
                                            <td colSpan="9" className="px-8 py-6">
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
                </div>
            </div>
        </div>
    );
}
