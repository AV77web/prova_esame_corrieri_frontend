// =================================================
// File: Tracking.jsx
// Pagina pubblica per il tracking delle consegne
// =================================================

import { useState } from 'react';
import { getTracking } from '../../src/services/api';
import './Tracking.css';

const Tracking = () => {
    const [chiaveConsegna, setChiaveConsegna] = useState('');
    const [dataRitiro, setDataRitiro] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!chiaveConsegna || !dataRitiro) {
            setError('Inserisci chiave consegna e data di ritiro');
            return;
        }

        try {
            setLoading(true);
            const response = await getTracking(chiaveConsegna, dataRitiro);
            setResult(response.data || response);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tracking-container">
            <div className="tracking-card">
                <div className="tracking-header">
                    <div className="tracking-header-left">
                        <span className="tracking-icon">🚚</span>
                        <div>
                            <h2>Tracking Consegna</h2>
                            <p className="tracking-subtitle">
                                Inserisci la chiave di consegna e la data di ritiro per verificare lo stato della spedizione.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="tracking-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Chiave Consegna *</label>
                        <input
                            type="text"
                            value={chiaveConsegna}
                            onChange={(e) => setChiaveConsegna(e.target.value)}
                            placeholder="Es: ABC123XYZ"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Data Ritiro *</label>
                        <input
                            type="date"
                            value={dataRitiro}
                            onChange={(e) => setDataRitiro(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Ricerca in corso...' : 'Cerca'}
                    </button>
                </form>

                {result && (
                    <div className="tracking-result">
                        <h3>Esito Ricerca</h3>
                        <div className="tracking-result-grid">
                            <div className="tracking-result-item">
                                <span className="label">Cliente</span>
                                <span className="value">{result.cliente}</span>
                            </div>
                            <div className="tracking-result-item">
                                <span className="label">Chiave</span>
                                <span className="value">{result.chiaveConsegna}</span>
                            </div>
                            <div className="tracking-result-item">
                                <span className="label">Stato</span>
                                <span className="value stato-value">{result.stato}</span>
                            </div>
                            <div className="tracking-result-item">
                                <span className="label">Data Ritiro</span>
                                <span className="value">
                                    {result.dataRitiro ? new Date(result.dataRitiro).toLocaleDateString('it-IT') : '-'}
                                </span>
                            </div>
                            <div className="tracking-result-item">
                                <span className="label">Data Consegna</span>
                                <span className="value">
                                    {result.dataConsegna ? new Date(result.dataConsegna).toLocaleDateString('it-IT') : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracking;

