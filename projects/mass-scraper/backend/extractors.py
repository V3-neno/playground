"""'What to find' fields: each option the UI can tick, and the columns it produces.

`FIELD_GROUPS` is served to the frontend as-is, so adding a field here is all it takes to show it in the sidebar.
"""

from __future__ import annotations

import json
import re
from typing import Any, Callable
from urllib.parse import urlsplit

Page = Any  # a Scrapling Response
IsInternal = Callable[[str], bool]

FIELD_GROUPS: list[dict[str, Any]] = [
    {
        "group": "Meta",
        "items": [
            {"id": "title", "label": "Title", "hint": "title, title_length", "default": True},
            {"id": "description", "label": "Meta description", "hint": "description, description_length", "default": True},
            {"id": "canonical", "label": "Canonical", "hint": "canonical, canonical_is_self"},
            {"id": "robots", "label": "Meta robots", "hint": "meta_robots, noindex, nofollow"},
            {"id": "lang", "label": "Language", "hint": "<html lang>"},
            {"id": "hreflang", "label": "Hreflang", "hint": "hreflang_count, hreflang (lang → url)"},
            {"id": "open_graph", "label": "Open Graph", "hint": "og_title, og_description, og_image"},
        ],
    },
    {
        "group": "Headings",
        "items": [
            {"id": "h1", "label": "H1", "hint": "h1 text, h1_count", "default": True},
            {"id": "h2", "label": "H2", "hint": "h2_count, h2 texts"},
            {"id": "heading_counts", "label": "H3–H6 counts", "hint": "h3_count … h6_count"},
        ],
    },
    {
        "group": "Content",
        "items": [
            {"id": "word_count", "label": "Word count", "hint": "visible words in <body>", "default": True},
            {"id": "paragraphs", "label": "Paragraphs", "hint": "number of <p> with text"},
        ],
    },
    {
        "group": "Links",
        "items": [
            {"id": "links_total", "label": "All links", "hint": "every <a href>, duplicates included"},
            {"id": "links_internal", "label": "Internal links", "hint": "same domain as the seed, subdomains included: total + unique", "default": True},
            {"id": "links_external", "label": "External links", "hint": "total, unique, and which domains", "default": True},
            {"id": "links_nofollow", "label": "Nofollow links", "hint": 'rel="nofollow" / sponsored / ugc'},
            {"id": "links_contact", "label": "Mailto / tel links", "hint": "counts only"},
        ],
    },
    {
        "group": "Images",
        "items": [
            {"id": "images", "label": "Images", "hint": "number of <img> (tracking pixels excluded)", "default": True},
            {"id": "alt_texts", "label": "Alt texts", "hint": "with alt, missing alt, empty alt", "default": True},
        ],
    },
    {
        "group": "Tracking",
        "items": [
            {"id": "gtm", "label": "Google Tag Manager", "hint": "GTM-XXXXXXX"},
            {"id": "google_ids", "label": "Google Analytics / Ads", "hint": "G-…, UA-…, AW-…"},
            {"id": "meta_pixel", "label": "Meta (Facebook) Pixel", "hint": "pixel ID"},
            {"id": "other_pixels", "label": "Other pixels", "hint": "TikTok, LinkedIn, Hotjar, Clarity"},
        ],
    },
    {
        "group": "Tech & structured data",
        "items": [
            {"id": "cms", "label": "CMS / platform", "hint": "WordPress, Shopify, Wix, Webflow…"},
            {"id": "schema", "label": "Schema.org types", "hint": "JSON-LD @type values"},
            {"id": "page_size", "label": "HTML size", "hint": "kilobytes"},
        ],
    },
]

FIELD_IDS = {item["id"] for g in FIELD_GROUPS for item in g["items"]}
DEFAULT_FIND = [item["id"] for g in FIELD_GROUPS for item in g["items"] if item.get("default")]

INVISIBLE_TAGS = ("script", "style", "noscript", "template", "svg", "iframe")
WORD = re.compile(r"\w+", re.UNICODE)

