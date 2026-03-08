import { motion } from 'framer-motion'
import { LayoutDashboard, CheckSquare, BarChart3, Settings, Zap, Database, Server } from 'lucide-react'
import clsx from 'clsx'
import { useHealth } from '../hooks/useTasks'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: CheckSquare, label: 'All Tasks' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
]

export default function Sidebar({ stats }) {
  const { data: health } = useHealth()
  const done = stats?.byStatus?.done ?? 0
  const total = stats?.total ?? 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-64 shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/6"
      style={{ background: 'rgba(8,12,20,0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00E5CC, #3D8BFF)', boxShadow: '0 0 20px rgba(0,229,204,0.35)' }}>
            <Zap size={18} className="text-base-950" fill="currentColor" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white">TaskOS</span>
            <p className="text-xs text-white/30 font-body">Command Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
              item.active
                ? 'text-white font-medium'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            )}
            style={item.active ? {
              background: 'linear-gradient(135deg, rgba(0,229,204,0.12), rgba(61,139,255,0.08))',
              border: '1px solid rgba(0,229,204,0.18)',
            } : {}}
          >
            <item.icon size={17} className={item.active ? 'text-neon-cyan' : ''} />
            {item.label}
          </motion.button>
        ))}
      </nav>

      {/* Progress card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-3 mb-4 p-4 rounded-2xl border border-white/8"
        style={{ background: 'rgba(0,229,204,0.04)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Completion</span>
          <span className="text-sm font-display font-semibold text-gradient-cyan">{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00E5CC, #3D8BFF)' }}
          />
        </div>
        <p className="text-xs text-white/30 mt-2.5">{done} of {total} tasks completed</p>
      </motion.div>

      {/* Infrastructure Status */}
      <div className="px-6 py-4 border-t border-white/6 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className={clsx("w-1.5 h-1.5 rounded-full", health ? "bg-emerald-400" : "bg-red-400")} />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">System Health</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Server size={10} className="text-white/30" />
              <span className="text-[9px] text-white/30 font-medium uppercase">API</span>
            </div>
            <span className={clsx("text-[10px] font-bold", health ? "text-emerald-400" : "text-red-400")}>
              {health ? "Online" : "Offline"}
            </span>
          </div>

          <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Database size={10} className="text-white/30" />
              <span className="text-[9px] text-white/30 font-medium uppercase">DB</span>
            </div>
            <span className={clsx("text-[10px] font-bold", health?.database === 'connected' ? "text-emerald-400" : "text-red-400")}>
              {health?.database === 'connected' ? "Connected" : "No Link"}
            </span>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}