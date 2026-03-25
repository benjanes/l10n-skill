# General Localization Guide

Use this reference when the project doesn't match one of the specific framework guides, or when working with:
- Vue.js (vue-i18n)
- Angular (@ngx-translate or @angular/localize)
- Svelte
- Ruby on Rails
- Go
- Rust
- Other languages/frameworks

## General principles

Regardless of framework, the pattern is always the same:

1. **Find the string** — a hardcoded user-facing string in the source
2. **Create a key** — hierarchical, based on file location and context
3. **Add to catalog** — put the key with an ICU MessageFormat value in the JSON catalog
4. **Replace in source** — swap the string for a translation function call

The catalog always uses ICU MessageFormat syntax (`{variable}` for interpolation, `{count, plural, ...}` for plurals, `{variable, select, ...}` for category-based variants).

## Common framework patterns

### Vue.js (vue-i18n)

vue-i18n supports ICU MessageFormat via the `@intlify/message-compiler` plugin or by setting `messageCompiler` in config.

```vue
<!-- Before -->
<template>
  <h1>Profile Settings</h1>
</template>

<!-- After -->
<template>
  <h1>{{ $t('settings.profile.title') }}</h1>
</template>
```

In `<script setup>`:
```ts
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const message = t('settings.profile.title');
```

Plurals with ICU:
```ts
// Catalog: { "cart.itemCount": "{count, plural, one {# item} other {# items}}" }
const label = t('cart.itemCount', { count: itemCount });
```

### Angular

Angular supports ICU MessageFormat natively in templates via `@angular/localize`:

```html
<!-- Before -->
<h1>Profile Settings</h1>

<!-- After (with @ngx-translate) -->
<h1>{{ 'settings.profile.title' | translate }}</h1>
```

Angular's built-in i18n also supports ICU directly in templates:
```html
<span i18n>{count, plural, one {# item} other {# items}}</span>
```

In TypeScript:
```ts
import { TranslateService } from '@ngx-translate/core';

constructor(private translate: TranslateService) {}

getMessage() {
  return this.translate.instant('settings.profile.title');
}
```

### Svelte

```svelte
<!-- With a simple i18n store that supports ICU -->
<script>
  import { t } from '$lib/i18n';
</script>

<!-- Before -->
<h1>Profile Settings</h1>

<!-- After -->
<h1>{$t('settings.profile.title')}</h1>
```

For ICU support in Svelte, use `intl-messageformat` from FormatJS:
```ts
import { MessageFormat } from 'intl-messageformat';

export function t(key: string, values?: Record<string, any>): string {
  const pattern = catalog[key] || key;
  if (values) {
    const fmt = new MessageFormat(pattern, locale);
    return fmt.format(values) as string;
  }
  return pattern;
}
```

### Ruby on Rails

Rails uses YAML catalogs by default. For ICU support, use the `i18n-icu` gem:

```erb
<!-- Before -->
<h1>Profile Settings</h1>

<!-- After -->
<h1><%= t('settings.profile.title') %></h1>
```

With ICU plurals:
```erb
<%= t('cart.itemCount', count: @count) %>
```

Note in the output that the JSON catalog should be converted to YAML, and the `i18n-icu` gem should be added for ICU MessageFormat support.

### Go

Use `golang.org/x/text/message` or `github.com/nicksnyder/go-i18n` with ICU support:

```go
// Before
fmt.Println("Profile Settings")

// After
fmt.Println(i18n.T("settings.profile.title"))
```

For ICU MessageFormat in Go, use `github.com/nicholasgasior/gointl` or implement a thin wrapper around the catalog.

### Rust

Use `icu_messageformat` crate or `fluent-rs`:

```rust
// Before
println!("Profile Settings");

// After
println!("{}", t!("settings.profile.title"));
```

## Wiring ICU interpolation values through

Every ICU `{placeholder}` in the catalog **must** have a corresponding values argument passed at the call site. Forgetting the values argument causes the placeholder to render as literal text (e.g., the user sees `{name}` instead of "Alice").

```
// WRONG — renders "{name}" literally
t('dashboard.welcomeMessage')

// RIGHT — passes the value for {name}
t('dashboard.welcomeMessage', { name: user.name })
```

This is especially easy to miss in **data-driven UI patterns** where i18n keys are stored in configuration objects or arrays rather than called inline. When a key with placeholders is stored as data:

1. The data structure must include a field for interpolation values (e.g., `i18nValues`)
2. The generic renderer consuming that data must forward those values to the translation function
3. Custom components that bypass the generic renderer need their own translation calls with values

**Before finishing, verify all interpolated keys:**
1. Search the catalog for all `{...}` placeholders
2. For each one, trace the rendering path and confirm the values are wired through
3. Pay special attention to keys used in data structures, config objects, or generic renderers — these are where values most often get dropped

## When the framework is unknown

If you can't determine the framework, use a generic approach:
1. Extract strings into the JSON catalog with hierarchical keys and ICU MessageFormat values
2. Replace strings with a placeholder comment indicating the key:
   ```
   /* i18n: settings.profile.title */ "Profile Settings"
   ```
3. Note in the output that the user needs to wire up their localization library with ICU support and replace the placeholder pattern with actual function calls
