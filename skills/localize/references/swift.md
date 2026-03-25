# iOS (Swift) Localization

## Standard approach: String Catalogs (.xcstrings) or Localizable.strings

Modern iOS projects (Xcode 15+) use String Catalogs. Older projects use `Localizable.strings`. Detect which one the project uses and match it. If starting fresh, prefer String Catalogs.

The JSON catalog uses ICU MessageFormat syntax. Since Apple's localization system doesn't natively use ICU, the JSON catalog serves as the source of truth and should be converted to the appropriate iOS format. Note this in the output summary.

## ICU to iOS mapping

ICU MessageFormat maps to iOS localization like this:

| ICU syntax | iOS equivalent |
|---|---|
| `{name}` | `%@` or `\(name)` in String interpolation |
| `{count, plural, one {# item} other {# items}}` | `.stringsdict` plural rules or String Catalog plural variants |
| `{gender, select, male {He} female {She} other {They}}` | Separate keys or String Catalog device variations |

## Replacement patterns

### SwiftUI

**Before:**
```swift
struct ProfileView: View {
    var body: some View {
        VStack {
            Text("Profile Settings")
            Text("Manage your account preferences")
            Button("Save Changes") { save() }
        }
    }
}
```

**After:**
```swift
struct ProfileView: View {
    var body: some View {
        VStack {
            Text(String(localized: "settings.profile.title"))
            Text(String(localized: "settings.profile.description"))
            Button(String(localized: "settings.profile.saveButton")) { save() }
        }
    }
}
```

### String interpolation

**Before:**
```swift
Text("Welcome back, \(user.name)!")
```

**After:**
```swift
Text(String(localized: "dashboard.welcomeMessage \(user.name)"))
```

In the ICU catalog:
```json
{ "dashboard.welcomeMessage": "Welcome back, {name}!" }
```

Note: When converting to iOS `.strings`, this becomes: `"dashboard.welcomeMessage %@" = "Welcome back, %@!";`

### UIKit

**Before:**
```swift
titleLabel.text = "Profile Settings"
submitButton.setTitle("Save Changes", for: .normal)
```

**After:**
```swift
titleLabel.text = String(localized: "settings.profile.title")
submitButton.setTitle(String(localized: "settings.profile.saveButton"), for: .normal)
```

### Plurals

**Before:**
```swift
let message = count == 1 ? "1 item" : "\(count) items"
```

ICU catalog entry:
```json
{ "cart.itemCount": "{count, plural, one {# item} other {# items}}" }
```

In Swift, plurals require a `.stringsdict` entry or String Catalog plural variant. Note this in the output — the ICU plural syntax in the JSON catalog documents the intent, but the actual iOS implementation needs the appropriate plural infrastructure.

### Legacy pattern: NSLocalizedString

If the project already uses `NSLocalizedString`, keep using it:

```swift
NSLocalizedString("settings.profile.title", comment: "Profile page title")
```

Always include a meaningful `comment` parameter — it helps translators understand context.

## Catalog note

The JSON catalog with ICU MessageFormat is the canonical source. For iOS integration:
- Simple strings map directly to `.strings` keys
- ICU `{variable}` placeholders become `%@` or `%1$@` positional format specifiers
- ICU `{count, plural, ...}` entries need `.stringsdict` files or String Catalog plural variants
- Mention these conversion steps in the output summary
