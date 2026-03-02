FROM debian:bookworm-slim

LABEL maintainer="CollabCode"
LABEL description="OpenVSCode Server with GCC C++ development environment (Debian Bookworm stable)"

# Install system dependencies and C++ build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    build-essential \
    g++ \
    gcc \
    gdb \
    valgrind \
    cmake \
    make \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install OpenVSCode Server
RUN mkdir -p /opt/code-server && \
    curl -fsSL https://github.com/gitpod-io/openvscode-server/releases/download/openvscode-server-v1.106.3/openvscode-server-v1.106.3-linux-x64.tar.gz | \
    tar -xz --strip-components=1 -C /opt/code-server

# Create workspace directory
RUN mkdir -p /home/workspace && chmod 777 /home/workspace

# Set environment variables
ENV OPENVSCODE_SERVER_ROOT="/opt/code-server"
ENV OPENVSCODE="${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server"
ENV HOME="/home/workspace"

# Create default settings file in a persistent location (not workspace)
RUN mkdir -p /opt/collabcode-defaults \
    && echo '{\n\
    "files.autoSave": "afterDelay",\n\
    "files.autoSaveDelay": 500,\n\
    "workbench.colorTheme": "Default Dark Modern",\n\
    "editor.formatOnPaste": true,\n\
    "editor.mouseWheelZoom": true,\n\
    "editor.wordWrap": "on",\n\
    "editor.aiStats.enabled": false,\n\
    "editor.autoIndentOnPaste": true,\n\
    "editor.cursorSmoothCaretAnimation": "on",\n\
    "workbench.secondarySideBar.defaultVisibility": "hidden",\n\
    "workbench.iconTheme": "vs-seti",\n\
    "workbench.statusBar.visible": true,\n\
    "workbench.view.alwaysShowHeaderActions": true,\n\
    "window.autoDetectColorScheme": false,\n\
    "chat.agent.enabled": false,\n\
    "terminal.integrated.middleClickBehavior": "paste",\n\
    "window.menuBarVisibility": "classic",\n\
    "terminal.integrated.cwd": "/home/workspace",\n\
    "terminal.integrated.defaultProfile.linux": "bash"\n\
    }' > /opt/collabcode-defaults/settings.json

# Create entrypoint script to bootstrap settings
RUN echo '#!/bin/bash\n\
    \n\
    # Bootstrap Workspace Settings\n\
    mkdir -p /home/workspace/.vscode\n\
    cp -f /opt/collabcode-defaults/settings.json /home/workspace/.vscode/settings.json\n\
    \n\
    # Bootstrap User/Machine Settings (if data dir is in workspace)\n\
    mkdir -p /home/workspace/.openvscode-server/User\n\
    mkdir -p /home/workspace/.openvscode-server/Machine\n\
    cp -f /opt/collabcode-defaults/settings.json /home/workspace/.openvscode-server/User/settings.json\n\
    cp -f /opt/collabcode-defaults/settings.json /home/workspace/.openvscode-server/Machine/settings.json\n\
    \n\
    # Fix permissions (assuming running as root, ownership might be needed if switching user)\n\
    # But we are root in this container, so it is fine.\n\
    \n\
    exec "$@"\n\
    ' > /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

# Ensure properly configured shell environment
RUN echo 'if [ -d "/home/workspace" ]; then cd /home/workspace; fi' >> /etc/bash.bashrc && \
    echo 'if [ -d "/home/workspace" ]; then cd /home/workspace; fi' >> /root/.bashrc

WORKDIR /home/workspace

EXPOSE 3000

SHELL ["/bin/bash", "-c"]
RUN \
    # Create a tmp dir for upgrading
    mkdir -p /tmp/exts && cd /tmp/exts && \
    # List the extensions
    exts=(\
    # Universal
    gitpod.gitpod-theme \
    pkief.material-icon-theme \
    eamodio.gitlens \
    usernamehw.errorlens \
    oderwat.indent-rainbow \
    # C/C++
    ms-vscode.cpptools \
    llvm-vs-code-extensions.vscode-clangd \
    ms-vscode.cmake-tools \
    vadimcn.vscode-lldb \
    )\
    # Install the extensions
    && for ext in "${exts[@]}"; do ${OPENVSCODE} --install-extension "${ext}"; done

WORKDIR /home/workspace
ENTRYPOINT ["/usr/local/bin/entrypoint.sh", "/opt/code-server/bin/openvscode-server", "--host", "0.0.0.0", "--port", "3000", "--server-data-dir", "/home/workspace/.openvscode-server", "--user-data-dir", "/home/workspace/.openvscode-server", "/home/workspace"]
