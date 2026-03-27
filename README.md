# i18n-skills

A collection of Claude Code skills that help developers prepare codebases for internationalization and localization. Audit your strings, fix structural issues, standardize tone and terminology, then extract and replace hardcoded copy with i18n function calls.

## Skills

### Auditing

**`/auditing-i18n-readiness`** — Orchestrator that runs all analysis skills in sequence and consolidates findings into a prioritized action plan.

**`/auditing-i18n-string-patterns`** — Discovers all hardcoded user-facing strings, analyzes construction patterns (concatenation, template literals, pluralization, formatting), and produces scope metrics with conversion recipes.

**`/auditing-i18n-tone`** — Assesses brand and tone consistency across copy. Flags humor, idioms, culture-specific references, and voice deviations that would confuse translators.

**`/auditing-i18n-terminology`** — Detects vocabulary inconsistencies (same concept, different words) and builds a proto-glossary with canonical terms and context notes for translators.

### Extraction

**`/localize`** — Extracts hardcoded strings and replaces them with framework-appropriate i18n function calls. Generates hierarchical translation keys and a JSON catalog using ICU MessageFormat.

## Usage

All skills can be run against your entire repo or scoped to specific files and directories:

```bash
# Audit the full repo
/auditing-i18n-readiness

# Audit specific paths
/auditing-i18n-readiness apps/web/src packages/components/src

# Run individual analysis skills on a subset
/auditing-i18n-string-patterns src/components/
/auditing-i18n-tone src/pages/onboarding/
/auditing-i18n-terminology src/

# Localize specific files or directories
/localize src/components/Header.tsx src/components/Footer.tsx
/localize src/pages/settings/
```

## Workflow

```
1. /auditing-i18n-readiness        # Run the full audit (or individual skills)
2. Review generated reports         # i18n-pre-extraction-fixes.md, i18n-extraction-pattern-catalog.md
3. Fix pre-extraction blockers      # Centralize formatting, standardize tone/terminology
4. /localize                        # Extract strings and generate translation catalog
```

## Supported Frameworks

- React / Next.js / Remix (react-intl, i18next)
- iOS Swift (NSLocalizedString, String(localized:))
- Android Kotlin (getString, stringResource)
- Python (gettext)
- General (adaptable to other frameworks)

## Installation

Add the skills to your Claude Code setup:

```bash
# Clone the repo
git clone <repo-url>

# Copy skills to your Claude Code skills directory
cp -r skills/* ~/.claude/skills/
```

Or reference the skills directory directly in your Claude Code project settings.

## Output

The audit skills produce two artifacts in your project root:

- **`i18n-pre-extraction-fixes.md`** — Blockers and recommended fixes organized by severity (structural issues, formatting, tone deviations, terminology inconsistencies)
- **`i18n-extraction-pattern-catalog.md`** — Pattern conversion recipes showing how each string type maps to i18n function calls

The localize skill produces:

- Modified source files with i18n function calls replacing hardcoded strings
- **`locales/en.json`** — Translation catalog with hierarchical keys and ICU MessageFormat values
