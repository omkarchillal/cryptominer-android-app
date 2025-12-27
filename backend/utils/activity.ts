import { Activity, ActivityType } from '../models/Activity';

export async function logActivity(
    type: ActivityType,
    walletAddress: string,
    description: string,
    metadata?: any,
) {
    try {
        await Activity.create({
            type,
            walletAddress,
            description,
            metadata,
        });
    } catch (error) {
        // Non-blocking error logging
        console.error('Failed to log activity:', error);
    }
}
