// =================================================
// File: Consegne.jsx
// Componente per la gestione delle consegne del corriere
// =================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import {
    getConsegne,
    getClienti,
    createConsegna,
    updateConsegna,
    deleteConsegna
} from '../../src/services/api';
import './Consegne.css';

const STATI_CONSEGNA = [
    'da ritirare',
    'in deposito',
    'in consegna',
    'consegnato',
    'in giacenza'
];

const Consegne = () => {
    const { user } = useAuth();
    const [consegne, setConsegne] = useState([]);
    const [clienti, setClienti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentConsegna, setCurrentConsegna] = useState(null);
    const [modalError, setModalError] = useState(null);
    const [filtro, setFiltro] = useState({
        stato: '',
        clienteId: ''
    });

    const [formData, setFormData] = useState({
        clienteId: '',
        dataRitiro: '',
        dataConsegna: '',
        stato: '',
        chiaveConsegna: ''
    });

    const canGestireConsegne =
        !!user &&
        (
            user.admin === true ||
            user.Admin === true ||
            user.ruolo === 'Operatore' ||
            user.ruolo === 'Amministratore'
        );

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtro]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const clientiResponse = await getClienti();
            setClienti(clientiResponse.data || []);

            const filters = {};
            if (filtro.stato) filters.stato = filtro.stato;
            if (filtro.clienteId) filters.clienteId = filtro.clienteId;

            const consegneResponse = await getConsegne(filters);
            setConsegne(consegneResponse.data || []);
        } catch (err) {
            console.error('[CONSEGNE] Errore nel caricamento:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditMode(false);
        setCurrentConsegna(null);
        setModalError(null);
        setFormData({
            clienteId: '',
            dataRitiro: '',
            dataConsegna: '',
            stato: '',
            chiaveConsegna: ''
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (consegna) => {
        setEditMode(true);
        setCurrentConsegna(consegna);
        setModalError(null);
        setFormData({
            clienteId: consegna.ClienteID,
            dataRitiro: consegna.DataRitiro ? consegna.DataRitiro.substring(0, 10) : '',
            dataConsegna: consegna.DataConsegna ? consegna.DataConsegna.substring(0, 10) : '',
            stato: consegna.Stato || '',
            chiaveConsegna: consegna.ChiaveConsegna || ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentConsegna(null);
        setModalError(null);
        setFormData({
            clienteId: '',
            dataRitiro: '',
            dataConsegna: '',
            stato: '',
            chiaveConsegna: ''
        });
    };

    const handleSaveConsegna = async (e) => {
        e.preventDefault();

        if (!formData.clienteId || !formData.stato || !formData.chiaveConsegna) {
            setModalError('Cliente, stato e chiave consegna sono obbligatori');
            return;
        }

        try {
            setError(null);
            setModalError(null);

            const payload = {
                clienteId: parseInt(formData.clienteId, 10),
                dataRitiro: formData.dataRitiro || null,
                dataConsegna: formData.dataConsegna || null,
                stato: formData.stato,
                chiaveConsegna: formData.chiaveConsegna
            };

            if (editMode && currentConsegna) {
                await updateConsegna(currentConsegna.ConsegnaID, payload);
            } else {
                await createConsegna(payload);
            }

            handleCloseModal();
            loadData();
        } catch (err) {
            console.error('[CONSEGNE] Errore salvataggio:', err);

            const msg = err?.message || 'Si è verificato un errore durante il salvataggio';
            // Se l'errore riguarda una chiaveConsegna duplicata lo mostriamo dentro il modale
            if (msg.toLowerCase().includes('chiaveconsegna')) {
                setModalError(msg);
            } else {
                setError(msg);
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa consegna?')) {
            return;
        }

        try {
            setError(null);
            await deleteConsegna(id);
            loadData();
        } catch (err) {
            console.error('[CONSEGNE] Errore eliminazione:', err);
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('it-IT');
    };

    const getStatoBadgeClass = (stato) => {
        switch (stato) {
            case 'da ritirare': return 'badge-in-attesa';
            case 'in deposito': return 'badge-pending';
            case 'in consegna': return 'badge-approved';
            case 'consegnato': return 'badge-success';
            case 'in giacenza': return 'badge-warning';
            default: return '';
        }
    };

    const stats = {
        totali: consegne.length,
        daRitirare: consegne.filter(c => c.Stato === 'da ritirare').length,
        inDeposito: consegne.filter(c => c.Stato === 'in deposito').length,
        inConsegna: consegne.filter(c => c.Stato === 'in consegna').length,
        consegnato: consegne.filter(c => c.Stato === 'consegnato').length,
        inGiacenza: consegne.filter(c => c.Stato === 'in giacenza').length
    };

    if (!canGestireConsegne) {
        return (
            <div className="permessi-container">
                <div className="empty-state">
                    <div className="empty-state-icon">🔒</div>
                    <h3>Accesso limitato</h3>
                    <p>Solo gli operatori e gli amministratori possono gestire le consegne.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="permessi-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Caricamento consegne...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="permessi-container">
            <div className="permessi-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="icon-title">🚚</span>
                        <h1>Gestione Consegne</h1>
                    </div>
                    <p className="header-subtitle">
                        Visualizza, filtra e gestisci le consegne del corriere.
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleOpenCreateModal}
                >
                    <span className="btn-icon">+</span>
                    Nuova Consegna
                </button>
            </div>

            <div className="stats-container">
                <div className="stat-card stat-total">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totali}</div>
                        <div className="stat-label">Totali</div>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">🕒</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.daRitirare}</div>
                        <div className="stat-label">Da ritirare</div>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inDeposito}</div>
                        <div className="stat-label">In deposito</div>
                    </div>
                </div>
                <div className="stat-card stat-approved">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inConsegna}</div>
                        <div className="stat-label">In consegna</div>
                    </div>
                </div>
                <div className="stat-card stat-approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.consegnato}</div>
                        <div className="stat-label">Consegnato</div>
                    </div>
                </div>
                <div className="stat-card stat-rejected">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inGiacenza}</div>
                        <div className="stat-label">In giacenza</div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="filters-container">
                <div className="filters-header">
                    <span className="filters-icon">🔍</span>
                    <h3>Filtra Consegne</h3>
                </div>
                <div className="filters-content">
                    <div className="filter-group">
                        <label>
                            <span className="label-icon">📌</span>
                            Stato
                        </label>
                        <select
                            value={filtro.stato}
                            onChange={(e) => setFiltro({ ...filtro, stato: e.target.value })}
                        >
                            <option value="">Tutti gli stati</option>
                            {STATI_CONSEGNA.map(stato => (
                                <option key={stato} value={stato}>
                                    {stato}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>
                            <span className="label-icon">👥</span>
                            Cliente
                        </label>
                        <select
                            value={filtro.clienteId}
                            onChange={(e) => setFiltro({ ...filtro, clienteId: e.target.value })}
                        >
                            <option value="">Tutti i clienti</option>
                            {clienti.map(cli => (
                                <option key={cli.ClienteID} value={cli.ClienteID}>
                                    {cli.Nominativo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(filtro.stato || filtro.clienteId) && (
                        <button
                            className="btn-clear-filters"
                            onClick={() => setFiltro({ stato: '', clienteId: '' })}
                        >
                            ✖ Rimuovi Filtri
                        </button>
                    )}
                </div>
            </div>

            {consegne.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>Nessuna consegna trovata</h3>
                    <p>Non ci sono consegne da visualizzare.</p>
                    <button
                        className="btn-primary"
                        onClick={handleOpenCreateModal}
                        style={{ marginTop: '20px' }}
                    >
                        <span className="btn-icon">+</span>
                        Crea la prima consegna
                    </button>
                </div>
            ) : (
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3>
                            <span className="table-icon">📦</span>
                            Elenco Consegne ({consegne.length})
                        </h3>
                    </div>
                    <table className="permessi-table">
                        <thead>
                            <tr>
                                <th>📦 Chiave</th>
                                <th>👥 Cliente</th>
                                <th>🏙️ Comune</th>
                                <th>📅 Data Ritiro</th>
                                <th>📅 Data Consegna</th>
                                <th>📊 Stato</th>
                                <th>⚙️ Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consegne.map(consegna => (
                                <tr key={consegna.ConsegnaID}>
                                    <td>{consegna.ChiaveConsegna}</td>
                                    <td>{consegna.ClienteNominativo}</td>
                                    <td>{consegna.ClienteComune} ({consegna.ClienteProvincia})</td>
                                    <td>{formatDate(consegna.DataRitiro)}</td>
                                    <td>{formatDate(consegna.DataConsegna)}</td>
                                    <td>
                                        <span className={`badge ${getStatoBadgeClass(consegna.Stato)}`}>
                                            {consegna.Stato}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn-success"
                                                onClick={() => handleOpenEditModal(consegna)}
                                                title="Modifica consegna"
                                            >
                                                ✏️ Modifica
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(consegna.ConsegnaID)}
                                                title="Elimina consegna"
                                            >
                                                🗑️ Elimina
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <span className="modal-icon">🚚</span>
                                {editMode ? 'Modifica Consegna' : 'Nuova Consegna'}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                                title="Chiudi"
                            >
                                ×
                            </button>
                        </div>

                        {modalError && (
                            <div className="error-message" style={{ marginBottom: '16px' }}>
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleSaveConsegna} className="permesso-form">
                            <div className="form-group">
                                <label>
                                    <span className="form-icon">👥</span>
                                    Cliente *
                                </label>
                                <select
                                    value={formData.clienteId}
                                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                                    required
                                >
                                    <option value="">Seleziona un cliente</option>
                                    {clienti.map(cli => (
                                        <option key={cli.ClienteID} value={cli.ClienteID}>
                                            {cli.Nominativo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <span className="form-icon">📅</span>
                                        Data Ritiro
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dataRitiro}
                                        onChange={(e) => setFormData({ ...formData, dataRitiro: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="form-icon">📅</span>
                                        Data Consegna
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dataConsegna}
                                        onChange={(e) => setFormData({ ...formData, dataConsegna: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <span className="form-icon">📊</span>
                                        Stato *
                                    </label>
                                    <select
                                        value={formData.stato}
                                        onChange={(e) => setFormData({ ...formData, stato: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleziona uno stato</option>
                                        {STATI_CONSEGNA.map(stato => (
                                            <option key={stato} value={stato}>
                                                {stato}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="form-icon">🔑</span>
                                        Chiave Consegna *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.chiaveConsegna}
                                        onChange={(e) => setFormData({ ...formData, chiaveConsegna: e.target.value })}
                                        placeholder="Es: ABC123XYZ"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    ✖ Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    ✓ {editMode ? 'Salva Modifiche' : 'Crea Consegna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consegne;

