export function AnimatedBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(-45deg, #eef2ff, #e0f2fe, #f0fdf4, #fdf4ff)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 12s ease infinite',
      }}
    />
  );
}
