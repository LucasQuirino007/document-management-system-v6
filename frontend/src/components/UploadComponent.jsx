import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ owner, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0] || null);
    setErrorMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const document = await uploadDocument(selectedFile, owner);
      event.target.reset();
      setSelectedFile(null);
      onUploadSuccess(document);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enviar documento</h2>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar'}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </form>
  );
}
