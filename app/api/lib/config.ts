// Server-side configuration
export const serverConfig = {
  ENOKI_SECRET_KEY: process.env.ENOKI_SECRET_KEY,
  ENOKI_NETWORK: process.env.ENOKI_NETWORK || 'testnet',
  PACKAGE_ID: process.env.VITE_PACKAGE_ID_ADDR,
  ADMIN_ADDRESS: process.env.ADMIN_ADDRESS,
};

// Validate required environment variables
if (!serverConfig.ENOKI_SECRET_KEY) {
  throw new Error("ENOKI_SECRET_KEY environment variable is required");
}

if (!serverConfig.PACKAGE_ID) {
  throw new Error("VITE_PACKAGE_ID environment variable is required");
}