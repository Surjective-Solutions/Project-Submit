'use client';

const checks = [
  { label: '8+ chars', test: (v) => v.length >= 8 },
  { label: 'Uppercase', test: (v) => /[A-Z]/.test(v) },
  { label: 'Number', test: (v) => /\d/.test(v) },
  { label: 'Special char', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function getStrength(value) {
  if (!value) return 0;
  return checks.filter((c) => c.test(value)).length;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function PasswordStrength({ value = '' }) {
  const score = getStrength(value);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < score ? strengthColors[score] : '#e2e8f0',
            }}
          />
        ))}
      </div>
      {value && (
        <p className="text-xs" style={{ color: strengthColors[score] }}>
          {strengthLabels[score]}
        </p>
      )}
    </div>
  );
}
