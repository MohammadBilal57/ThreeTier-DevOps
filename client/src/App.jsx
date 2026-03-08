import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import { useTaskStats } from './hooks/useTasks'

export default function App() {
  const [search, setSearch] = useState('')
  const [modalTrigger, setModalTrigger] = useState(0)
  const { data: stats } = useTaskStats()

  const triggerNewTask = () => setModalTrigger(t => t + 1)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar stats={stats} />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header
          stats={stats}
          search={search}
          onSearch={setSearch}
          onNewTask={triggerNewTask}
        />
        <div className="flex-1 overflow-y-auto">
          <Dashboard
            key={modalTrigger}
            search={search}
            autoOpenModal={modalTrigger > 0}
          />
        </div>
      </div>
    </div>
  )
}