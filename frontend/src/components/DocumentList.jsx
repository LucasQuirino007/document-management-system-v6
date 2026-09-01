import DownloadButton from './DownloadButton';

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default function DocumentList({ documents, owner }) {
  if (documents.length === 0) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
        Nenhum documento enviado ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Nome</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Tamanho</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Enviado em</th>
            <th className="px-4 py-2 text-left font-medium text-slate-600">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-800">{doc.originalName}</td>
              <td className="px-4 py-2 text-slate-600">{formatFileSize(doc.size)}</td>
              <td className="px-4 py-2 text-slate-600">
                {new Date(doc.uploadedAt).toLocaleString('pt-BR')}
              </td>
              <td className="px-4 py-2">
                <DownloadButton doc={doc} owner={owner} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
