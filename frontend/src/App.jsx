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
    <main className="min-h-screen bg-slate-50 px-4 py-10 font-sans text-slate-800 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Document Management System
        </h1>

        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <label htmlFor="owner-input" className="mb-1 block text-sm font-medium text-slate-700">
            Usuário
          </label>
          <input
            id="owner-input"
            type="text"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="Informe seu identificador de usuário"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {owner ? (
          <>
            <UploadComponent owner={owner} onUploadSuccess={() => refreshDocuments(owner)} />
            {errorMessage && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {errorMessage}
              </p>
            )}
            <DocumentList documents={documents} owner={owner} />
          </>
        ) : (
          <p className="text-sm text-slate-500">Informe um usuário para enviar e listar documentos.</p>
        )}
      </div>
    </main>
  );
}
