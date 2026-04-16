/**
 * Scroll the input's parent section into view after iOS keyboard dismisses.
 * Finds the nearest section/collapsible ancestor and scrolls it to just below
 * the fixed header so content isn't hidden behind sticky elements.
 */
export function scrollToSectionAfterKeyboardDismiss(input: HTMLElement | null) {
  if (!input) return;

  const scrollTarget =
    input.closest("[id]") ??
    input.closest("section") ??
    input.parentElement;

  if (!scrollTarget) return;

  setTimeout(() => {
    const headerH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--fixed-header-h") || "0"
    );
    const rect = scrollTarget.getBoundingClientRect();

    if (rect.top < headerH + 8) {
      window.scrollTo({
        top: window.scrollY + rect.top - headerH - 8,
        behavior: "smooth",
      });
    }
  }, 350);
}
