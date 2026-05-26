"use client"

import { useState, useCallback } from "react"
import {
  createPackage, updatePackage, deletePackage,
  createChannel, updateChannel, deleteChannel,
  createEvent, updateEvent, deleteEvent,
  updateAppSystem,
} from "@/lib/services/mutations"
import type { AppSystemType } from "@/types/database"

function useMutation<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (...args: Parameters<T>) => {
    setIsLoading(true)
    setError(null)
    try {
      await fn(...args)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Operation failed"
      setError(message)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [fn])

  return { mutate, isLoading, error, reset: () => setError(null) }
}

export function useCreatePackage() { return useMutation(createPackage) }
export function useUpdatePackage() { return useMutation(updatePackage) }
export function useDeletePackage() { return useMutation(deletePackage) }

export function useCreateChannel() { return useMutation(createChannel) }
export function useUpdateChannel() { return useMutation(updateChannel) }
export function useDeleteChannel() { return useMutation(deleteChannel) }

export function useCreateEvent() { return useMutation(createEvent) }
export function useUpdateEvent() { return useMutation(updateEvent) }
export function useDeleteLiveEvent() { return useMutation(deleteEvent) }

export function useUpdateAppSystem() { return useMutation(updateAppSystem) }
