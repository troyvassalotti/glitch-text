/**
 * @component glitch-text
 * @summary Give any string of text a glitchy effect.
 *
 * @attribute {string} [data-text] - What text should be displayed as glitched. Defaults to the `innerText` of the element.
 *
 * @link https://codepen.io/lbebber/pen/nqwBKK
 */
export default class extends HTMLElement {
  /** HTML Node Name */
  static tagName = "glitch-text";

  /** Unique ID that allows variations in the type of animation when using multiple instances of this component on a page by associating each component with their own CSS keyframes. */
  #uuid = "";

  /** Text to be rendered as glitch. */
  #glitchText = "";

  /**
   * Random number generator.
   * @param {number} [min] - Minimum number in the return range. Default: 1.
   * @param {number} [max] - Maximum number in the return range. Default: 100.
   * @returns {number} Random number in the given range. Default: between 1 - 100.
   */
  createRandomNumber(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Creates a string of CSS `clip` rules used in the `@keyframes` animations.
   * @param {number} [steps] - Total increments of the animation frame.
   * @param {number} [min] - Minimum value in the random number range.
   * @param {number} [max] - Maximum value in the random number range.
   * @returns {string} CSS rules for use in the `@keyframes` rules.
   */
  generateNoiseAnimation(steps = 20, min = 1, max = 100) {
    let clips = "";

    for (let x = 0; x <= steps + 1; x++) {
      clips += `
        ${x * (1 / steps) * 100}% {
          clip: rect(${this.createRandomNumber(
            min,
            max,
          )}px, 9999px, ${this.createRandomNumber(min, max)}px, 0);
        }
      `;
    }

    return clips;
  }

  /** Creates the unique stylesheet for this component and adopts them in the document. */
  adoptStyles() {
    if (!("replaceSync" in CSSStyleSheet.prototype)) {
      return;
    }

    let sheet = new CSSStyleSheet();
    sheet.replaceSync(this.styles);
    document.adoptedStyleSheets.push(sheet);
  }

  get uuid() {
    return this.#uuid;
  }

  set uuid(value) {
    this.#uuid = value;
    this.setAttribute("uuid", this.#uuid);
  }

  get glitchText() {
    return this.#glitchText;
  }

  set glitchText(value) {
    this.#glitchText = value;

    if (this.dataset.text !== value) {
      this.dataset.text = this.#glitchText;
    }
  }

  get styles() {
    return `
      @media (prefers-reduced-motion: no-preference) {
        glitch-text[uuid="${this.uuid}"] {
          display: inline-block;
          position: relative;
          text-wrap: balance;
        }

        glitch-text[uuid="${this.uuid}"]::after,
        glitch-text[uuid="${this.uuid}"]::before {
          animation: var(--glitch-anim-name) var(--glitch-anim-delay)
            var(--glitch-anim-timing, linear) var(--glitch-anim-count, infinite)
            var(--glitch-anim-dir, alternate-reverse);
          background-color: var(--glitch-backdrop, inherit);
          clip: var(--glitch-clip);
          color: var(--glitch-text, inherit);
          content: attr(data-text);
          inset-block-start: 0;
          inset-inline-start: var(--glitch-position);
          overflow: hidden;
          position: absolute;
          text-shadow: var(--glitch-shadow);
        }

        glitch-text[uuid="${this.uuid}"]::after {
          --glitch-anim-delay: 2s;
          --glitch-anim-name: noise-anim-after-${this.uuid};
          --glitch-clip: rect(0, 900px, 0, 0);
          --glitch-position: 0px;
          --glitch-shadow: -1px 0 var(--glitch-shadow-color);
          --glitch-shadow-color: red;
        }

        glitch-text[uuid="${this.uuid}"]::before {
          --glitch-anim-delay: 3s;
          --glitch-anim-name: noise-anim-before-${this.uuid};
          --glitch-clip: rect(0, 900px, 0, 0);
          --glitch-position: -2px;
          --glitch-shadow: 1px 0 var(--glitch-shadow-color);
          --glitch-shadow-color: blue;
        }

        @keyframes noise-anim-after-${this.uuid} {
          ${this.generateNoiseAnimation()}
        }

        @keyframes noise-anim-before-${this.uuid} {
          ${this.generateNoiseAnimation()}
        }
      }
    `;
  }

  connectedCallback() {
    this.uuid = self.crypto.randomUUID();
    this.glitchText = this.dataset.text || this.innerText.trim();

    this.adoptStyles();
  }

  static {
    window.customElements.define(this.tagName, this);
  }
}
