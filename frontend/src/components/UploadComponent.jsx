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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="text-lg font-semibold text-slate-900">Enviar documento</h2>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isUploading}
        className="w-fit rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? 'Enviando...' : 'Enviar'}
      </button>
      {errorMessage && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
