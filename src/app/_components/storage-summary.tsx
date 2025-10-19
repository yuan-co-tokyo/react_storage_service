"use client";

import { api } from "~/trpc/react";

export function StorageSummary() {
	const [summary] = api.media.getStorageSummary.useSuspenseQuery();

	const usagePercent = Math.round(summary.usageRatio * 100);
	const usedGb = (summary.usedBytes / 1024 ** 3).toFixed(2);
	const quotaGb = (summary.quotaBytes / 1024 ** 3).toFixed(2);

	return (
		<section className="w-full max-w-2xl rounded-3xl bg-white/10 p-6 shadow-lg backdrop-blur">
			<header className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-white text-xl">ストレージ状況</h2>
				<span className="text-sm text-white/70">
					{summary.totalItems} 件のメディア
				</span>
			</header>
			<div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-white/20">
				<div
					className="h-full rounded-full bg-[hsl(280,100%,70%)] transition-all"
					style={{ width: `${Math.min(usagePercent, 100)}%` }}
					aria-hidden="true"
				/>
			</div>
			<div className="flex flex-col gap-1 text-sm text-white/80">
				<p>
					使用量: <span className="font-semibold text-white">{usedGb} GB</span>{" "}
					/ {quotaGb} GB
				</p>
				{summary.isOverQuota ? (
					<p className="text-red-200">
						上限を超過しています。不要なファイルを削除してください。
					</p>
				) : (
					<p>
						残り {(summary.remainingBytes / 1024 ** 3 || 0).toFixed(2)} GB
						利用できます。
					</p>
				)}
			</div>
		</section>
	);
}
