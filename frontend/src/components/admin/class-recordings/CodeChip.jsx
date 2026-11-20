'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { copyText } from '@/class-recordings/utils';
import styles from './classRecordings.module.css';

const CHECK_MS = 1600;

// The recording code in monospace, with a copy button that turns into a tick for a moment.
export default function CodeChip({ code, onCopied }) {
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(event) {
    event.stopPropagation();
    if (!(await copyText(code))) return;
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), CHECK_MS);
    onCopied?.();
  }

  return (
    <span className={styles.codeChip}>
      <span>{code}</span>
      <button
        type="button"
        className={done ? `${styles.copyBtn} ${styles.copyBtnDone}` : styles.copyBtn}
        aria-label={done ? 'Code copied' : `Copy code ${code}`}
        onClick={copy}
      >
        <Icon name={done ? 'check' : 'content_copy'} size={16} weight={done ? 700 : 400} />
      </button>
    </span>
  );
}