# Tracking IDs are matched inside <script> code/src only, to avoid false positives in body copy.
TRACKERS = {
    "gtm_ids": re.compile(r"\bGTM-[A-Z0-9]{4,9}\b"),
    "ga4_ids": re.compile(r"\bG-[A-Z0-9]{6,12}\b"),
    "ua_ids": re.compile(r"\bUA-\d{4,10}-\d{1,4}\b"),
    "google_ads_ids": re.compile(r"\bAW-\d{6,12}\b"),
    "meta_pixel_ids": re.compile(r"fbq\(\s*['\"]init['\"]\s*,\s*['\"]?(\d{10,20})"),
    "tiktok_pixel_ids": re.compile(r"ttq\.load\(\s*['\"]([A-Z0-9]{15,25})['\"]"),
    "linkedin_partner_ids": re.compile(r"_linkedin_partner_id\s*=\s*['\"]?(\d{4,12})"),
    "hotjar_ids": re.compile(r"\bhjid\s*:\s*(\d{4,10})"),
    "clarity_ids": re.compile(r"clarity['\"]\s*,\s*['\"]script['\"]\s*,\s*['\"]([a-z0-9]{8,12})['\"]"),
}
META_PIXEL_NOSCRIPT = re.compile(r"facebook\.com/tr\?id=(\d{10,20})")

CMS_SIGNATURES = [
    ("WordPress", ("/wp-content/", "/wp-includes/")),
    ("Shopify", ("cdn.shopify.com", "Shopify.theme")),
    ("Wix", ("static.wixstatic.com", "wix-code")),
    ("Squarespace", ("static1.squarespace.com", "squarespace-cdn")),
    ("Webflow", ("assets.website-files.com", "data-wf-site", "cdn.prod.website-files.com")),
    ("Drupal", ("/sites/default/files/", "Drupal.settings")),
    ("Joomla", ("/media/jui/", "/components/com_")),
    ("HubSpot", ("js.hs-scripts.com", "hs-sites.com")),
    ("Magento", ("/static/version", "Magento_")),
    ("WooCommerce", ("woocommerce",)),
    ("Next.js", ("/_next/static/",)),
    ("Gatsby", ("___gatsby",)),
]


def clean(value: Any) -> Any:
    if value is None:
        return None
    s = " ".join(str(value).split())  # collapse newlines/indentation from the HTML source
    return s[:2000]


def _uniq(values) -> list[str]:
    return list(dict.fromkeys(v for v in values if v))


def _text(el: Any) -> str:
    return clean(el.get_all_text(separator="", valid_values=False)) or ""


def extract_fields(page: Page, find: list[str], is_internal: IsInternal) -> dict[str, Any]:
    want = set(find)
    data: dict[str, Any] = {}
    final_url = str(page.url)

    if "title" in want:
        title = clean(page.css("title::text").get())
        data["title"] = title
        data["title_length"] = len(title) if title else 0
    if "description" in want:
        desc = clean(page.css('meta[name="description" i]::attr(content)').get())
        data["description"] = desc
        data["description_length"] = len(desc) if desc else 0
    if "canonical" in want:
        canonical = page.css('link[rel="canonical" i]::attr(href)').get()
        canonical = page.urljoin(canonical.strip()) if canonical else None
        data["canonical"] = canonical
        data["canonical_is_self"] = (canonical.rstrip("/") == final_url.rstrip("/")) if canonical else None
    if "robots" in want:
        robots = clean(page.css('meta[name="robots" i]::attr(content)').get())
        data["meta_robots"] = robots
        data["noindex"] = "noindex" in (robots or "").lower()
        data["nofollow"] = "nofollow" in (robots or "").lower()
    if "lang" in want:
        data["lang"] = clean(page.css("html::attr(lang)").get())
    if "hreflang" in want:
        alts = page.css('link[rel="alternate" i][hreflang]')
        data["hreflang_count"] = len(alts)
        data["hreflang"] = [f"{a.attrib.get('hreflang')} → {a.attrib.get('href')}" for a in alts]
    if "open_graph" in want:
        for prop in ("title", "description", "image"):
            data[f"og_{prop}"] = clean(page.css(f'meta[property="og:{prop}"]::attr(content)').get())

    if "h1" in want:
        h1s = page.css("h1")
        data["h1"] = _text(h1s[0]) if h1s else None  # full text, including nested <span>/<b>…
        data["h1_count"] = len(h1s)
    if "h2" in want:
        h2s = page.css("h2")
        data["h2_count"] = len(h2s)
        data["h2"] = [t for t in (_text(h) for h in h2s) if t]
    if "heading_counts" in want:
        for n in range(3, 7):
            data[f"h{n}_count"] = len(page.css(f"h{n}"))

    if "word_count" in want:
        body = page.css("body")
        text = body[0].get_all_text(separator=" ", ignore_tags=INVISIBLE_TAGS) if body else ""
        data["word_count"] = len(WORD.findall(str(text)))
    if "paragraphs" in want:
        data["paragraphs"] = sum(1 for p in page.css("p") if _text(p))

    if want & {"links_total", "links_internal", "links_external", "links_nofollow", "links_contact"}:
        data.update(_links(page, want, is_internal))

    if want & {"images", "alt_texts"}:
        imgs = page.xpath("//img[not(ancestor::noscript)]")  # skip <noscript> tracking pixels
        if "images" in want:
            data["images"] = len(imgs)
        if "alt_texts" in want:
            alts = [img.attrib.get("alt") for img in imgs]
            data["images_with_alt"] = sum(1 for a in alts if a is not None and a.strip())
            data["images_missing_alt"] = sum(1 for a in alts if a is None)
            data["images_empty_alt"] = sum(1 for a in alts if a is not None and not a.strip())

    if want & {"gtm", "google_ids", "meta_pixel", "other_pixels"}:
        data.update(_trackers(page, want))

    if "cms" in want:
        html = str(page.html_content)
        generator = clean(page.css('meta[name="generator" i]::attr(content)').get())
        found = [name for name, needles in CMS_SIGNATURES if any(n in html for n in needles)]
        if generator:
            found = _uniq([generator.split(" ")[0], *found])
        data["cms"] = found
        data["generator"] = generator
    if "schema" in want:
        data["schema_types"] = _schema_types(page)
    if "page_size" in want:
        data["html_kb"] = round(len(page.body or b"") / 1024, 1)

    return data


