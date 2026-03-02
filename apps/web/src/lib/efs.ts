import { EFSClient, CreateAccessPointCommand, DeleteAccessPointCommand } from "@aws-sdk/client-efs";

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";

let _efs: EFSClient | null = null;
export function getEfsClient(): EFSClient {
    if (!_efs) {
        _efs = new EFSClient({ region: AWS_REGION });
    }
    return _efs;
}

/**
 * Creates an EFS Access Point specifically for a single room.
 * Fargate tasks can mount this to completely isolate their storage
 * from other rooms on the same shared EFS volume.
 */
export async function getOrCreateRoomAccessPoint(
    roomId: string,
    fileSystemId: string
): Promise<string> {
    const efs = getEfsClient();

    console.log(`[EFS] Creating Access Point for room=${roomId} on fs=${fileSystemId}`);

    // Create an Access Point that roots the user at /rooms/${roomId}
    // AWS will automatically create this directory on the EFS volume if it doesn't exist.
    const result = await efs.send(
        new CreateAccessPointCommand({
            FileSystemId: fileSystemId,
            ClientToken: roomId, // Idempotent based on room ID
            Tags: [
                { Key: "Name", Value: `stackspace-room-${roomId}` },
                { Key: "stackspace:roomId", Value: roomId },
            ],
            RootDirectory: {
                Path: `/stackspace/rooms/${roomId}`,
                CreationInfo: {
                    OwnerUid: 1000,
                    OwnerGid: 1000,
                    Permissions: "0755", // Only this room can access
                },
            },
            // Force all writes from the container (even root) to trace back to this UID/GID
            PosixUser: {
                Uid: 1000,
                Gid: 1000,
            },
        })
    );

    if (!result.AccessPointId) {
        throw new Error("Failed to create EFS Access Point");
    }

    console.log(`[EFS] Access Point created: ${result.AccessPointId} for room=${roomId}`);
    return result.AccessPointId;
}

/**
 * Deletes the Access Point for a room.
 * (Note: Does not delete the data on the EFS volume, just the mounting endpoint)
 */
export async function deleteRoomAccessPoint(accessPointId: string): Promise<void> {
    const efs = getEfsClient();
    try {
        await efs.send(
            new DeleteAccessPointCommand({
                AccessPointId: accessPointId,
            })
        );
        console.log(`[EFS] Deleted Access Point ${accessPointId}`);
    } catch (e) {
        console.warn(`[EFS] Failed to delete Access Point ${accessPointId}:`, e);
    }
}
