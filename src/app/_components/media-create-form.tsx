"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { api } from "~/trpc/react";

export function MediaCreateForm() {
	const utils = api.useUtils();
	const createMedia = api.media.create.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.media.list.invalidate(),
				utils.media.getStorageSummary.invalidate(),
			]);
			setTitle("");
			setDescription("");
			setMimeType("image/jpeg");
			setSizeBytes(1024);
			setTags("");
			setIsPublic(false);
		},
	});

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [mimeType, setMimeType] = useState("image/jpeg");
	const [sizeBytes, setSizeBytes] = useState(1024);
	const [tags, setTags] = useState("");
	const [isPublic, setIsPublic] = useState(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		createMedia.mutate({
			title,
			description: description.length > 0 ? description : undefined,
			mimeType,
			sizeBytes,
			isPublic,
			tags:
				tags.length > 0
					? tags
							.split(",")
							.map((tag) => tag.trim())
							.filter(Boolean)
					: undefined,
		});
	};

	return (
		<section className="w-full max-w-2xl rounded-3xl bg-white/10 p-6 text-white">
			<h2 className="mb-4 font-semibold text-xl">メタデータ登録</h2>
			<form className="space-y-4" onSubmit={handleSubmit}>
				<label className="block text-sm">
					<span className="mb-1 inline-block text-white/70">タイトル</span>
					<input
						className="w-full rounded-xl bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring"
						value={title}
						required
						onChange={(event) => setTitle(event.target.value)}
					/>
				</label>
				<label className="block text-sm">
					<span className="mb-1 inline-block text-white/70">説明</span>
					<textarea
						className="h-24 w-full rounded-xl bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
				</label>
				<div className="grid gap-4 sm:grid-cols-2">
					<label className="block text-sm">
						<span className="mb-1 inline-block text-white/70">MIMEタイプ</span>
						<input
							className="w-full rounded-xl bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring"
							value={mimeType}
							required
							onChange={(event) => setMimeType(event.target.value)}
						/>
					</label>
					<label className="block text-sm">
						<span className="mb-1 inline-block text-white/70">
							サイズ (バイト)
						</span>
						<input
							type="number"
							min={1}
							className="w-full rounded-xl bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring"
							value={sizeBytes}
							required
							onChange={(event) => setSizeBytes(Number(event.target.value))}
						/>
					</label>
				</div>
				<label className="block text-sm">
					<span className="mb-1 inline-block text-white/70">
						タグ (カンマ区切り)
					</span>
					<input
						className="w-full rounded-xl bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring"
						value={tags}
						onChange={(event) => setTags(event.target.value)}
					/>
				</label>
				<label className="flex items-center gap-2 text-sm text-white/80">
					<input
						type="checkbox"
						checked={isPublic}
						onChange={(event) => setIsPublic(event.target.checked)}
						className="h-4 w-4"
					/>
					公開設定にする
				</label>
				{createMedia.error && (
					<p className="text-red-200 text-sm">{createMedia.error.message}</p>
				)}
				<button
					type="submit"
					className="w-full rounded-2xl bg-[hsl(280,100%,70%)] px-4 py-2 font-semibold text-white shadow transition hover:bg-[hsl(280,80%,65%)]"
					disabled={createMedia.isPending}
				>
					{createMedia.isPending ? "登録中..." : "メタデータを登録"}
				</button>
			</form>
		</section>
	);
}
