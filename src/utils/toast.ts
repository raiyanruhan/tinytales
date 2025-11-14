import { toast as sonnerToast, ToastOptions } from 'sonner'

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.success(message, {
      ...options,
      duration: 2000,
      closeButton: true,
      onMouseEnter: () => sonnerToast.dismiss(toastId),
    })
    return toastId
  },
  error: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.error(message, {
      ...options,
      duration: 2000,
      closeButton: true,
      onMouseEnter: () => sonnerToast.dismiss(toastId),
    })
    return toastId
  },
  info: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.info(message, {
      ...options,
      duration: 2000,
      closeButton: true,
      onMouseEnter: () => sonnerToast.dismiss(toastId),
    })
    return toastId
  },
  warning: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast.warning(message, {
      ...options,
      duration: 2000,
      closeButton: true,
      onMouseEnter: () => sonnerToast.dismiss(toastId),
    })
    return toastId
  },
  message: (message: string, options?: ToastOptions) => {
    const toastId = sonnerToast(message, {
      ...options,
      duration: 2000,
      closeButton: true,
      onMouseEnter: () => sonnerToast.dismiss(toastId),
    })
    return toastId
  },
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
}

