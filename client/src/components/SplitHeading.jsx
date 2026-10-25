/**
 * Section heading whose words rise from behind individual masks,
 * staggered left to right. Triggered by the app-wide reveal observer
 * (adds `is-revealed` to `.reveal-mask` roots).
 */
export default function SplitHeading({ children, className = "", baseDelay = 0 }) {
  const words = String(children).split(" ").filter(Boolean);
  return (
    <h2 className={`split-heading reveal-mask ${className}`.trim()}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="split-heading__word" style={{ "--word-i": index, "--word-base": `${baseDelay}ms` }}>
            <span className="split-heading__word-inner">{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </h2>
  );
}
