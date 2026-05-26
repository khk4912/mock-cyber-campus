project = "MOA Firebase AppServer Docs"
author = "MOA"
copyright = "2026, MOA"

extensions = [
    "myst_parser",
    "sphinx_copybutton",
]

source_suffix = {
    ".rst": "restructuredtext",
    ".md": "markdown",
}

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

language = "ko"

html_theme = "furo"
html_title = "MOA Firebase AppServer Docs"

myst_enable_extensions = [
    "colon_fence",
    "deflist",
]
