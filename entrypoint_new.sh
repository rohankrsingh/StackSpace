#!/bin/bash
ROOM_ID=${ROOM_ID:-default}
WORKSPACE=/home/workspace/${ROOM_ID}
echo "[entrypoint] Starting room=${ROOM_ID} workspace=${WORKSPACE}"

# Fetch Public IP
PUBLIC_IP=$(curl -sf --max-time 2 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
export PUBLIC_IP=${PUBLIC_IP:-localhost}

# Crucial for OpenVSCode to handle "Open in Browser" and rewrite terminal links.
# We use sslip.io to provide a hostname-like structure, which VS Code's browser-side
# link provider handles more reliably than a literal IP.
export VSCODE_PROXY_URI="http://{{port}}.${PUBLIC_IP}.sslip.io/"

# Port forwarding strategy
export VSCODE_PORT_FORWARDING_STRATEGY=uri

cat <<EOF > /etc/profile.d/stackspace.sh
export PUBLIC_IP=${PUBLIC_IP}
export VSCODE_PROXY_URI="http://{{port}}.${PUBLIC_IP}.sslip.io/"
export VSCODE_PORT_FORWARDING_STRATEGY=uri
export HOST=0.0.0.0
export PORT=3001
EOF
chmod +x /etc/profile.d/stackspace.sh

echo "source /etc/profile.d/stackspace.sh" >> /etc/bash.bashrc
echo "source /etc/profile.d/stackspace.sh" >> /root/.bashrc
echo "cd ${WORKSPACE}" >> /etc/bash.bashrc
echo "cd ${WORKSPACE}" >> /root/.bashrc

mkdir -p "${WORKSPACE}/.vscode" "${WORKSPACE}/.openvscode-server/User" "${WORKSPACE}/.openvscode-server/Machine"

# Force critical settings into Machine settings to override anything in User settings
# This ensures existing rooms get the fix without needing to delete their settings.json
cat <<EOF > "${WORKSPACE}/.openvscode-server/Machine/settings.json"
{
    "remote.autoForwardPorts": true,
    "remote.autoForwardPortsSource": "process",
    "remote.forwardedPorts.useLocalhost": false,
    "remote.localPortHost": "localhost",
    "terminal.integrated.links.localPortHost": "localhost",
    "remote.restoreForwardedPorts": true,
    "remote.forwardedPorts.onOutput": "notify"
}
EOF

# Copy defaults for other files if they don't exist
for dest in "${WORKSPACE}/.vscode/settings.json" "${WORKSPACE}/.openvscode-server/User/settings.json"; do
    [ -f "$dest" ] || cp -f /opt/collabcode-defaults/settings.json "$dest"
done

exec /opt/code-server/bin/openvscode-server --host 0.0.0.0 --port 3000 --without-connection-token --server-data-dir "${WORKSPACE}/.openvscode-server" --user-data-dir "${WORKSPACE}/.openvscode-server" "${WORKSPACE}"
