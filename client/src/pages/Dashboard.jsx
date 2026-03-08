import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, LayoutGrid, List, RefreshCw } from 'lucide-react'
import { useTasks, useTaskStats, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import KanbanColumn from '../components/KanbanColumn'
import TaskModal from '../components/TaskModal'
import clsx from 'clsx'

const STATUSES = ['todo', 'in-progress', 'done']
const PRIORITY_FILTERS = ['all', 'high', 'medium', 'low']

export default function Dashboard({ search }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [defaultStatus, setDefaultStatus] = useState('todo')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [view, setView] = useState('kanban') // kanban | list

  const queryParams = useMemo(() => ({
    ...(search ? { search } : {}),
    ...(priorityFilter !== 'all' ? { priority: priorityFilter } : {}),
  }), [search, priorityFilter])

  const { data: tasks = [], isLoading, refetch } = useTasks(queryParams)
  const { data: stats } = useTaskStats()

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const tasksByStatus = useMemo(() =>
    STATUSES.reduce((acc, s) => ({
      ...acc,
      [s]: tasks.filter(t => t.status === s),
    }), {}),
    [tasks]
  )

  const openNewTask = (status = 'todo') => {
    setEditTask(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  const openEditTask = (task) => {
    setEditTask(task)
    setModalOpen(true)
  }

  const handleSubmit = async (data) => {
    if (editTask) {
      await updateTask.mutateAsync({ id: editTask._id, data })
    } else {
      await createTask.mutateAsync(data)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this task?')) deleteTask.mutate(id)
  }

  const handleStatusChange = (id, status) => {
    updateTask.mutate({ id, data: { status } })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 space-y-5">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 flex-wrap"
      >
        {/* Priority filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-white/8 bg-white/3">
          <Filter size={13} className="text-white/30 ml-2" />
          {PRIORITY_FILTERS.map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize',
                priorityFilter === p
                  ? 'bg-white/12 text-white'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-white/8 bg-white/3 ml-auto">
          <button
            onClick={() => setView('kanban')}
            className={clsx('p-1.5 rounded-lg transition-all', view === 'kanban' ? 'bg-white/12 text-white' : 'text-white/30 hover:text-white')}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('list')}
            className={clsx('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-white/12 text-white' : 'text-white/30 hover:text-white')}
          >
            <List size={15} />
          </button>
        </div>

        {/* Refresh */}
        <motion.button
          whileTap={{ rotate: 360 }}
          transition={{ duration: 0.4 }}
          onClick={() => refetch()}
          className="p-2 rounded-xl border border-white/8 bg-white/3 text-white/30 hover:text-white transition-colors"
        >
          <RefreshCw size={15} />
        </motion.button>
      </motion.div>

      {/* Kanban board */}
      <AnimatePresence mode="wait">
        {view === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0"
            style={{ gridTemplateRows: '1fr' }}
          >
            {STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status] || []}
                loading={isLoading}
                onNewTask={openNewTask}
                onEdit={openEditTask}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-auto space-y-2"
          >
            {isLoading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="h-16 rounded-2xl skeleton" />
              ))
            ) : tasks.length === 0 ? (
              <div className="text-center py-20 text-white/25 text-sm">No tasks found</div>
            ) : (
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-hover rounded-2xl px-5 py-4 flex items-center gap-4"
                  >
                    <div className={clsx('w-2 h-2 rounded-full shrink-0',
                      task.status === 'todo' ? 'bg-neon-blue' :
                      task.status === 'in-progress' ? 'bg-neon-orange' : 'bg-neon-cyan'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-sm font-medium truncate', task.status === 'done' && 'line-through text-white/35')}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-white/30 truncate mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <span className={clsx('text-xs px-2 py-1 rounded-lg capitalize',
                      task.priority === 'high' ? 'badge-high' :
                      task.priority === 'medium' ? 'badge-medium' : 'badge-low'
                    )}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-white/30 capitalize hidden sm:block">
                      {task.status.replace('-', ' ')}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null) }}
        onSubmit={handleSubmit}
        initialTask={editTask}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}