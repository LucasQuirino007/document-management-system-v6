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
    <span>
      <button type="button" onClick={handleClick} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {errorMessage && <span role="alert"> {errorMessage}</span>}
    </span>
  );
}