def _links(page: Page, want: set[str], is_internal: IsInternal) -> dict[str, Any]:
    total = 0
    internal: list[str] = []
    external: list[str] = []
    nofollow = mailto = tel = 0
    for a in page.css("a[href]"):
        href = (a.attrib.get("href") or "").strip()
        if not href:
            continue
        total += 1
        low = href.lower()
        if low.startswith("mailto:"):
            mailto += 1
            continue
        if low.startswith("tel:"):
            tel += 1
            continue
        if low.startswith(("#", "javascript:", "data:")):
            continue
        rel = (a.attrib.get("rel") or "").lower()
        if any(r in rel for r in ("nofollow", "sponsored", "ugc")):
            nofollow += 1
        url = page.urljoin(href).split("#")[0]
        if not url.startswith(("http://", "https://")):
            continue
        (internal if is_internal(url) else external).append(url)

    out: dict[str, Any] = {}
    if "links_total" in want:
        out["links"] = total
    if "links_internal" in want:
        out["internal_links"] = len(internal)
        out["internal_links_unique"] = len(set(internal))
    if "links_external" in want:
        out["external_links"] = len(external)
        out["external_links_unique"] = len(set(external))
        out["external_domains"] = _uniq((urlsplit(u).hostname or "").removeprefix("www.") for u in external)
    if "links_nofollow" in want:
        out["nofollow_links"] = nofollow
    if "links_contact" in want:
        out["mailto_links"] = mailto
        out["tel_links"] = tel
    return out


def _trackers(page: Page, want: set[str]) -> dict[str, Any]:
    code = "\n".join([*map(str, page.css("script::text").getall()), *map(str, page.css("script::attr(src)").getall())])

    def ids(key: str) -> list[str]:
        rx = TRACKERS[key]
        return _uniq(m.group(1) if rx.groups else m.group(0) for m in rx.finditer(code))

    out: dict[str, Any] = {}
    if "gtm" in want:
        out["gtm_ids"] = ids("gtm_ids")
    if "google_ids" in want:
        out["ga4_ids"] = ids("ga4_ids")
        out["ua_ids"] = ids("ua_ids")
        out["google_ads_ids"] = ids("google_ads_ids")
    if "meta_pixel" in want:
        noscript = META_PIXEL_NOSCRIPT.findall(str(page.html_content))
        out["meta_pixel_ids"] = _uniq([*ids("meta_pixel_ids"), *noscript])
    if "other_pixels" in want:
        for key in ("tiktok_pixel_ids", "linkedin_partner_ids", "hotjar_ids", "clarity_ids"):
            out[key] = ids(key)
    return out


def _schema_types(page: Page) -> list[str]:
    types: list[str] = []

    def walk(node: Any) -> None:
        if isinstance(node, list):
            for n in node:
                walk(n)
        elif isinstance(node, dict):
            t = node.get("@type")
            for v in t if isinstance(t, list) else [t]:
                if isinstance(v, str):
                    types.append(v)
            for v in node.values():
                if isinstance(v, (dict, list)):
                    walk(v)

    for raw in page.css('script[type="application/ld+json" i]::text').getall():
        try:
            walk(json.loads(str(raw)))
        except (ValueError, TypeError):
            continue
    return _uniq(types)
