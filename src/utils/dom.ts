/**
 * Robustly disables or enables a button (or button wrapper element)
 * by syncing standard HTML, ARIA, and Starwind UI custom attributes.
 */
export function setButtonDisabled(btnEl: HTMLElement, disabled: boolean) {
  btnEl.toggleAttribute("disabled", disabled);
  btnEl.toggleAttribute("data-disabled", disabled);
  btnEl.setAttribute("aria-disabled", String(disabled));
  
  const inner = btnEl.querySelector("button");
  if (inner) {
    inner.toggleAttribute("disabled", disabled);
    inner.toggleAttribute("data-disabled", disabled);
  }
}
