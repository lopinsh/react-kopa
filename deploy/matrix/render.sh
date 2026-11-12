#!/usr/bin/env bash
# Fills the Synapse templates from MATRIX_* env into <out-dir> (git-ignored). Usage: render.sh <out-dir>
set -eu
out="${1:?usage: render.sh <out-dir>}"
here="$(cd "$(dirname "$0")" && pwd)"
: "${MATRIX_SERVER_NAME:?}" "${MATRIX_PUBLIC_URL:?}" "${MATRIX_AS_TOKEN:?}" "${MATRIX_HS_TOKEN:?}"
: "${MATRIX_DB_PASSWORD:?}" "${MATRIX_MACAROON_SECRET:?}" "${MATRIX_FORM_SECRET:?}" "${MATRIX_DB_HOST:?}"
guests="${MATRIX_ALLOW_GUESTS:-false}"
image="${MATRIX_IMAGE:-ghcr.io/element-hq/synapse:v1.165.0}"
mkdir -p "$out"
re="${MATRIX_SERVER_NAME//./\\\\.}"
fill() {
  sed -e "s|__SERVER_NAME_RE__|$re|g" -e "s|__SERVER_NAME__|$MATRIX_SERVER_NAME|g" \
      -e "s|__PUBLIC_URL__|${MATRIX_PUBLIC_URL%/}/|g" -e "s|__AS_TOKEN__|$MATRIX_AS_TOKEN|g" \
      -e "s|__HS_TOKEN__|$MATRIX_HS_TOKEN|g" -e "s|__DB_PASSWORD__|$MATRIX_DB_PASSWORD|g" \
      -e "s|__MACAROON_SECRET__|$MATRIX_MACAROON_SECRET|g" -e "s|__FORM_SECRET__|$MATRIX_FORM_SECRET|g" \
      -e "s|__DB_HOST__|$MATRIX_DB_HOST|g" -e "s|__ALLOW_GUESTS__|$guests|g" "$1"
}
fill "$here/homeserver.template.yaml" > "$out/homeserver.yaml"
fill "$here/appservice.template.yaml" > "$out/ejam-appservice.yaml"
cp "$here/ejam_rules.py" "$out/ejam_rules.py"
cat > "$out/log.config" <<'LOG'
version: 1
formatters:
  plain: { format: "%(asctime)s %(levelname)s %(name)s: %(message)s" }
handlers:
  console: { class: logging.StreamHandler, formatter: plain }
root: { level: WARNING, handlers: [console] }
disable_existing_loggers: false
LOG
if [ ! -f "$out/signing.key" ]; then
  # the image ships /usr/local/bin/generate_signing_key (verified on v1.165.0)
  abs="$(cd "$out" && { pwd -W 2>/dev/null || pwd; })"
  MSYS_NO_PATHCONV=1 docker run --rm --entrypoint sh -v "$abs:/data" "$image" -c "generate_signing_key -o /data/signing.key && chmod 644 /data/signing.key"
  # chmod inside the container: the synapse process runs as UID 991, not as root
fi
echo "rendered into $out"
