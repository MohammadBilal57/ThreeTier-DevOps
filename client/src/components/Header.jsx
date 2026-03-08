import { motion } from 'framer-motion'
import { Search, Plus, Bell, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/8 cursor-default select-none"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/40 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-display font-semibold text-white leading-none">{value}</p>
      </div>
    </motion.div>
  )
}

export default function Header({ stats, search, onSearch, onNewTask }) {
  const todo = stats?.byStatus?.todo ?? 0
  const inProgress = stats?.byStatus?.['in-progress'] ?? 0
  const done = stats?.byStatus?.done ?? 0

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-20 border-b border-white/6 px-8 py-4"
      style={{ background: 'rgba(5,7,15,0.85)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Title */}
        <div className="shrink-0">
          <h1 className="font-display font-bold text-2xl text-white tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-xs text-white/30 mt-1 font-body">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats pills */}
        <div className="hidden md:flex items-center gap-2">
          <StatPill icon={TrendingUp} label="To Do" value={todo} color="#3D8BFF" />
          <StatPill icon={Clock} label="In Progress" value={inProgress} color="#FF6B35" />
          <StatPill icon={CheckCircle2} label="Done" value={done} color="#00E5CC" />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={e => onSearch(e.target.value)}
              className="input-base pl-9 h-9 w-52 text-sm"
            />
          </div>

          {/* Bell */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-colors"
          >
            <Bell size={16} />
          </motion.button>

          {/* New Task */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onNewTask}
            className="btn-primary h-9"
          >
            <Plus size={16} />
            New Task
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}