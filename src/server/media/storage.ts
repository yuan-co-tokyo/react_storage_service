import { z } from "zod";

/**
 * 1ユーザーあたりのデフォルトストレージ容量 (5GB)
 */
export const DEFAULT_USER_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

export const storageRecordSchema = z.object({
	sizeBytes: z.number().nonnegative(),
});

export type StorageRecord = z.infer<typeof storageRecordSchema>;

/**
 * 利用中のメディアデータから合計サイズと件数を算出する
 */
export function calculateStorageUsage(records: StorageRecord[]) {
	const safeRecords = records.map((record) =>
		storageRecordSchema.parse(record),
	);
	const totalBytes = safeRecords.reduce(
		(sum, record) => sum + record.sizeBytes,
		0,
	);

	return {
		totalBytes,
		totalItems: safeRecords.length,
	};
}

export const quotaStatusSchema = z.object({
	usedBytes: z.number().nonnegative(),
	quotaBytes: z.number().positive(),
});

export type QuotaStatusInput = z.infer<typeof quotaStatusSchema>;

/**
 * クォータに対する利用状況を返す
 */
export function calculateQuotaStatus(input: QuotaStatusInput) {
	const { usedBytes, quotaBytes } = quotaStatusSchema.parse(input);
	const remainingBytes = Math.max(quotaBytes - usedBytes, 0);
	const usageRatio = quotaBytes === 0 ? 0 : usedBytes / quotaBytes;

	return {
		usedBytes,
		quotaBytes,
		remainingBytes,
		usageRatio: usageRatio > 1 ? 1 : usageRatio,
		isOverQuota: usedBytes > quotaBytes,
	};
}
