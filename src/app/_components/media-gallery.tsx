"use client";

import { api } from "~/trpc/react";

export function MediaGallery() {
	const [items] = api.media.list.useSuspenseQuery({ limit: 20 });

	if (items.length === 0) {
		return (
			<section className="w-full max-w-4xl rounded-3xl bg-white/5 p-6 text-center text-white/80">
				まだメディアが登録されていません。アップロードを開始しましょう。
			</section>
		);
	}

	return (
		<section className="w-full max-w-4xl rounded-3xl bg-white/5 p-6">
			<h2 className="mb-4 font-semibold text-white text-xl">
				最近追加したメディア
			</h2>
			<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{items.map((item) => (
					<li
						key={item.id}
						className="rounded-2xl bg-white/10 p-4 text-white/80"
					>
						<h3 className="mb-2 truncate font-semibold text-lg text-white">
							{item.title}
						</h3>
						<p className="mb-2 line-clamp-3 min-h-[3rem] text-sm">
							{item.description ?? "説明は登録されていません"}
						</p>
						<dl className="space-y-1 text-xs">
							<div className="flex items-center justify-between">
								<dt className="text-white/60">MIME</dt>
								<dd>{item.mimeType}</dd>
							</div>
							<div className="flex items-center justify-between">
								<dt className="text-white/60">サイズ</dt>
								<dd>{(item.sizeBytes / 1024 ** 2).toFixed(2)} MB</dd>
							</div>
							<div className="flex items-center justify-between">
								<dt className="text-white/60">公開設定</dt>
								<dd>{item.isPublic ? "公開" : "非公開"}</dd>
							</div>
						</dl>
						{item.tags.length > 0 && (
							<ul className="mt-3 flex flex-wrap gap-2 text-xs">
								{item.tags.map((tag) => (
									<li
										key={tag}
										className="rounded-full bg-white/20 px-3 py-1 text-white"
									>
										#{tag}
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</section>
	);
}
