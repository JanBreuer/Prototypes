# AI or Nay quality assurance
Run from this directory: npm install --no-package-lock, npx playwright install chromium, npm test (Python 3 required).
21 deterministic calculation scenarios exercise the real browser engine, with independently calculated expected values; 12 UI checks cover intro, wizard, localization, demo, comparison, exports, mobile and screenshots. These are synthetic inputs, not customer data.
ROI here uses the current application definition: net value divided by total AI costs over the horizon (setup + running costs + inference), not setup alone. No ROI for zero cost. Tests inspect window.latest.results, not a duplicate implementation.
Screenshots are current-state desktop/mobile images; automated base/head comparisons are a separate future enhancement. JSON round trip and file signatures are not exhaustive file-content validation. Tests do not cover every workflow, browser or device. A passed suite is not a substitute for human product review.
Review PR checks and download the HTML report/screenshots artifact. Required status checks should only be configured once a clean baseline run is verified.
