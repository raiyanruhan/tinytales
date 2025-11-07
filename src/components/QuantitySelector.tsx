type Props = {
  value: number
  onChange: (n: number) => void
}

export default function QuantitySelector({ value, onChange }: Props) {
  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 8, 
      background: 'var(--white)', 
      borderRadius: 50, 
      boxShadow: '0 var(--shadow-depth) 0 0 var(--shadow-color), 0 2px 10px rgba(0, 0, 0, 0.08)', 
      padding: '8px 12px' 
    }}>
      <button 
        aria-label="Decrease quantity" 
        onClick={() => onChange(Math.max(1, value - 1))} 
        className="btn-3d-small"
      >
        −
      </button>
      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{value}</span>
      <button 
        aria-label="Increase quantity" 
        onClick={() => onChange(value + 1)} 
        className="btn-3d-small"
      >
        +
      </button>
    </div>
  )
}
