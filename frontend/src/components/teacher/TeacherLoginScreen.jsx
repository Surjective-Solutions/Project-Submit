'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import TeacherLoginForm from './TeacherLoginForm';
import s from './teacherLogin.module.css';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

export const LOGIN_VIDEO = '/videos/syzygy-logo.mp4';
export const LOGIN_POSTER = '/videos/syzygy-logo-poster.jpg';

// The teacher sign-in page: a navy brand panel with the Syzygy logo animation, and the form. The animation is only
// loaded on screens wide enough to show it, and is left as a still image when the visitor prefers reduced motion.
export default function TeacherLoginScreen() {
  const [showVideo, setShowVideo] = useState(false);
  const [still, setStill] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 769px)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setShowVideo(wide.matches);
      setStill(calm.matches);
    };
    update();
    wide.addEventListener?.('change', update);
    calm.addEventListener?.('change', update);
    return () => {
      wide.removeEventListener?.('change', update);
      calm.removeEventListener?.('change', update);
    };
  }, []);

  useEffect(() => {
    if (still) videoRef.current?.pause?.();
  }, [still, showVideo]);

  return (
    <div className={`${font.className} ${s.root}`}>
      <header className={s.mobileHeader}>
        <span className={s.wordmark}>SyZyGy</span>
        <span className={s.pill}>Teacher</span>
      </header>

      <aside className={s.brand}>
        <div
          className={s.video}
          data-testid="login-video-box"
          style={{ backgroundImage: `url(${LOGIN_POSTER})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
          {showVideo && (
            <video
              ref={videoRef}
              src={LOGIN_VIDEO}
              poster={LOGIN_POSTER}
              autoPlay={!still}
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Syzygy logo animation"
            />
          )}
        </div>
        <div className={s.welcome}>
          <h2 className={s.welcomeTitle}>Welcome back, teacher.</h2>
          <p className={s.welcomeText}>
            Manage your classes and weekly sessions, track attendance, publish notices and keep up with every student —
            online or at the hall.
          </p>
        </div>
      </aside>

      <main className={s.formSide}>
        <div className={s.portalRow}>
          <span className={s.pill}>Teacher portal</span>
        </div>
        <div className={s.formWrap}>
          <TeacherLoginForm />
        </div>
      </main>
    </div>
  );
}
