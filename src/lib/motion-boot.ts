// Inline <head> script (server-safe constant; see src/components/site/motion.tsx).
/** Runs before paint: enables motion styles only when the visitor allows motion and JS runs. */
export const MOTION_BOOT = `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok')}catch(e){}})()`
