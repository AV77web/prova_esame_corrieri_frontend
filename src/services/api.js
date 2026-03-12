// =================================================
// File: api.js
// Service per la gestione delle chiamate API con HttpOnly Cookie
// @author: Full Stack Senior Developer
// @version: 2.0.0 2026-01-14
// =================================================

const API_BASE_URL = import.meta.env.PROD
    ? "https://prova-esame-corrieri-backend.vercel.app"
    : "http://localhost:3000";

/**
 * Funzione di utilità per gestire le risposte delle API
 */
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Si è verificato un errore');
    }

    return data;
};

/**
 * API per il login utente
 * Il backend imposta automaticamente il cookie HttpOnly
 * @param {string} email - Email dell'utente
 * @param {string} password - Password dell'utente
 * @returns {Promise<Object>} - Dati utente e messaggio di successo
 */
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // FONDAMENTALE: invia e riceve cookie HttpOnly
        body: JSON.stringify({ email, password }),
    });

    return handleResponse(response);
};

/**
 * API per la registrazione utente
 * @param {Object} userData - Dati dell'utente da registrare
 * @param {string} userData.nome - Nome dell'utente
 * @param {string} userData.cognome - Cognome dell'utente
 * @param {string} userData.email - Email dell'utente
 * @param {string} userData.password - Password dell'utente
 * @param {string} [userData.ruolo] - Ruolo dell'utente (opzionale)
 * @returns {Promise<Object>} - Dati utente registrato
 */
export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
    });

    return handleResponse(response);
};

/**
 * API per verificare lo stato di autenticazione
 * Controlla se esiste un cookie HttpOnly valido
 * @returns {Promise<Object>} - { authenticated: boolean, user: Object }
 */
export const verifyAuth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // FONDAMENTALE: invia il cookie HttpOnly
        });

        if (!response.ok) {
            // Se la risposta è 401 o 403, l'utente non è autenticato
            if (response.status === 401 || response.status === 403) {
                return { authenticated: false, user: null };
            }
            throw new Error('Errore nella verifica dell\'autenticazione');
        }

        return handleResponse(response);
    } catch (error) {
        console.error('Errore verifica autenticazione:', error);
        return { authenticated: false, user: null };
    }
};

/**
 * API per il logout utente
 * Il backend rimuove il cookie HttpOnly
 * @returns {Promise<Object>}
 */
export const logoutUser = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // FONDAMENTALE: invia il cookie per poterlo cancellare
        });

        return handleResponse(response);
    } catch (error) {
        console.error('Errore durante il logout:', error);
        // Anche se il logout fallisce, consideriamo l'utente come logout
        return { message: 'Logout effettuato lato client' };
    }
};

// =================================================
// API PER LA GESTIONE CLIENTI (CORRIERE)
// =================================================

/**
 * Ottieni tutti i clienti
 * @returns {Promise<Object>} - Lista dei clienti
 */
export const getClienti = async () => {
    const response = await fetch(`${API_BASE_URL}/clienti`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Ottieni un singolo cliente
 * @param {number} id - ID del cliente
 * @returns {Promise<Object>} - Dettaglio del cliente
 */
export const getCliente = async (id) => {
    const response = await fetch(`${API_BASE_URL}/clienti/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Crea un nuovo cliente
 * @param {Object} clienteData
 * @param {number} clienteData.clienteId - ID del cliente
 * @param {string} clienteData.nominativo - Nominativo del cliente
 */
export const createCliente = async (clienteData) => {
    const response = await fetch(`${API_BASE_URL}/clienti`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(clienteData),
    });
    return handleResponse(response);
};

/**
 * Aggiorna un cliente esistente
 * @param {number} id - ID del cliente
 * @param {Object} clienteData
 * @param {string} clienteData.nominativo - Nuovo nominativo
 */
export const updateCliente = async (id, clienteData) => {
    const response = await fetch(`${API_BASE_URL}/clienti/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(clienteData),
    });
    return handleResponse(response);
};

/**
 * Elimina un cliente
 * @param {number} id - ID del cliente
 */
export const deleteCliente = async (id) => {
    const response = await fetch(`${API_BASE_URL}/clienti/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

// =================================================
// API PER LA GESTIONE CONSEGNE (CORRIERE)
// =================================================

/**
 * Ottieni l'elenco delle consegne con filtri opzionali
 * @param {Object} filters
 * @param {number} [filters.clienteId]
 * @param {string} [filters.stato]
 */
export const getConsegne = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.clienteId) params.append('clienteId', filters.clienteId);
    if (filters.stato) params.append('stato', filters.stato);

    const queryString = params.toString();
    const url = queryString
        ? `${API_BASE_URL}/consegne?${queryString}`
        : `${API_BASE_URL}/consegne`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Ottieni i dettagli di una singola consegna
 * @param {number} id - ID della consegna
 */
export const getConsegna = async (id) => {
    const response = await fetch(`${API_BASE_URL}/consegne/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};

/**
 * Crea una nuova consegna
 * @param {Object} consegna
 * @param {number} consegna.clienteId
 * @param {string} consegna.stato
 * @param {string} consegna.chiaveConsegna
 * @param {string} [consegna.dataRitiro]
 * @param {string} [consegna.dataConsegna]
 */
export const createConsegna = async (consegna) => {
    const response = await fetch(`${API_BASE_URL}/consegne`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(consegna),
    });
    return handleResponse(response);
};

/**
 * Aggiorna una consegna esistente
 * @param {number} id - ID della consegna
 * @param {Object} consegna - Dati aggiornati
 */
export const updateConsegna = async (id, consegna) => {
    const response = await fetch(`${API_BASE_URL}/consegne/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(consegna),
    });
    return handleResponse(response);
};

/**
 * Elimina una consegna
 * @param {number} id - ID della consegna
 */
export const deleteConsegna = async (id) => {
    const response = await fetch(`${API_BASE_URL}/consegne/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    return handleResponse(response);
};