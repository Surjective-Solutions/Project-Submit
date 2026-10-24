'use client';

import Icon from '@/components/admin/Icon';
import base from './study-packs.module.css';
import s from './add-recordings.module.css';

// Recording code field: tag icon, monospace input, an inner Paste chip and the Find button.
// state: 'idle' | 'found' | 'invalid' (decides the border colour)
export default function RecordingCodeInput({
  value,
  onChange,
  onSubmit,
  onPasteText,
  onPasteClick,
  state,
  looking,
  pasteHint,
  inputRef,
}) {
  const groupClass =
    state === 'found'
      ? `${s.codeGroup} ${s.codeFound}`
      : state === 'invalid'
        ? `${s.codeGroup} ${s.codeInvalid}`
        : s.codeGroup;

  return (
    <div className={base.field}>
      <label htmlFor="rec-code" className={base.label}>
        Recording code<span className={base.req}> *</span>
      </label>

      <form
        className={s.codeRow}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className={groupClass}>
          <Icon name="tag" size={19} style={{ color: 'var(--syz-muted, #5b6178)', flexShrink: 0 }} />
          <input
            id="rec-code"
            ref={inputRef}
            type="text"
            className={s.codeInput}
            value={value}
            placeholder="e.g. REC-PHY-0614-K7"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={state === 'invalid' ? 'true' : undefined}
            onChange={(e) => onChange(e.target.value)}
            onPaste={(e) => {
              const text = e.clipboardData?.getData('text');
              if (!text) return;
              e.preventDefault();
              onPasteText(text);
            }}
          />
          <button type="button" className={s.pasteChip} onClick={onPasteClick}>
            <Icon name="content_paste" size={15} weight={600} />
            Paste
          </button>
        </div>

        <button type="submit" className={s.findButton} disabled={looking}>
          <Icon name="search" size={19} weight={600} />
          {looking ? 'Finding…' : 'Find recording'}
        </button>
      </form>

      <p className={s.helpLine}>
        <Icon name="info" size={16} />
        Class Recordings → open a recording → Copy code
      </p>

      {pasteHint ? (
        <p className={s.pasteHint} role="status">
          Your browser blocked the Paste button. Click in the code box and press Ctrl+V.
        </p>
      ) : null}
    </div>
  );
}
