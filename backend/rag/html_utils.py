import re
from html.parser import HTMLParser
from typing import Optional, Tuple, List, Dict


class HTMLToTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._in_title = False
        self._in_law_title = False
        self._in_short_title = False
        self._title_chunks: List[str] = []
        self._law_title_chunks: List[str] = []
        self._short_title_chunks: List[str] = []
        self._text_chunks: List[str] = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "title":
            self._in_title = True
        if tag.lower() == "h1":
            # look for classes like 'erlasstitel' or 'botschafttitel'
            klass = None
            for k, v in attrs:
                if k.lower() == "class":
                    klass = v or ""
                    break
            if klass:
                classes = {c.strip() for c in klass.split()}
                if "erlasstitel" in classes or "botschafttitel" in classes:
                    self._in_law_title = True
        if tag.lower() == "h2":
            # short title often contains abbreviation in parentheses, class 'erlasskurztitel'
            klass = None
            for k, v in attrs:
                if k.lower() == "class":
                    klass = v or ""
                    break
            if klass:
                classes = {c.strip() for c in klass.split()}
                if "erlasskurztitel" in classes:
                    self._in_short_title = True

    def handle_endtag(self, tag):
        if tag.lower() == "title":
            self._in_title = False
        if tag.lower() == "h1" and self._in_law_title:
            self._in_law_title = False
        if tag.lower() == "h2" and self._in_short_title:
            self._in_short_title = False

    def handle_data(self, data):
        if not data:
            return
        if self._in_title:
            self._title_chunks.append(data)
        elif self._in_law_title:
            self._law_title_chunks.append(data)
        elif self._in_short_title:
            self._short_title_chunks.append(data)
        else:
            self._text_chunks.append(data)

    def get_title(self) -> str:
        title = " ".join(self._title_chunks).strip()
        title = re.sub(r"\s+", " ", title)
        return title

    def get_law_title(self) -> str:
        law_title = " ".join(self._law_title_chunks).strip()
        law_title = re.sub(r"\s+", " ", law_title)
        return law_title

    def get_short_title(self) -> str:
        short_title = " ".join(self._short_title_chunks).strip()
        short_title = re.sub(r"\s+", " ", short_title)
        return short_title

    def get_text(self) -> str:
        text = " ".join(self._text_chunks)
        text = re.sub(r"\s+", " ", text)
        return text.strip()


def extract_title_and_text(
    html_content: str, fallback_title: str
) -> Tuple[str, str, Optional[str], Optional[str]]:
    parser = HTMLToTextParser()
    parser.feed(html_content)
    # Prefer the law-specific title if present, then <title>, then fallback
    title = parser.get_law_title() or parser.get_title() or fallback_title
    text = parser.get_text()
    # Extract short title (often contains abbreviation in parentheses)
    short_title = parser.get_short_title() or None

    # Try to extract abbreviation from short title or title e.g. "(BV)", "(OR)", "(DSG)"
    abbr: Optional[str] = None
    sources = [short_title or "", title or "", parser.get_title() or ""]
    for src in sources:
        m = re.search(r"\(([A-ZÄÖÜ]{2,10})\)", src)
        if m:
            abbr = m.group(1)
            break

    return title, text, abbr, short_title


def extract_articles_from_text(text: str, default_abbr: Optional[str]) -> List[Dict]:
    """Very lightweight article segmentation from plain text.

    Returns a list of {ref: str, text: str} where ref looks like
    "Art. 16 BV" or "Art. 335b OR" if abbreviation can be inferred.
    """
    # Normalize dashes
    norm_text = text
    article_pattern = re.compile(
        r"Art\.\s*([0-9]+[a-z]?(?:\s*[–-]\s*[0-9]+[a-z]?)?)(?:\s+([A-ZÄÖÜ]{2,10}))?",
        re.IGNORECASE,
    )
    matches = list(article_pattern.finditer(norm_text))
    if not matches:
        return []

    spans: List[Dict] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(norm_text)
        body = norm_text[start:end].strip()
        art_num = m.group(1).strip()
        abbr = m.group(2) or default_abbr
        # Try to surface Abs. if available inside the body
        abs_match = re.search(r"(Abs\.|Absatz)\s*([0-9]+)", body)
        abs_suffix = f" Abs. {abs_match.group(2)}" if abs_match else ""
        if abbr:
            ref = f"Art. {art_num}{abs_suffix} {abbr}"
        else:
            ref = f"Art. {art_num}{abs_suffix}"
        spans.append({"ref": ref, "text": body})
    return spans
