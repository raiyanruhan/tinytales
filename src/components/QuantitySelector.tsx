type Props = {
  value: number
  onChange: (n: number) => void
}

export default function QuantitySelector({ value, onChange }: Props) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 999, boxShadow: 'var(--shadow-sm)', padding: '6px 10px' }}>
      <button aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))} style={btn}>−</button>
      <span style={{ minWidth: 20, textAlign: 'center' }}>{value}</span>
      <button aria-label="Increase quantity" onClick={() => onChange(value + 1)} style={btn}>+</button>
    </div>
  )
}

const btn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 16,
  border: 'none',
  background: 'var(--mint)',
  color: '#fff',
  cursor: 'pointer'
}


