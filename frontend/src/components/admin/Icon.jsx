import styles from './admin-console.module.css';

// Material Symbols Rounded glyph. Decorative by default — give the parent
// control an accessible name instead of labelling the icon.
export default function Icon({ name, size = 20, fill = false, weight = 450, className, style }) {
  return (
    <span
      aria-hidden="true"
      className={className ? `${styles.icon} ${className}` : styles.icon}
      style={{
        fontSize: size,
        width: size,
        height: size,
        // Only FILL and wght (400–600) are loaded — see the font link in app/layout.js.
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
