import { useState } from 'react';
import { CartItem } from '@services/cartApi';

interface CartMergeDialogProps {
  localCart: CartItem[];
  serverCart: CartItem[];
  onChoose: (useLocal: boolean) => void;
}

export default function CartMergeDialog({ localCart, serverCart, onChoose }: CartMergeDialogProps) {
  const [selected, setSelected] = useState<'local' | 'server' | null>(null);

  const handleConfirm = () => {
    if (selected === 'local') {
      onChoose(true);
    } else if (selected === 'server') {
      onChoose(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }}>
      <div className="pastel-card" style={{
        maxWidth: 500,
        width: '100%',
        padding: 32,
        position: 'relative'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Choose Your Cart</h2>
        <p style={{ color: 'var(--navy)', marginBottom: 24 }}>
          You have items in both your current cart and a saved cart. Which one would you like to use?
        </p>

        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            border: selected === 'local' ? '2px solid var(--mint)' : '1px solid var(--border-light)',
            borderRadius: 12,
            cursor: 'pointer',
            background: selected === 'local' ? 'var(--cream)' : 'white',
            transition: 'all 0.2s'
          }}>
            <input
              type="radio"
              name="cart"
              value="local"
              checked={selected === 'local'}
              onChange={() => setSelected('local')}
              style={{ marginTop: 4, cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Current Cart</div>
              <div style={{ fontSize: 14, color: 'var(--navy)', opacity: 0.8 }}>
                {localCart.length} item{localCart.length !== 1 ? 's' : ''}
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            border: selected === 'server' ? '2px solid var(--mint)' : '1px solid var(--border-light)',
            borderRadius: 12,
            cursor: 'pointer',
            background: selected === 'server' ? 'var(--cream)' : 'white',
            transition: 'all 0.2s'
          }}>
            <input
              type="radio"
              name="cart"
              value="server"
              checked={selected === 'server'}
              onChange={() => setSelected('server')}
              style={{ marginTop: 4, cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Saved Cart</div>
              <div style={{ fontSize: 14, color: 'var(--navy)', opacity: 0.8 }}>
                {serverCart.length} item{serverCart.length !== 1 ? 's' : ''}
              </div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="btn-primary"
            style={{
              flex: 1,
              opacity: selected ? 1 : 0.6,
              cursor: selected ? 'pointer' : 'not-allowed'
            }}
          >
            Use Selected Cart
          </button>
        </div>
      </div>
    </div>
  );
}

