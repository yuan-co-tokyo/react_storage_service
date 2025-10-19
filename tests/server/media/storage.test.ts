import { strict as assert } from "node:assert";
import test from "node:test";

import {
	DEFAULT_USER_STORAGE_QUOTA_BYTES,
	calculateQuotaStatus,
	calculateStorageUsage,
} from "../../../src/server/media/storage.js";

test("calculateStorageUsage: 合計バイト数と件数を計算できる", () => {
	const result = calculateStorageUsage([
		{ sizeBytes: 1024 },
		{ sizeBytes: 2048 },
		{ sizeBytes: 0 },
	]);

	assert.equal(result.totalBytes, 3072);
	assert.equal(result.totalItems, 3);
});

test("calculateStorageUsage: 不正なレコードがあれば例外を投げる", () => {
	assert.throws(() => calculateStorageUsage([{ sizeBytes: -1 }]));
});

test("calculateQuotaStatus: クォータ内の状態を返す", () => {
	const result = calculateQuotaStatus({
		usedBytes: 1024,
		quotaBytes: 2048,
	});

	assert.equal(result.remainingBytes, 1024);
	assert.ok(Math.abs(result.usageRatio - 0.5) < Number.EPSILON * 10);
	assert.equal(result.isOverQuota, false);
});

test("calculateQuotaStatus: 超過分がある場合でも安全に計算する", () => {
	const result = calculateQuotaStatus({
		usedBytes: DEFAULT_USER_STORAGE_QUOTA_BYTES * 1.2,
		quotaBytes: DEFAULT_USER_STORAGE_QUOTA_BYTES,
	});

	assert.equal(result.remainingBytes, 0);
	assert.equal(result.usageRatio, 1);
	assert.equal(result.isOverQuota, true);
});
