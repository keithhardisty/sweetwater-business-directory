# Sweetwater Business Directory

A free directory of businesses owned by people who live in the Sweetwater
community near Bee Cave, Austin and Spicewood, Texas.

**Live site:** https://sweetwater-business-directory.netlify.app/

Built with [Hugo](https://gohugo.io). No JavaScript frameworks, no CSS
framework, no icon fonts — the whole front end is one small stylesheet and two
short scripts.

---

## How the repository is laid out

```
assets/
  scss/            Design system (tokens, base, components, directory, content)
  js/              site.js (nav, theme) and directory.js (search + filters)
layouts/
  index.html       The directory itself — this is the home page
  partials/        head (SEO/JSON-LD), header, footer, business-card, icon
  _default/        contact, single, list, baseof
exampleSite/
  config.toml      Site settings, menus, hero and CTA copy
  content/         Home, get-listed, news posts
  data/tools.yml   >>> Every business listing lives here <<<
  static/images/   Business logos and screenshots
```

The site content lives in `exampleSite/` while the templates and assets live at
the repository root. Hugo stitches them together with the `[module.mounts]`
block in `exampleSite/config.toml`, so the build no longer depends on what the
checkout directory happens to be called.

## Running it locally

Requires **Hugo extended** 0.128 or newer (the extended build is needed to
compile SCSS).

```bash
cd exampleSite
hugo server
```

Then open http://localhost:1313.

To produce the files Netlify would deploy:

```bash
cd exampleSite && hugo --gc --minify
```

## Adding or editing a business

Every listing is an entry in `exampleSite/data/tools.yml`, grouped by category:

```yaml
- title: Home Services
  tool:
  - company: Example Landscaping        # required — the business name
    name: Jane Doe                      # the neighbor to contact
    description: Lawn care and design.  # one or two sentences
    link: https://example.com           # full URL including https://
    email: jane@example.com
    phone: 512-555-0100
    image: "/images/example.png"        # optional
    instagram: https://instagram.com/…  # optional
    facebook: https://facebook.com/…    # optional
    tags: ["mowing", "irrigation"]      # optional extra search keywords
    featured: true                      # optional — pins to top of its category
```

Only `company` is strictly required. Everything else renders only when present:
a listing with no image gets a colored monogram, one with no phone simply has
no call button.

To add a **new category**, add another `- title:` block. Categories are sorted
alphabetically on the page, except `Misc`, which is always pushed to the end.

### About the images

Card images are displayed in a fixed 16:9 window cropped from the **top** of the
source image, so every card in a row lines up. If you are screenshotting a
business's website, make sure the logo is near the top of the shot.

## What the directory page does

- Instant text search across business name, contact name, description,
  category, tags, phone and domain — accent- and punctuation-insensitive,
  and every word has to match somewhere (order doesn't matter)
- Category filtering, with counts
- Group-by-category or a flat A–Z listing
- Search, category and sort are mirrored into the URL (`?q=`, `?category=`,
  `?sort=`), so a filtered view can be shared or bookmarked
- `/` focuses the search box; `Esc` clears it
- Light and dark themes, following the operating system unless overridden
- Works with JavaScript disabled — all 80 listings are in the HTML, only the
  filter controls need scripting, so they are hidden when it is unavailable
- A print stylesheet, for anyone who wants the list on the fridge

## Deployment

Netlify builds from `netlify.toml` and publishes `exampleSite/public`. The
"get listed" form is a [Netlify Form](https://docs.netlify.com/forms/setup/)
named `listing`; submissions appear in the Netlify dashboard and it redirects
to `/thanks/`.

## Credits

Originally started from the
[Northendlab](https://github.com/themefisher/northendlab-hugo) Hugo theme by
Themefisher (MIT). Little of it remains beyond the initial project structure.
