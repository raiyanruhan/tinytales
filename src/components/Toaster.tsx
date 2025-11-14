import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      duration={2000}
      closeButton
      toastOptions={{
        duration: 2000,
        closeButton: true,
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-var(--ink) group-[.toaster]:border-var(--border-light) group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-var(--navy)',
          actionButton: 'group-[.toast]:bg-var(--mint) group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-var(--cream) group-[.toast]:text-var(--ink)',
          closeButton: 'group-[.toast]:bg-transparent group-[.toast]:text-var(--ink) group-[.toast]:hover:bg-var(--cream)',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--white)',
          '--normal-text': 'var(--ink)',
          '--normal-border': 'var(--border-light)',
          '--border-radius': 'var(--radius-md)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

