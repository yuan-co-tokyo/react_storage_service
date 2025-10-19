import Link from "next/link";

import { MediaCreateForm } from "~/app/_components/media-create-form";
import { MediaGallery } from "~/app/_components/media-gallery";
import { StorageSummary } from "~/app/_components/storage-summary";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		void api.media.list.prefetch({ limit: 20 });
		void api.media.getStorageSummary.prefetch();
	}

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex max-w-6xl flex-1 flex-col items-center gap-12 px-4 py-16">
					<header className="text-center">
						<h1 className="font-extrabold text-4xl tracking-tight sm:text-[3.5rem]">
							モバイルフレンドリーなストレージ管理
						</h1>
						<p className="mt-4 text-lg text-white/80">
							共有や閲覧を意識したメディア管理基盤を Next.js と tRPC
							で構築しています。
						</p>
					</header>

					{session?.user ? (
						<div className="flex w-full flex-col items-center gap-10">
							<StorageSummary />
							<div className="flex w-full flex-col gap-8 lg:flex-row">
								<MediaCreateForm />
								<MediaGallery />
							</div>
						</div>
					) : (
						<section className="rounded-3xl bg-white/10 p-8 text-center text-white">
							<p className="mb-6 text-lg">
								ログインしてメディアのアップロードや共有を始めましょう。
							</p>
							<Link
								href="/api/auth/signin"
								className="rounded-full bg-white/20 px-10 py-3 font-semibold transition hover:bg-white/30"
							>
								サインイン
							</Link>
						</section>
					)}
				</div>
			</main>
		</HydrateClient>
	);
}
