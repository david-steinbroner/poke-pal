/** iOS-safe copy to clipboard. Works on HTTP and HTTPS. */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: textarea + execCommand (works on iOS HTTP)
  const textarea = document.createElement("textarea");
  textarea.value = text;
  // Must be "visible" to iOS rendering engine — clipped but not hidden
  Object.assign(textarea.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
    fontSize: "16px",
  });
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.setSelectionRange(0, text.length);
  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    // execCommand not supported — fall through
  }
  document.body.removeChild(textarea);
  if (success) return true;

  // Method 2: clipboard API (HTTPS only)
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // clipboard API failed — fall through
    }
  }

  return false;
}
