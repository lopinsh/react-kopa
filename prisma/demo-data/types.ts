/** Shapes of the demo content (D1). Content lives in the sibling files; logic in ../demo.ts. */
export type Text = { lv: string; en: string };

export interface DemoL2 {
  l1: string;
  slug: string;
  lv: string;
  en: string;
}

export interface DemoUser {
  /** = username, e.g. demo_zvaigznu_marite */
  key: string;
  name: string;
  username: string;
  bio: string;
  cities: string[];
}

export interface DemoEvent {
  title: Text;
  description: Text;
  location: string;
  city?: string;
  isOnline?: boolean;
  /** Days from the run date (2-40). */
  inDays: number;
  /** Riga local hour. */
  hour: number;
  /** Duration in hours (default 2). */
  hours?: number;
  going: string[];
}

export interface DemoPost {
  title: string;
  content: string;
  daysAgo: number;
}

export interface DemoGroup {
  /** Stable key, = slugify(name). */
  slug: string;
  /** Slug of the L2 the group is tagged with. */
  l2: string;
  name: string;
  city: string;
  /** lv, at most 60 characters. */
  lookingFor: string;
  ageDays: number;
  /** User key. */
  owner: string;
  /** User keys. */
  members: string[];
  /** One-line pitch (the card tagline), at most 200 characters. */
  tagline: Text;
  /** The rest of the About text, HTML paragraphs. */
  about: Text;
  second: { title: Text; body: Text };
  events: DemoEvent[];
  posts: DemoPost[];
}

export const DEMO_EMAIL_DOMAIN = 'demo.ejam.invalid';

export const DEMO_NOTICE: Text = {
  lv: '<strong>Iedomāta demo grupa.</strong>',
  en: '<strong>An imaginary demo group.</strong>',
};

export const DEMO_CREATE_PARAGRAPH: Text = {
  lv: '<p>Šī grupa ir izdomāta, lai parādītu, kā Ejam Kopā izskatās. Gribi īstu? <a href="/lv/create">Izveido līdzīgu grupu</a>.</p>',
  en: '<p>This group is made up to show what Ejam Kopā looks like. Want a real one? <a href="/en/create">Create a similar group</a>.</p>',
};

export const ABOUT_TITLE: Text = { lv: 'Par mums', en: 'About us' };
