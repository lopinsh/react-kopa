// Preloaded into the app server (NODE_OPTIONS=--require) and the seed so "now" is the same on every run:
// Thursday 22 Oct 2026, 12:00 Riga time. Date.now() and new Date() are frozen; timers still run.
const FIXED = Date.parse('2026-10-22T09:00:00Z');
const RealDate = Date;
class FrozenDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(FIXED);
    else super(...args);
  }
  static now() { return FIXED; }
  // Own (not inherited) so wrappers that copy a constructor's own statics, as Next's server does, keep them.
  static UTC(...a) { return RealDate.UTC(...a); }
  static parse(s) { return RealDate.parse(s); }
}
globalThis.Date = FrozenDate;
