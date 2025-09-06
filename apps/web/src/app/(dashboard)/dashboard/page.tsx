"use client";

import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react";

export default function Dashboard() {
	const user = useUser();
	const privateData = useQuery(api.privateData.get);

	return (
		<>
			<Authenticated>
				<div className="p-4 space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold">Dashboard</h1>
							<p className="text-sm text-muted-foreground">Xin chào {user.user?.fullName}</p>
						</div>
						<UserButton />
					</div>

					<p className="text-sm text-muted-foreground">{privateData?.message}</p>

					<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						<ResourceLink href="/dashboard/resources/users" label="Người dùng" />
						<ResourceLink href="/dashboard/resources/customers" label="Khách hàng" />
						<ResourceLink href="/dashboard/resources/categories" label="Danh mục" />
						<ResourceLink href="/dashboard/resources/products" label="Sản phẩm" />
						<ResourceLink href="/dashboard/resources/images" label="Ảnh" />
						<ResourceLink href="/dashboard/resources/posts" label="Bài viết" />
						<ResourceLink href="/dashboard/resources/faqs" label="FAQ" />
						<ResourceLink href="/dashboard/resources/sliders" label="Slider" />
						<ResourceLink href="/dashboard/resources/service_websites" label="Dịch vụ website" />
						<ResourceLink href="/dashboard/resources/settings" label="Cấu hình" />
					</div>
				</div>
			</Authenticated>
			<Unauthenticated>
				<SignInButton />
			</Unauthenticated>
			<AuthLoading>
				<div>Loading...</div>
			</AuthLoading>
		</>
	);
}

function ResourceLink({ href, label }: { href: string; label: string }) {
	return (
		<a href={href} className="rounded-md border p-4 hover:bg-accent transition-colors">
			<div className="font-medium">{label}</div>
			<div className="text-xs text-muted-foreground">Quản lý {label.toLowerCase()}</div>
		</a>
	);
}

