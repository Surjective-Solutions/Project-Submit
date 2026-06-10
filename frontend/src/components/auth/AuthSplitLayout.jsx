import LeftPanel from './LeftPanel';

const STUDENT_INSTITUTIONS = ['BrightPath', 'EduCore', 'LearnHub', 'SkillBridge'];

/**
 * @param {{
 *   leftConfig: { headline: string, bullets: string[], institutions?: string[] },
 *   children: React.ReactNode,
 *   tenantName?: string,
 *   tenantDomain?: string,
 * }} props
 */
export default function AuthSplitLayout({
  leftConfig,
  children,
  tenantName = 'SubmitX',
  tenantDomain = 'submitx.app',
}) {
  const institutions = leftConfig.institutions ?? STUDENT_INSTITUTIONS;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel — hidden on mobile */}
      <div className="hidden md:flex md:w-[42%] lg:w-[45%] shrink-0">
        <LeftPanel
          headline={leftConfig.headline}
          bullets={leftConfig.bullets}
          institutions={institutions}
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-white min-h-screen">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[440px]">
            {/* Tenant badge */}
            <div className="mb-7 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {tenantName}
                <span className="text-gray-300">/</span>
                {tenantDomain}
              </span>
            </div>

            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="py-5 text-center">
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} SubmitX. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
