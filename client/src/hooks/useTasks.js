import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/tasks'
import toast from 'react-hot-toast'

export const TASKS_KEY = ['tasks']
export const STATS_KEY = ['tasks', 'stats']

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: [...TASKS_KEY, filters],
    queryFn: () => tasksApi.getAll(filters),
  })
}

export function useTaskStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: tasksApi.getStats,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      toast.success('Task created!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create task'),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      toast.success('Task updated!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update task'),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY })
      toast.success('Task deleted')
    },
    onError: () => toast.error('Failed to delete task'),
  })
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: tasksApi.getHealth,
    refetchInterval: 10_000, // Poll every 10s
  })
}