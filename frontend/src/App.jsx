import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentsApi';

export default function App() {
  const [owner, setOwner] = useState('');
  const [documents, setDocuments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const refreshDocuments = useCallback(async (currentOwner) => {
    if (!currentOwner) {
      setDocuments([]);
      return;
    }

    try {
      setDocuments(await listDocuments(currentOwner));
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, []);

  useEffect(() => {
    refreshDocuments(owner);
  }, [owner, refreshDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <label htmlFor="owner-input">Usuário</label>{' '}
      <input
        id="owner-input"
        type="text"
        value={owner}
        onChange={(event) => setOwner(event.target.value)}
        placeholder="Informe seu identificador de usuário"
      />

      {owner ? (
        <>
          <UploadComponent owner={owner} onUploadSuccess={() => refreshDocuments(owner)} />
          {errorMessage && <p role="alert">{errorMessage}</p>}
          <DocumentList documents={documents} owner={owner} />
        </>
      ) : (
        <p>Informe um usuário para enviar e listar documentos.</p>
      )}
    </main>
  );
}
