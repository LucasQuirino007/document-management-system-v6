import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi';

export default function DownloadButton({ doc, owner }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleClick() {
    setIsDownloading(true);
    setErrorMessage('');

    try {
      await downloadDocument(doc.id, owner, doc.originalName);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDownloading}
        className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {errorMessage && (
        <span role="alert" className="text-sm text-red-700">
          {errorMessage}
        </span>
      )}
    </span>
  );
}
