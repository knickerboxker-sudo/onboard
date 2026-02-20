export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      aria-label="Loading..."
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--color-rule)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
