import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Tag, AlertCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['todo', 'in-progress', 'done']

const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' }
const PRIORITY_COLORS = { low: '#22D3A0', medium: '#FF6B35', high: '#FF4757' }

function SelectButton({ value, selected, onClick, color, label }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={onClick}
      className={clsx(
        'flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-all duration-200',
        selected ? 'text-white' : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 bg-transparent'
      )}
      style={selected ? {
        background: `${color}18`,
        borderColor: `${color}45`,
        color: color,
        boxShadow: `0 0 12px ${color}20`,
      } : {}}
    >
      {label}
    </motion.button>
  )
}

export default function TaskModal({ isOpen, onClose, onSubmit, initialTask, defaultStatus = 'todo' }) {
  const isEditing = !!initialTask

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    tags: '',
    dueDate: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'todo',
        priority: initialTask.priority || 'medium',
        tags: (initialTask.tags || []).join(', '),
        dueDate: initialTask.dueDate
          ? new Date(initialTask.dueDate).toISOString().split('T')[0]
          : '',
      })
    } else {
      setForm({ title: '', description: '', status: defaultStatus, priority: 'medium', tags: '', dueDate: '' })
    }
    setError('')
  }, [initialTask, defaultStatus, isOpen])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }

    setLoading(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5),
        dueDate: form.dueDate || null,
      }
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(5,7,15,0.8)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-white/10 overflow-hidden"
              style={{
                background: '#0D1220',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
                pointerEvents: 'auto',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8"
                style={{ background: 'linear-gradient(180deg, rgba(0,229,204,0.05) 0%, transparent 100%)' }}>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    {isEditing ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-xs text-white/30 mt-0.5">
                    {isEditing ? 'Update task details' : 'Add a task to your board'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Title <span className="text-neon-red">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="What needs to be done?"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    autoFocus
                    maxLength={120}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    className="input-base resize-none"
                    placeholder="Add more context…"
                    rows={3}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    maxLength={1000}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <SelectButton
                        key={p}
                        value={p}
                        selected={form.priority === p}
                        onClick={() => set('priority', p)}
                        color={PRIORITY_COLORS[p]}
                        label={p.charAt(0).toUpperCase() + p.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {STATUSES.map(s => (
                      <SelectButton
                        key={s}
                        value={s}
                        selected={form.status === s}
                        onClick={() => set('status', s)}
                        color={s === 'todo' ? '#3D8BFF' : s === 'in-progress' ? '#FF6B35' : '#00E5CC'}
                        label={STATUS_LABELS[s]}
                      />
                    ))}
                  </div>
                </div>

                {/* Tags + Due Date row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                      <Tag size={10} className="inline mr-1" />Tags
                    </label>
                    <input
                      type="text"
                      className="input-base"
                      placeholder="design, api, bug"
                      value={form.tags}
                      onChange={e => set('tags', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                      <Calendar size={10} className="inline mr-1" />Due Date
                    </label>
                    <input
                      type="date"
                      className="input-base"
                      value={form.dueDate}
                      onChange={e => set('dueDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-neon-red text-sm bg-neon-red/8 border border-neon-red/20 px-3 py-2.5 rounded-xl"
                    >
                      <AlertCircle size={14} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center border border-white/10">
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="btn-primary flex-1 justify-center"
                  >
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> Saving…</>
                    ) : (
                      isEditing ? 'Update Task' : 'Create Task'
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}