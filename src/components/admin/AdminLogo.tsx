export function AdminLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <img src="/logo.png" alt="" style={{ height: 48, width: 'auto' }} />
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: '-0.02em',
          color: '#0e326c',
          textTransform: 'uppercase',
        }}
      >
        The Logiphiles
      </span>
    </div>
  )
}
