FROM node:18-alpine3.15

# Sets the default working directory to /api which is where we copy the service files to.
WORKDIR /api

# Denotes to copy all files in the service to 'api' folder in the container
COPY . /api
COPY .env.local* /api


# Install service dependencies relevant for production builds skipping all development dependencies.
# RUN npm install --production --no-optional
RUN npm install

EXPOSE 8080/tcp

# Starts the service
CMD ["npm", "run", "prod"]