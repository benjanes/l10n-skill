# Python Localization

## Common approaches

Python has several localization approaches. Detect what the project uses:

- **python-icu** / **PyICU** — direct ICU MessageFormat support
- **babel** — includes ICU-compatible message formatting
- **Flask-Babel** / **django.utils.translation** — web frameworks (can be combined with ICU)
- **Custom JSON loader with ICU** — a simple approach using the `icu` or `pyicu` package

If starting fresh with no framework preference, a simple JSON-based approach with ICU formatting works well.

## Replacement patterns

### Simple JSON + ICU approach (no framework)

Create a helper that loads the JSON catalog and formats ICU messages:

```python
# i18n.py
import json
from pathlib import Path

try:
    import icu  # PyICU
    def _format_icu(pattern: str, args: dict, locale: str = "en") -> str:
        fmt = icu.MessageFormat(pattern, icu.Locale(locale))
        return fmt.format(list(args.keys()), list(args.values()))
except ImportError:
    # Fallback: simple {var} replacement (no plural/select support)
    def _format_icu(pattern: str, args: dict, locale: str = "en") -> str:
        result = pattern
        for k, v in args.items():
            result = result.replace(f"{{{k}}}", str(v))
        return result

_catalog = {}
_lang = "en"

def load(lang: str = "en", catalog_dir: str = "locales"):
    global _catalog, _lang
    _lang = lang
    path = Path(catalog_dir) / f"{lang}.json"
    if path.exists():
        with open(path) as f:
            _catalog = json.load(f)

def t(key: str, **kwargs) -> str:
    pattern = _catalog.get(key, key)
    if kwargs:
        return _format_icu(pattern, kwargs, _lang)
    return pattern

# Auto-load on import
load()
```

**Before:**
```python
print("Profile Settings")
print(f"Welcome back, {user.name}!")
```

**After:**
```python
from i18n import t

print(t("settings.profile.title"))
print(t("dashboard.welcomeMessage", name=user.name))
```

Catalog entries:
```json
{
  "settings.profile.title": "Profile Settings",
  "dashboard.welcomeMessage": "Welcome back, {name}!"
}
```

### Plurals with ICU

**Before:**
```python
if count == 1:
    msg = "You have 1 unread notification"
else:
    msg = f"You have {count} unread notifications"
```

**After:**
```python
msg = t("dashboard.notifications.unreadCount", count=count)
```

Catalog entry:
```json
{ "dashboard.notifications.unreadCount": "{count, plural, one {You have # unread notification} other {You have # unread notifications}}" }
```

### Flask-Babel with ICU

Flask-Babel uses gettext by default, but you can layer ICU on top for the catalog format:

**Before:**
```python
flash("Changes saved successfully")
flash(f"Welcome back, {user.name}!")
```

**After:**
```python
from i18n import t

flash(t("settings.profile.saveSuccess"))
flash(t("dashboard.welcomeMessage", name=user.display_name))
```

### Django

Django uses gettext natively. For ICU catalog compatibility, use a thin wrapper:

**Before:**
```python
return HttpResponse("<h1>Profile Settings</h1>")
```

**After:**
```python
from i18n import t

return HttpResponse(f"<h1>{t('settings.profile.title')}</h1>")
```

### Django templates

**Before:**
```html
<h1>Profile Settings</h1>
<p>Welcome back, {{ user.name }}!</p>
```

**After:**
```html
{% load i18n_icu %}
<h1>{% icu "settings.profile.title" %}</h1>
<p>{% icu "dashboard.welcomeMessage" name=user.name %}</p>
```

Note: A custom template tag (`i18n_icu`) would need to be created to support ICU format in Django templates. Document this in the output summary.
