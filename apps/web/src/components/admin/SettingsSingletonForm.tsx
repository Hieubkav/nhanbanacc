"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ImageLibraryPicker from "@/components/admin/ImageLibraryPicker";
import { ImagePreviewThumb } from "@/components/admin/ImagePreviewThumb";

type FormState = {
  siteName?: string;
  slogan?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoId?: string;
  faviconId?: string;
  seoDefaultTitle?: string;
  seoDefaultDescription?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  uiPrimaryColor?: string;
};

const META = {
  siteName: { label: "Tên website", placeholder: "Công ty ABC", help: "Tên hiển thị ở tiêu đề/header." },
  slogan: { label: "Slogan", placeholder: "Giải pháp tối ưu cho bạn" },
  phone: { label: "Số điện thoại", placeholder: "0909123456" },
  email: { label: "Email", placeholder: "hello@example.com" },
  address: { label: "Địa chỉ", placeholder: "123 Đường A, Quận B, TP C" },
  logoId: { label: "Logo" },
  faviconId: { label: "Favicon" },
  seoDefaultTitle: { label: "SEO - Default Title", placeholder: "Trang chủ – Công ty ABC" },
  seoDefaultDescription: { label: "SEO - Default Description", placeholder: "Mô tả ngắn website" },
  socialFacebook: { label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  socialYoutube: { label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
  socialTiktok: { label: "TikTok", placeholder: "https://www.tiktok.com/@yourid" },
  uiPrimaryColor: { label: "Màu chủ đạo", placeholder: "#0ea5e9" },
} as const;

export default function SettingsSingletonForm() {
  const one = useQuery(api.settings.getOne as any, {} as any);
  const save = useMutation(api.settings.saveOne);

  const [form, setForm] = useState<FormState>({});
  const [openPicker, setOpenPicker] = useState<null | keyof FormState>(null);

  // Đổ dữ liệu settings => form
  useEffect(() => {
    if (one === undefined) return; // loading
    if (one === null) {
      setForm({});
      return;
    }
    const copy: any = { ...one };
    delete copy._id; delete copy._creationTime;
    setForm(copy as FormState);
  }, [one]);

  const onSave = async () => {
    try {
      await save({ patch: form as any });
      toast.success("Đã lưu cấu hình");
    } catch (err: any) {
      toast.error(err?.message ?? "Lỗi khi lưu cấu hình");
    }
  };

  return (
    <div className="space-y-6">
      {/* Nhóm: Site */}
      <Section title="Thông tin chung">
        <Field label={META.siteName.label} help={META.siteName.help} example={META.siteName.placeholder}>
          <Input value={form.siteName ?? ""} placeholder={META.siteName.placeholder} onChange={(e) => setForm((s) => ({ ...s, siteName: e.target.value }))} />
        </Field>
        <Field label={META.slogan.label} example={META.slogan.placeholder}>
          <Input value={form.slogan ?? ""} placeholder={META.slogan.placeholder} onChange={(e) => setForm((s) => ({ ...s, slogan: e.target.value }))} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={META.phone.label} example={META.phone.placeholder}>
            <Input value={form.phone ?? ""} placeholder={META.phone.placeholder} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
          </Field>
          <Field label={META.email.label} example={META.email.placeholder}>
            <Input value={form.email ?? ""} placeholder={META.email.placeholder} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
          </Field>
        </div>
        <Field label={META.address.label} example={META.address.placeholder}>
          <Textarea value={form.address ?? ""} placeholder={META.address.placeholder} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePickField
            label={META.logoId.label}
            value={form.logoId}
            onPick={(id) => setForm((s) => ({ ...s, logoId: id }))}
            onClear={() => setForm((s) => ({ ...s, logoId: undefined }))}
            open={openPicker === "logoId"}
            onOpen={() => setOpenPicker("logoId")}
            onClose={() => setOpenPicker(null)}
          />
          <ImagePickField
            label={META.faviconId.label}
            value={form.faviconId}
            onPick={(id) => setForm((s) => ({ ...s, faviconId: id }))}
            onClear={() => setForm((s) => ({ ...s, faviconId: undefined }))}
            open={openPicker === "faviconId"}
            onOpen={() => setOpenPicker("faviconId")}
            onClose={() => setOpenPicker(null)}
          />
        </div>
      </Section>

      {/* Nhóm: SEO */}
      <Section title="SEO mặc định">
        <Field label={META.seoDefaultTitle.label} example={META.seoDefaultTitle.placeholder}>
          <Input value={form.seoDefaultTitle ?? ""} placeholder={META.seoDefaultTitle.placeholder} onChange={(e) => setForm((s) => ({ ...s, seoDefaultTitle: e.target.value }))} />
        </Field>
        <Field label={META.seoDefaultDescription.label} example={META.seoDefaultDescription.placeholder}>
          <Textarea value={form.seoDefaultDescription ?? ""} placeholder={META.seoDefaultDescription.placeholder} onChange={(e) => setForm((s) => ({ ...s, seoDefaultDescription: e.target.value }))} />
        </Field>
      </Section>

      {/* Nhóm: Social */}
      <Section title="Mạng xã hội">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={META.socialFacebook.label} example={META.socialFacebook.placeholder}>
            <Input value={form.socialFacebook ?? ""} placeholder={META.socialFacebook.placeholder} onChange={(e) => setForm((s) => ({ ...s, socialFacebook: e.target.value }))} />
          </Field>
          <Field label={META.socialYoutube.label} example={META.socialYoutube.placeholder}>
            <Input value={form.socialYoutube ?? ""} placeholder={META.socialYoutube.placeholder} onChange={(e) => setForm((s) => ({ ...s, socialYoutube: e.target.value }))} />
          </Field>
          <Field label={META.socialTiktok.label} example={META.socialTiktok.placeholder}>
            <Input value={form.socialTiktok ?? ""} placeholder={META.socialTiktok.placeholder} onChange={(e) => setForm((s) => ({ ...s, socialTiktok: e.target.value }))} />
          </Field>
        </div>
      </Section>

      {/* Nhóm: UI */}
      <Section title="Giao diện">
        <Field label={META.uiPrimaryColor.label} example={META.uiPrimaryColor.placeholder}>
          <Input value={form.uiPrimaryColor ?? ""} placeholder={META.uiPrimaryColor.placeholder} onChange={(e) => setForm((s) => ({ ...s, uiPrimaryColor: e.target.value }))} />
        </Field>
      </Section>

      <div className="flex items-center gap-2">
        <Button onClick={onSave}>Lưu cấu hình</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-3 font-medium">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Field({ label, help, example, children }: { label: string; help?: string; example?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {(help || example) && (
        <p className="text-xs text-muted-foreground">
          {help}
          {example ? <span className="block">Ví dụ: {example}</span> : null}
        </p>
      )}
    </div>
  );
}

function ImagePickField({ label, value, onPick, onClear, open, onOpen, onClose }: {
  label: string;
  value?: string;
  onPick: (id?: string) => void;
  onClear: () => void;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <ImagePreviewThumb id={value} size={56} />
        <div className="min-w-0 flex-1 text-xs text-muted-foreground">
          {value ? <div className="truncate">ID: {String(value)}</div> : <div>Chưa chọn</div>}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onOpen}>Chọn</Button>
          {value ? <Button type="button" variant="outline" onClick={onClear}>Bỏ chọn</Button> : null}
        </div>
      </div>
      <ImageLibraryPicker
        open={open}
        onClose={onClose}
        onConfirm={(ids) => { onPick(ids[0]); onClose(); }}
        initialSelected={value ? [value] : []}
        pageSize={12}
      />
    </div>
  );
}

