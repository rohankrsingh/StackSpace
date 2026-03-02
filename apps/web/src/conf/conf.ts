const conf = {
  // Appwrite Configuration
  appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "http://localhost/v1",
  appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "stackspace",
  appwriteDatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "stackspace_db",
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
