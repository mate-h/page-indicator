type Props<T> = { 
  /** State of the animation */
  state: T;
  /** Animation duration in milliseconds */
  duration: number;
  /** Interpolation function between prevState and targetState, 0 < t < 1 */
  t: (prevState: T, targetState: T, t: number) => T;
  /** Timing functions, linear by default */
  timing: {
    /** Animation timing function */
    t: (t: number) => number;
    /** Inverse of timing function */
    tinv: (t: number) => number;
  }
};

type ConstructorProps<T> = Partial<Props<T>> & Pick<Props<T>, "state">;

export class Animation<T = number> {
  private prevState: T;
  private targetState: T;
  private state: T;
  private listeners: ((val: T) => void)[] = [];
  private animate: () => void;
  private currentFrame: number;
  private startTime: number = 0;
  private cancelledAt = 1;
  private d = 0;
  
  /** Props passed via the constructor, immutable */
  readonly props: Props<T>;
  constructor(props: ConstructorProps<T>) {
    this.prevState = props.state;
    this.state = props.state;
    this.targetState = props.state;
    this.props = { 
      duration: 150,
      t: (p, q, x) => {
        const a = p as unknown as number;
        const b = q as unknown as number;
        try {
          return (a + x * (b - a)) as unknown as T;
        }
        catch(e) {
          throw new Error('Custom interpolation function is required for non numeric types')
        }
      },
      timing: {
        t: x => x,
        tinv: x => x,
      },
      ...props
    };
    this.currentFrame = -1;
    this.animate = () => {
      const now = new Date().getTime();
      const __t = (this.startTime - this.cancelledAt) / this.props.duration;
      const pinv = this.props.timing.tinv(__t);
      this.d = this.props.duration;
      const _t = (now - this.startTime) / this.d;
      const p = this.props.timing.t(_t);
      this.listeners.forEach(listener => {
        this.state = this.props.t(this.prevState, this.targetState, p) as unknown as T;
        listener(this.state);
      })
      if (now - this.startTime < this.d) {
        this.currentFrame = requestAnimationFrame(this.animate);
      } else {
        this.listeners.forEach(listener => {
          this.state = this.props.t(this.prevState, this.targetState, 1) as unknown as T;
          listener(this.state);
        })
      }
    }
  }
  /** Get current animation target state */
  get() {
    return this.targetState;
  }
  /** Set target state to value */
  set(val: T) {
    const now = new Date().getTime();
    const prevStart = this.startTime;
    if (now - prevStart < this.d) {
      const _t = (now - prevStart) / this.d;
      this.cancelledAt = _t;
    } else this.cancelledAt = 1;

    cancelAnimationFrame(this.currentFrame);
    // this.state = val;
    this.startTime = now;
    this.prevState = this.state;
    this.targetState = val;
    this.animate();
  }
  /** Listen for animation state change */
  listen(listener: (val: T) => void) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }
}