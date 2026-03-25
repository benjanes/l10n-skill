# Android (Kotlin) Localization

## Standard approach: strings.xml with ICU via android-icu or MessageFormat

Android uses XML resource files for localization. The JSON catalog with ICU MessageFormat serves as the source of truth — note in the output that the user should convert it to `res/values/strings.xml` (and `plurals.xml` for ICU plural entries).

Android 24+ includes `android.icu.text.MessageFormat` natively. For older API levels, use the `com.ibm.icu:icu4j` library.

## ICU to Android mapping

| ICU syntax | Android equivalent |
|---|---|
| `{name}` | `%1$s` positional format in strings.xml, or ICU `MessageFormat` at runtime |
| `{count, plural, one {# item} other {# items}}` | `<plurals>` resource or runtime `MessageFormat` |
| `{gender, select, ...}` | Runtime `MessageFormat` (no XML equivalent) |

## Replacement patterns

### Jetpack Compose

**Before:**
```kotlin
@Composable
fun ProfileScreen() {
    Column {
        Text("Profile Settings")
        Text("Manage your account preferences")
        Button(onClick = { save() }) {
            Text("Save Changes")
        }
    }
}
```

**After:**
```kotlin
@Composable
fun ProfileScreen() {
    Column {
        Text(stringResource(R.string.settings_profile_title))
        Text(stringResource(R.string.settings_profile_description))
        Button(onClick = { save() }) {
            Text(stringResource(R.string.settings_profile_save_button))
        }
    }
}
```

Note: Android resource IDs use `snake_case`, not dot notation. Convert hierarchical keys: `settings.profile.title` → `settings_profile_title`.

### String interpolation

**Before:**
```kotlin
Text("Welcome back, ${user.name}!")
```

**After:**
```kotlin
Text(stringResource(R.string.dashboard_welcome_message, user.name))
```

In `strings.xml`:
```xml
<string name="dashboard_welcome_message">Welcome back, %1$s!</string>
```

ICU catalog entry:
```json
{ "dashboard.welcomeMessage": "Welcome back, {name}!" }
```

### Plurals

**Before:**
```kotlin
Text(if (count == 1) "1 item" else "$count items")
```

**After:**
```kotlin
Text(pluralStringResource(R.plurals.cart_item_count, count, count))
```

ICU catalog entry:
```json
{ "cart.itemCount": "{count, plural, one {# item} other {# items}}" }
```

In `plurals.xml`:
```xml
<plurals name="cart_item_count">
    <item quantity="one">%d item</item>
    <item quantity="other">%d items</item>
</plurals>
```

### Using ICU MessageFormat directly at runtime

For complex ICU patterns (nested plurals, select), use `MessageFormat` at runtime instead of XML resources:

```kotlin
import android.icu.text.MessageFormat
import java.util.Locale

fun formatIcu(pattern: String, args: Map<String, Any>): String {
    val fmt = MessageFormat(pattern, Locale.getDefault())
    return fmt.format(args)
}

// Usage
val message = formatIcu(
    catalog["dashboard.notifications.unreadCount"]!!,
    mapOf("count" to unreadCount)
)
```

### XML layouts (if used)

**Before:**
```xml
<TextView android:text="Profile Settings" />
```

**After:**
```xml
<TextView android:text="@string/settings_profile_title" />
```

### Non-UI code (ViewModels, etc.)

```kotlin
// Use context.getString()
val message = context.getString(R.string.errors_network_timeout)
```

## Key format note

The JSON catalog uses dot-notation keys with ICU values for consistency across platforms. Android requires snake_case resource IDs. In the summary, note this mapping so the user can convert when creating `strings.xml`. For complex ICU patterns (select, nested plurals), recommend using `MessageFormat` at runtime rather than trying to express them in XML.
