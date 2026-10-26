/**
 * Port for getting the current time. Injecting it instead of calling `new Date()`
 * makes time-dependent business logic deterministic in tests.
 */
export const CLOCK = Symbol('CLOCK');

export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
