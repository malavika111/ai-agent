'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { UploadCloud, File, Trash2, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { PageEntrance } from '@/components/ui/PremiumVisualEnhancements'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface DocumentItem {
  id: string
  name: string
  type: string
  created_at: string
}

export default function DocumentsPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<{ name: string; success: boolean; error?: string }[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setLoading(false)
        return
      }

      const { data, error: fetchErr } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) {
        // Detailed error logging
        console.error('Fetch documents error detailed:', {
          message: fetchErr.message,
          hint: fetchErr.hint,
          details: fetchErr.details,
          code: fetchErr.code
        })
        setError(fetchErr.message || 'Failed to load documents')
        return
      }

      setDocuments(data || [])
    } catch (err: any) {
      console.error('Fetch catch error:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploadResults([])
    setUploading(true)

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(f => f.type === 'application/pdf' || f.type === 'text/plain')
    const invalidCount = fileArray.length - validFiles.length

    if (invalidCount > 0) {
      setError(`${invalidCount} file(s) ignored. PDF/TXT only.`)
    }

    if (validFiles.length === 0) {
      setUploading(false)
      return
    }

    const results: typeof uploadResults = []
    const formData = new FormData()
    validFiles.forEach(file => formData.append('files', file))

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok && res.status !== 207) {
        setError(data.error || 'Upload failed')
        setUploading(false)
        return
      }

      setUploadResults(data.results || [])
      
      // Auto-redirect after successful upload (if all succeeded)
      const firstSucceeded = data.results?.find((r: any) => r.success)
      if (data.success && firstSucceeded) {
        setTimeout(() => {
          router.push(`/dashboard/chat/doc/${firstSucceeded.documentId}`)
        }, 2000)
      }
    } catch (err: any) {
      setError('Network error: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchDocuments()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Confirm permanent deletion: "${name}"?`)) return

    const { error: delErr } = await supabase.from('documents').delete().eq('id', id)
    if (delErr) {
      setError(`Failed to delete "${name}"`)
      return
    }
    fetchDocuments()
  }

  return (
    <PageEntrance>
      <div className="p-6 md:p-10 max-w-5xl mx-auto h-full flex flex-col overflow-y-auto no-scrollbar scroll-smooth">
        <div className="mb-10">
          <h1 className="text-3xl font-[800] tracking-[-0.05em] uppercase text-foreground font-heading">Knowledge Base</h1>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 leading-relaxed font-sans">
            Upload PDFs or Text files to train your AI agent.
          </p>
        </div>

        {/* Drop Zone */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`relative border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all bg-card/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl border-foreground/5 md:border-border ${
            isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 border-dashed scale-[1.02]' : ''
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFileSelect(e.dataTransfer.files)
          }}
        >
          <div className="flex flex-col items-center justify-center pointer-events-none relative z-10">
            <motion.div 
               animate={isDragging ? { scale: 1.2, rotate: 180 } : { scale: 1, rotate: 0 }}
               className="p-6 bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] rounded-3xl mb-6 shadow-sm ring-1 ring-[var(--color-primary)]/20"
            >
              <UploadCloud size={36} />
            </motion.div>
            <h3 className="text-xl font-bold tracking-tight uppercase tracking-[-0.02em]">Drag & Drop Neural Signal</h3>
            <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em] mt-2 mb-10">Supports PDF, TXT &bull; Multiple Uploads</p>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-12 py-4 bg-[var(--color-primary)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[var(--color-primary-dark)] transition-all shadow-lg active:scale-95 pointer-events-auto btn-hover-effect disabled:opacity-30"
            >
              {uploading ? 'SYNTHESIZING...' : 'Browse Local Files'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept=".pdf,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          <AnimatePresence>
            {uploading && (
              <motion.div 
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                className="absolute inset-0 bg-background/80 rounded-[2.5rem] flex flex-col items-center justify-center z-20 border border-foreground/5 shadow-2xl"
              >
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-foreground/10 animate-spin" strokeWidth={1} />
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CheckCircle2 size={24} className="text-[var(--color-primary-dark)]" />
                  </motion.div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mt-6 font-heading">Neural Synthesis Active</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Status banners */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-3xl flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border border-red-100 dark:border-red-500/20 shadow-xl">
            <AlertCircle size={20} className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {uploadResults.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploadResults.map((r, i) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl border ${
                r.success
                  ? 'bg-green-50/50 dark:bg-green-500/10 text-green-700 border-green-100 dark:border-green-500/10'
                  : 'bg-red-50/50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/10'
              } backdrop-blur-xl`}>
                {r.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span className="flex-1 truncate">{r.name}</span>
                <span>{r.success ? 'Vectorized' : 'Handshake Failed'}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Document List */}
        <div className="mt-12 flex-1 flex flex-col bg-card/60 backdrop-blur-3xl rounded-[2.5rem] border border-border/50 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700">
          <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-heading uppercase tracking-[-0.02em]">Neural Repositories</h2>
              <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mt-1.5">Density: {documents.length} Nodes</p>
            </div>
            <File size={24} className="text-foreground/10" />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20 opacity-20 scale-150">
                <Loader2 className="w-10 h-10 animate-spin" strokeWidth={1} />
              </div>
            ) : documents.length > 0 ? (
              <ul className="divide-y divide-foreground/[0.03]">
                {documents.map((doc, i) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    key={doc.id} 
                    className="flex items-center justify-between p-6 hover:bg-foreground/[0.01] transition-all group card-hover-effect"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-12 h-12 bg-card border border-foreground/5 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <File size={22} className="text-[var(--color-primary-dark)] opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate uppercase tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{doc.type.split('/')[1]?.toUpperCase() || doc.type}</span>
                          <span className="w-1 h-1 rounded-full bg-foreground/10"></span>
                          <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-6">
                      <div className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-green-600/60 bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/5 transition-all group-hover:bg-green-500/10">
                        <CheckCircle2 size={12} /> Sync Stable
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-3 text-foreground/10 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all btn-hover-effect"
                        title="Purge Node"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-16 px-12 scale-110">
                <Database size={60} strokeWidth={0.5} className="mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Awaiting Vector Ingest</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageEntrance>
  )
}
