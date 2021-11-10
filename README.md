# page-indicator

Page indicator dots for carousels, horizontal or vertical scroll snap views and gallery views. It is a reusable component and very simple. Page indicators dots are also used in onboarding screens. They are implemented in a WebGL shader using a simple metaball threshold function and a 1px falloff with a smoothstep shader function. The middle dot is synced with scroll position, and the dots are positioned horizontally or vertically as they merge with the scrolling dot.

## Usage
The component is a simple function that returns a reference HTML element.

```bash
npm i page-indicator
# or
pnpm i page-indicator
# or
yarn add page-indicator
```

```tsx
import { PageIndicator } from '@mate-h/page-indicator';

export default () => {
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(5);

  return (
    <PageIndicator
      active={active}
      count={count}
      onChange={setActive}
    />
  );
};
```

## Props

```ts
type PageIndicatorProps = {
  /**
   * The active page index.
   * @default 0
   */
  active: number;
  /**
   * Number of dots to display
   */
  count: number;
  /** Callback function to be called when the active page changes. */
  onChange: (active: number) => void;
  /** The color of the dots. */
  color?: string;
};
```

## Development

Using [vite](https://vitejs.dev/) dev server.

```bash
git clone https://github.com/mate-h/page-indicator.git
cd page-indicator
npm i
npm run dev
```