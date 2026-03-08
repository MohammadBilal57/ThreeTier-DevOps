import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import clsx from 'clsx'

const COLUMN_CONFIG = {
  'todo': {
    label: 'To Do',
    accent: '#3D8BFF',
    glow: 'rgba(61,139,255,0.15)',
    dot: 'bg-neon-blue',
    emptyText: 'No tasks queued',
  },
  'in-progress': {
    label: 'In Progress',
    accent: '#FF6B35',
    glow: 'rgba(255,107,53,0.15)',
    dot: 'bg-neon-orange',
    emptyText: 'Nothing in progress',
  },
  'done': {
    label: 'Done',
    accent: '#00E5CC',
    glow: 'rgba(0,229,204,0.15)',
    dot: 'bg-neon-cyan',
    emptyText: 'Complete some tasks!',
  },
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 border border-white/6 space-y-3">
      <div className="skeleton h-4 rounded-lg w-3/4" />
      <div className="skeleton h-3 rounded-lg w-full" />
      <div className="skeleton h-3 rounded-lg w-1/2" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-5 rounded-full w-16" />
        <div className="skeleton h-5 rounded-full w-12" />
      </div>
    </div>
  )
}

export default function KanbanColumn({ status, tasks, loading, onNewTask, onEdit, onDelete, onStatusChange }) {
  const cfg = COLUMN_CONFIG[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col min-h-0 rounded-2xl border border-white/8 overflow-hidden"
      style={{ background: 'rgba(13,18,32,0.6)', backdropFilter: 'blur(8px)' }}
    >
      {/* Column header */}
      <div
        className="px-4 py-4 border-b border-white/8 flex items-center justify-between shrink-0"
        style={{ background: `linear-gradient(180deg, ${cfg.glow} 0%, transparent 100%)` }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: cfg.accent, boxShadow: `0 0 8px ${cfg.accent}` }}
          />
          <span className="font-display font-600 text-sm text-white">{cfg.label}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium font-mono"
            style={{
              background: `${cfg.accent}18`,
              color: cfg.accent,
              border: `1px solid ${cfg.accent}30`,
            }}
          >
            {loading ? '…' : tasks.length}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
          onClick={() => onNewTask(status)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white
                     hover:bg-white/8 transition-colors"
        >
          <Plus size={15} />
        </motion.button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
        {loading ? (
          [1, 2].map(i => <SkeletonCard key={i} />)
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: `${cfg.accent}10`, border: `1px solid ${cfg.accent}20` }}
            >
              <span className="text-xl">
                {status === 'todo' ? '📋' : status === 'in-progress' ? '⚡' : '✅'}
              </span>
            </div>
            <p className="text-xs text-white/25 font-medium">{cfg.emptyText}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <TaskCard
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}