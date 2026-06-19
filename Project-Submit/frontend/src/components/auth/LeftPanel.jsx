import { BookOpen, Users, Check } from 'lucide-react';

/**
 * @param {{ headline: string, bullets: string[], institutions: string[] }} props
 */
export default function LeftPanel({ headline, bullets, institutions }) {
  return (
    <div
      className="w-full min-h-screen flex flex-col p-8 lg:p-14"
      style={{ backgroundColor: '#053A34' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">SubmitX</span>
      </div>

      {/* Middle */}
      <div className="flex-1 flex flex-col justify-center mt-16 lg:mt-0">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Built for Education
        </p>

        <h2
          className="text-3xl xl:text-4xl font-bold leading-snug mb-10"
          style={{ color: '#ffffff' }}
        >
          {headline}
        </h2>

        <ul className="space-y-5">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Check className="w-3 h-3 text-white" />
              </span>
              <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Trusted by leading institutions
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {institutions.map((name) => (
            <span
              key={name}
              className="rounded-full px-3 py-1 text-xs"
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
