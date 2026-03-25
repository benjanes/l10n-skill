# React / JavaScript / TypeScript Localization

## Library: react-intl (FormatJS)

react-intl is the standard React library for ICU MessageFormat. If the project already uses a different library (i18next, lingui, etc.), match its patterns instead — but configure it to use ICU syntax.

## Setup (if not already configured)

If the project doesn't have react-intl set up, create a minimal config:

```tsx
// src/i18n.tsx
import { IntlProvider } from 'react-intl';
import messages from '../locales/en.json';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={messages}>
      {children}
    </IntlProvider>
  );
}
```

Wrap the app root with `<I18nProvider>`:
```tsx
import { I18nProvider } from './i18n';

<I18nProvider>
  <App />
</I18nProvider>
```

Install dependencies if needed: `react-intl`.

## Replacement patterns

### Functional components (hooks)

Add the `useIntl` hook and replace strings with `formatMessage()`:

**Before:**
```tsx
function ProfilePage() {
  return (
    <div>
      <h1>Profile Settings</h1>
      <p>Manage your account preferences</p>
      <button>Save Changes</button>
    </div>
  );
}
```

**After:**
```tsx
import { useIntl } from 'react-intl';

function ProfilePage() {
  const intl = useIntl();
  return (
    <div>
      <h1>{intl.formatMessage({ id: 'settings.profile.title' })}</h1>
      <p>{intl.formatMessage({ id: 'settings.profile.description' })}</p>
      <button>{intl.formatMessage({ id: 'settings.profile.saveButton' })}</button>
    </div>
  );
}
```

Alternatively, use the `<FormattedMessage>` component for JSX contexts:
```tsx
import { FormattedMessage } from 'react-intl';

<h1><FormattedMessage id="settings.profile.title" /></h1>
```

### String interpolation

**Before:**
```tsx
<p>{`Welcome back, ${user.name}!`}</p>
```

**After:**
```tsx
<p>{intl.formatMessage({ id: 'dashboard.welcomeMessage' }, { name: user.name })}</p>
```

Catalog entry (ICU syntax):
```json
{ "dashboard.welcomeMessage": "Welcome back, {name}!" }
```

### Plurals

**Before:**
```tsx
<span>{count === 1 ? '1 item' : `${count} items`}</span>
```

**After:**
```tsx
<span>{intl.formatMessage({ id: 'cart.itemCount' }, { count })}</span>
```

Catalog entry (single key with ICU plural):
```json
{ "cart.itemCount": "{count, plural, one {# item} other {# items}}" }
```

### JSX with embedded elements (FormattedMessage)

When a translatable string contains JSX elements (links, bold, etc.), use `<FormattedMessage>` with rich text:

**Before:**
```tsx
<p>Read our <a href="/terms">Terms of Service</a> before continuing.</p>
```

**After:**
```tsx
import { FormattedMessage } from 'react-intl';

<p>
  <FormattedMessage
    id="auth.termsNotice"
    values={{
      link: (chunks) => <a href="/terms">{chunks}</a>
    }}
  />
</p>
```

Catalog entry:
```json
{ "auth.termsNotice": "Read our <link>Terms of Service</link> before continuing." }
```

### HTML attributes (placeholder, title, aria-label, alt)

```tsx
// Before
<input placeholder="Search..." />
<img alt="User avatar" />

// After
<input placeholder={intl.formatMessage({ id: 'common.searchPlaceholder' })} />
<img alt={intl.formatMessage({ id: 'common.userAvatarAlt' })} />
```

### Wiring ICU interpolation values through

Every ICU `{placeholder}` in the catalog **must** have a corresponding values object passed at the call site. If you forget the values argument, the placeholder renders as literal text (e.g., the user sees `{name}` instead of "Alice").

```tsx
// WRONG — renders "{name}" literally
intl.formatMessage({ id: 'dashboard.welcomeMessage' })

// RIGHT — passes the value for {name}
intl.formatMessage({ id: 'dashboard.welcomeMessage' }, { name: user.name })
```

This is especially easy to miss in **data-driven UI patterns** where i18n keys are stored as data rather than called inline. For example, a list of preferences rendered by a generic component:

```tsx
// Data definition — must include i18nValues alongside the key
const preferences = [
  { labelKey: 'settings.greeting', i18nValues: { name: user.name } },
  { labelKey: 'settings.theme', i18nValues: {} },
];

// Generic renderer — must forward values
function PreferenceList({ items }: { items: typeof preferences }) {
  const intl = useIntl();
  return items.map(item => (
    <span>{intl.formatMessage({ id: item.labelKey }, item.i18nValues)}</span>
  ));
}
```

**Before finishing, verify all interpolated keys:**
1. Search the catalog for all `{...}` placeholders
2. For each one, trace the rendering path and confirm the values object is wired through
3. Pay special attention to keys used in data structures, config objects, or generic renderers — these are where values most often get dropped
4. Custom components that bypass a generic renderer need their own `formatMessage` calls with values

### Translated interpolation values

When an ICU placeholder's value is itself **user-facing text** (not a brand name, number, or keyboard shortcut), that value must also come from the catalog — not be hardcoded in English. Otherwise, the interpolated word stays in English even when the rest of the UI is translated.

Use a **lazy resolver pattern** (a function that receives `intl`) when the translation context isn't available at definition time — e.g., in config objects, preference arrays, or constant maps built outside React components.

**Before (broken):**
```tsx
// "menu bar" and "tray" are user-facing English — they won't get translated
const prefs = [
  {
    i18nKey: 'settings.showTrayIcon',
    i18nValues: { trayName: IS_MAC_OS ? 'menu bar' : 'tray' },
  },
];
```

**After (correct):**
```tsx
// Values resolved at render time via intl, pulling from the catalog
const prefs = [
  {
    i18nKey: 'settings.showTrayIcon',
    i18nValues: (intl: IntlShape) => ({
      trayName: intl.formatMessage({
        id: IS_MAC_OS ? 'common.menuBar' : 'common.tray',
      }),
    }),
  },
];

// Renderer resolves the function before passing to formatMessage
const values = typeof pref.i18nValues === 'function'
  ? pref.i18nValues(intl)
  : pref.i18nValues;
intl.formatMessage({ id: pref.i18nKey }, values);
```

**When to apply this rule:**
- The interpolation value is a natural-language word or phrase (e.g., "menu bar", "tray", "enabled", "disabled")
- The value varies by platform/condition but is always human-readable text

**When this rule does NOT apply** (static values are fine):
- Brand names (`appName: "productXYZ"`)
- Keyboard shortcuts (`hotkey: "⌘Z"`)
- Numbers, dates, or IDs

### Non-component files (utilities, constants)

For strings outside React components, use `createIntl`:

```ts
import { createIntl, createIntlCache } from 'react-intl';
import messages from '../locales/en.json';

const cache = createIntlCache();
const intl = createIntl({ locale: 'en', messages }, cache);

const ERROR_MESSAGES = {
  timeout: intl.formatMessage({ id: 'errors.network.timeout' }),
};
```

Note: these won't re-render on language change. If dynamic language switching is needed, restructure to call `formatMessage()` at render time instead.
