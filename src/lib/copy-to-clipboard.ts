/** iOS-safe copy to clipboard. Works on HTTP and HTTPS. */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: clipboard API (no DOM manipulation, no scroll issues)
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // clipboard API failed (likely HTTP) — fall through to textarea
    }
  }

  // Method 2: textarea + execCommand (fallback for iOS HTTP)
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  Object.assign(textarea.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "0",
    overflow: "hidden",
    border: "0",
    opacity: "0",
    fontSize: "16px",
  });

  document.body.appendChild(textarea);
  textarea.focus({ preventScroll: true });
  textarea.setSelectionRange(0, text.length);

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    // execCommand not supported
  }

  document.body.removeChild(textarea);

  // Force restore scroll — iOS may have moved it despite preventScroll
  requestAnimationFrame(() => {
    window.scrollTo(scrollX, scrollY);
  });

  return success;
}
