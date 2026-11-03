# VIRTUAL-REVIEWS.md — moved

The pre-submission review protocol now lives in
**[`template/VIRTUAL-REVIEWERS.md`](template/VIRTUAL-REVIEWERS.md)**, so that `init` installs it in
every project and `upgrade` keeps it current. Inside a project it is
`article-docs/VIRTUAL-REVIEWERS.md`, run with `/artdocs:virtual-review`.

It is no longer specific to one field. It classifies the article (type, field, format), reviews
it with a six-role panel across nine core domains plus packs, and gives each domain a Strong
Accept / Weak Accept / Weak Reject / Strong Reject verdict. The deterministic checks are
`artdocs review lint`.
