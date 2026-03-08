import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Calendar, Tag, Trash2, Edit3, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { format, isAfter } from 'date-fns'
import clsx from 'clsx'

const PRIORITY_CONFIG = {
  high:   { label: 'High',   dot: 'bg-neon-red',    badge: 'badge-high',   bar: '#FF4757' },
  medium: { label: 'Medium', dot: 'bg-neon-orange',  badge: 'badge-medium', bar: '#FF6B35' },
  low:    { label: 'Low',    dot: 'bg-neon-green',   badge: 'badge-low',    bar: '#22D3A0' },
}

const STATUS_NEXT = {
  'todo': 'in-progress',
  'in-progress': 'done',
  'done': 'todo',
}
const STATUS_LABEL = {
  'todo': 'Start',
  'in-progress': 'Complete',
  'done': 'Reopen',
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate)) && task.status !== 'done'
  const isDone = task.status === 'done'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={clsx(
        'group relative rounded-2xl p-4 border transition-all duration-200 cursor-default',
        isDone
          ? 'bg-white/3 border-white/6 opacity-70'
          : 'glass-hover'
      )}
      style={!isDone ? { boxShadow: `0 2px 0 0 ${pc.bar}30` } : {}}
    >
      {/* Priority bar top */}
      {!isDone && (
        <div
          className="absolute top-0 left-4 right-4 h-px rounded-full opacity-60"
          style={{ background: `linear-gradient(90deg, ${pc.bar}, transparent)` }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Done toggle */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onStatusChange(task._id, STATUS_NEXT[task.status])}
          className="mt-0.5 shrink-0 text-white/30 hover:text-neon-cyan transition-colors"
        >
          {isDone
            ? <CheckCircle2 size={18} className="text-neon-cyan" />
            : <Circle size={18} />
          }
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={clsx(
            'font-medium text-sm leading-snug transition-colors',
            isDone ? 'line-through text-white/35' : 'text-white'
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-white/35 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="relative shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(o => !o)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/0 group-hover:text-white/40
                       hover:!text-white hover:bg-white/8 transition-all"
          >
            <MoreVertical size={14} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-white/10 overflow-hidden"
                  style={{ background: '#131929', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
                  onClick={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => onEdit(task)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/6 transition-colors"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(task._id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-neon-red/70 hover:text-neon-red hover:bg-neon-red/8 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/6">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority badge */}
          <span className={clsx('inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium', pc.badge)}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', pc.dot)} />
            {pc.label}
          </span>

          {/* Tags */}
          {task.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/6 text-white/40 border border-white/8">
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className={clsx(
            'flex items-center gap-1 text-xs',
            isOverdue ? 'text-neon-red' : 'text-white/30'
          )}>
            <Calendar size={11} />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>

      {/* Advance status button (hover) */}
      {!isDone && (
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          onClick={() => onStatusChange(task._id, STATUS_NEXT[task.status])}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                     flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium
                     transition-all duration-200 border border-white/10"
          style={{ background: '#131929', color: '#00E5CC', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
        >
          {STATUS_LABEL[task.status]} <ArrowRight size={10} />
        </motion.button>
      )}
    </motion.div>
  )
}