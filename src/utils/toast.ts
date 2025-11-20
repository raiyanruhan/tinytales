import { toast as sonnerToast } from 'sonner'

type ToastOptions = Parameters<typeof sonnerToast.success>[1]

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.success(message, {
      ...options,
      duration: 3000,
      closeButton: true,
      position: 'bottom-right',
    })
    return toastId
  },
  error: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.error(message, {
      ...options,
      duration: 4000,
      closeButton: true,
      position: 'bottom-right',
    })
    return toastId
  },
  info: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.info(message, {
      ...options,
      duration: 3000,
      closeButton: true,
      position: 'bottom-right',
    })
    return toastId
  },
  warning: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.warning(message, {
      ...options,
      duration: 3000,
      closeButton: true,
      position: 'bottom-right',
    })
    return toastId
  },
  message: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast(message, {
      ...options,
      duration: 3000,
      closeButton: true,
      position: 'bottom-right',
    })
    return toastId
  },
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
  loading: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.loading(message, {
      ...options,
      position: 'bottom-right',
    })
    return toastId
  },
}

