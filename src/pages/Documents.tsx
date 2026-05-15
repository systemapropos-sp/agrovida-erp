import { useEffect, useState } from 'react';
import { FileText, File, Trash2 } from 'lucide-react';
import { getDocuments, deleteDocument } from '@/lib/supabaseApi';
import { useUIStore } from '@/stores/uiStore';
import type { Document } from '@/types';

export default function Documents() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useUIStore();

  const load = async () => { setLoading(true); const data = await getDocuments(); setDocs(data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleDelete = async (d: Document) => {
    if (!confirm(`¿Eliminar "${d.name}"?`)) return;
    await deleteDocument(d.id);
    showToast({ type: 'success', title: 'Documento eliminado' });
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Documentos</h2>
        <p className="text-sm text-gray-400 mt-0.5">{docs.length} documentos almacenados</p>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText size={40} className="mb-3 opacity-30" />
          <p className="text-sm">No hay documentos almacenados</p>
          <p className="text-xs mt-1">Los documentos se suben desde el detalle de cada negocio</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E5E8' }}>
          {docs.map((d, i) => (
            <div key={d.id} className={`flex items-center gap-3 px-5 py-3 ${i < docs.length - 1 ? 'border-b' : ''}`} style={{ borderColor: '#F0F0F1' }}>
              <File size={16} style={{ color: '#9CA3AF' }} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                <p className="text-xs text-gray-400">{d.category} · {(d.fileSize / 1024).toFixed(0)} KB · {new Date(d.uploadedAt).toLocaleDateString('es')}</p>
              </div>
              <button onClick={() => handleDelete(d)} className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
