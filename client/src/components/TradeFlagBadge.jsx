export default function TradeFlagBadge({ flags = [] }) {
  if (!flags.length) return null;

  const config = {
    OVERPAID:  { bg: '#7f1d1d', color: '#fca5a5', label: 'Overpaid' },
    UNDERPAID: { bg: '#14532d', color: '#86efac', label: 'Underpaid' },
    EXPENSIVE: { bg: '#78350f', color: '#fcd34d', label: 'Expensive' },
    CHEAP:     { bg: '#1e3a5f', color: '#93c5fd', label: 'Cheap' },
  };

  return (
    <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {flags.map((f, i) => {
        const cfg = config[f.type] || { bg: '#374151', color: '#9ca3af', label: f.type };
        return (
          <span key={i} title={f.label} style={{
            background: cfg.bg,
            color:      cfg.color,
            fontSize:   11,
            fontWeight: 700,
            padding:    '2px 6px',
            borderRadius: 4,
            letterSpacing: '0.04em',
          }}>
            {cfg.label}
          </span>
        );
      })}
    </span>
  );
}
