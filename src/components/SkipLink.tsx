// Keyboard "skip to main content" link. Visually hidden until focused, then
// appears at the top so keyboard/screen-reader users can bypass the header nav.
// Styling lives in globals.css (.skip-link). Target is <main id="content">.
export default function SkipLink() {
  return (
    <a href="#content" className="skip-link">
      דלג לתוכן הראשי
    </a>
  );
}
