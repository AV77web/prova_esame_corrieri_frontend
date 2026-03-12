// =================================================
// File: Clienti.jsx
// Componente per la gestione dei clienti del corriere
// =================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import {
    getClienti,
    createCliente,
    updateCliente,
    deleteCliente
} from '../../src/services/api';
import './Clienti.css';

const Clienti = () => {
    const { user } = useAuth();
    const [clienti, setClienti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCliente, setCurrentCliente] = useState(null);
    const [formData, setFormData] = useState({
        clienteId: '',
        nominativo: ''
    });

    const canGestireClienti =
        !!user &&
        (
            user.admin === true ||
            user.Admin === true ||
            user.ruolo === 'Operatore' ||
            user.ruolo === 'Amministratore'
        );

    const loadClienti = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getClienti();
            setClienti(response.data || []);
        } catch (err) {
            console.error('[CLIENTI] Errore caricamento:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClienti();
    }, []);

    const handleOpenCreateModal = () => {
        setEditMode(false);
        setCurrentCliente(null);
        setFormData({ clienteId: '', nominativo: '' });
        setShowModal(true);
    };

    const handleOpenEditModal = (cliente) => {
        setEditMode(true);
        setCurrentCliente(cliente);
        setFormData({
            clienteId: cliente.ClienteID,
            nominativo: cliente.Nominativo
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentCliente(null);
        setFormData({ clienteId: '', nominativo: '' });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!formData.clienteId || !formData.nominativo) {
            setError('Tutti i campi sono obbligatori');
            return;
        }

        try {
            setError(null);
            await createCliente({
                clienteId: parseInt(formData.clienteId, 10),
                nominativo: formData.nominativo
            });

            handleCloseModal();
            loadClienti();
        } catch (err) {
            console.error('[CLIENTI] Errore creazione:', err);
            setError(err.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!formData.nominativo) {
            setError('Il nominativo è obbligatorio');
            return;
        }

        try {
            setError(null);
            await updateCliente(currentCliente.ClienteID, {
                nominativo: formData.nominativo
            });

            handleCloseModal();
            loadClienti();
        } catch (err) {
            console.error('[CLIENTI] Errore modifica:', err);
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
            return;
        }

        try {
            setError(null);
            await deleteCliente(id);
            loadClienti();
        } catch (err) {
            console.error('[CLIENTI] Errore eliminazione:', err);
            setError(err.message);
        }
    };

    if (!canGestireClienti) {
        return (
            <div className="categorie-container">
                <div className="access-denied">
                    <div className="access-denied-icon">🔒</div>
                    <h2>Accesso Negato</h2>
                    <p>Solo gli operatori e gli amministratori possono gestire i clienti.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="categorie-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Caricamento clienti...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="categorie-container">
            <div className="categorie-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="icon-title">👥</span>
                        <h1>Gestione Clienti</h1>
                    </div>
                    <p className="header-subtitle">
                        Crea, modifica ed elimina i clienti del corriere.
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleOpenCreateModal}
                >
                    + Nuovo Cliente
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <span className="stat-value">{clienti.length}</span>
                        <span className="stat-label">Clienti Totali</span>
                    </div>
                </div>
            </div>

            <div className="categorie-table-section">
                <div className="table-header">
                    <span className="table-icon">📄</span>
                    <h3>Elenco Clienti</h3>
                </div>

                {clienti.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📂</div>
                        <h3>Nessun cliente trovato</h3>
                        <p>Non ci sono clienti nel sistema.</p>
                        <button className="btn-primary mt-3" onClick={handleOpenCreateModal}>
                            Crea il primo cliente
                        </button>
                    </div>
                ) : (
                    <table className="categorie-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nominativo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clienti.map(cliente => (
                                <tr key={cliente.ClienteID}>
                                    <td>
                                        <span className="categoria-id">
                                            {cliente.ClienteID}
                                        </span>
                                    </td>
                                    <td className="descrizione-cell">
                                        {cliente.Nominativo}
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenEditModal(cliente)}
                                                title="Modifica Cliente"
                                            >
                                                ✏️ Modifica
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(cliente.ClienteID)}
                                                title="Elimina Cliente"
                                            >
                                                🗑️ Elimina
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <span className="modal-icon">
                                    {editMode ? '✏️' : '➕'}
                                </span>
                                {editMode ? 'Modifica Cliente' : 'Nuovo Cliente'}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                                title="Chiudi"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={editMode ? handleUpdate : handleCreate} className="categoria-form">
                            {!editMode && (
                                <div className="form-group">
                                    <label>ID Cliente *</label>
                                    <input
                                        type="number"
                                        value={formData.clienteId}
                                        onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                                        placeholder="Es: 1"
                                        required
                                        min="1"
                                    />
                                    <small className="form-hint">Inserisci un numero identificativo univoco</small>
                                </div>
                            )}

                            {editMode && (
                                <div className="form-group">
                                    <label>ID Cliente</label>
                                    <input
                                        type="text"
                                        value={formData.clienteId}
                                        disabled
                                        className="disabled-input"
                                    />
                                    <small className="form-hint">L'ID non può essere modificato</small>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Nominativo *</label>
                                <input
                                    type="text"
                                    value={formData.nominativo}
                                    onChange={(e) => setFormData({ ...formData, nominativo: e.target.value })}
                                    placeholder="Es: Mario Rossi"
                                    required
                                    maxLength="200"
                                />
                                <small className="form-hint">Inserisci il nominativo completo del cliente</small>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {editMode ? 'Salva Modifiche' : 'Crea Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clienti;

