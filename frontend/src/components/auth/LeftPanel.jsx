import { BookOpen, Check } from 'lucide-react';

/**
 * @param {{ headline: string, bullets: string[], institutions: string[] }} props
 */
export default function LeftPanel({ headline, bullets, institutions, backgroundImage }) {
  return (
    <div
      className="w-full h-full flex flex-col p-8 lg:p-14 bg-cover bg-no-repeat"
      style={{
        backgroundColor: '#053A34',
        ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundPosition: 'center bottom' } : {}),
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">SubmitX</span>
        </div>

        <div className="w-px h-6" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

        <img src="/images/syzygy-logo.png" alt="SyZyGy" className="h-7.5 w-auto" />
      </div>

      {/* Middle */}
      <div className="flex-1 flex flex-col justify-center pb-32 mt-16 lg:mt-0">
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
    </div>
  );
}
