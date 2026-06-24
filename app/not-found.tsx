export default function NotFound() {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#FFF9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 700, color: '#E91E8C', margin: 0 }}>404</h1>
          <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>Page not found.</p>
          <a href="/" style={{ color: '#E91E8C', fontWeight: 600, textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
            ← Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
