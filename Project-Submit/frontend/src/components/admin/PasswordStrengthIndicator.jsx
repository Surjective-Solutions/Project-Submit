'use client';

const checks = [
  { test: (v) => v.length >= 8 },
  { test: (v) => /[A-Z]/.test(v) },
  { test: (v) => /\d/.test(v) },
  { test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

function getScore(value) {
  if (!value) return 0;
  return checks.filter((c) => c.test(value)).length;
}

export default function PasswordStrengthIndicator({ value = '' }) {
  const score = getScore(value);
  if (!value) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < score ? colors[score] : '#e2e8f0' }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] }}>
        {labels[score]}
      </p>
    </div>
  );
}
