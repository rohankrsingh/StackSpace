import { Client, Databases } from "appwrite";
import conf from "@/conf/conf";

export class AppwriteService {
  private client: Client;
  private databases: Databases;

  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(conf.appwriteEndpoint)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }

  // Room operations
  async createRoom(roomId: string, roomData: any) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteRoomsCollectionId,
        roomId,
        roomData
      );
    } catch (error) {
      console.error("Appwrite: Failed to create room", error);
      throw error;
    }
  }

  async getRoom(roomId: string) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteRoomsCollectionId,
        roomId
      );
    } catch (error) {
      console.error("Appwrite: Failed to fetch room", error);
      throw error;
    }
  }

  async updateRoom(roomId: string, updates: any) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteRoomsCollectionId,
        roomId,
        updates
      );
    } catch (error) {
      console.error("Appwrite: Failed to update room", error);
      throw error;
    }
  }

  async deleteRoom(roomId: string) {
    try {
      return await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteRoomsCollectionId,
        roomId
      );
    } catch (error) {
      console.error("Appwrite: Failed to delete room", error);
      throw error;
    }
  }
}

export const appwriteService = new AppwriteService();
export default appwriteService;
