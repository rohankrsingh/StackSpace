const conf = {
  // Appwrite Configuration
  appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1",
  appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "project_id",
  appwriteDatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "database_id",
  appwriteRoomsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ROOMS_COLLECTION_ID || "rooms",

  // Socket.IO Configuration
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",

  // Application Configuration
  ideHostname: process.env.IDE_HOST || "localhost",
  idePortRange: {
    start: 4000,
    end: 6000,
  },

  // Docker Configuration
  dockerImage: "gitpod/openvscode-server:latest",
  workspacesDir: "./workspaces",
};

export default conf;
