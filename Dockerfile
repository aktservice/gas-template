FROM node:22-bookworm

# Install basic tools
RUN apt-get update && apt-get install -y \
    git \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /work

# Install clasp globally
RUN npm install -g @google/clasp

# Set up user permissions
RUN chown -R node:node /work
USER node

# Copy root package.json for dependency installation
COPY --chown=node:node package*.json ./
# Note: In a real workspace, you'd want to copy template package.jsons too for full npm install
# But for now, we'll assume developers will run npm install inside the container or we'll mount them.

CMD ["bash"]
