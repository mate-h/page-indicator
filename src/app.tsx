import { PageIndicator } from ".";

export function App() {
  return (
    <>
      <section class="max-w-prose mx-auto">
        <p class="font-mono text-black text-opacity-60">page-indicator</p>
        <h1>Page indicator</h1>
        <p>
          Page indicator dots for carousels, horizontal or vertical scroll snap
          views and gallery views. It is a reusable component and very simple.
          Page indicators dots are also used in onboarding screens. They are
          implemented in a WebGL shader using a simple metaball threshold
          function and a 1px falloff with a smoothstep shader function. The
          middle dot is synced with scroll position, and the dots are positioned
          horizontally or vertically as they merge with the scrolling dot.
        </p>
      </section>
      <PageIndicator />
    </>
  );
}
