"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataApi, ChangePasswordPayload, UserProfile } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: dataApi.getUserProfile,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      bio: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const avatarUrl = useMemo(() => {
    return (
      previewUrl ||
      profile?.profileImage?.url ||
      (session?.user as any)?.profileImage?.url ||
      (session?.user as any)?.image ||
      ""
    );
  }, [previewUrl, profile, session]);

  useEffect(() => {
    if (!profile) return;

    profileForm.reset({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      bio: profile.bio || "",
    });
  }, [profile, profileForm]);

  // cleanup object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: FormData) => dataApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setPreviewUrl("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => dataApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password updated");
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to change password");
    },
  });

  const handleProfileSubmit = (values: ProfileFormValues) => {
    const fd = new FormData();

    // add text fields (all the fields you listed)
    fd.append("name", values.name || "");
    fd.append("phone", values.phone || "");
    fd.append("address", values.address || "");
    fd.append("bio", values.bio || "");

    // image file (avatar)
    if (selectedFile) {
      fd.append("avatar", selectedFile);
    }

    updateProfileMutation.mutate(fd);
  };

  const handlePasswordSubmit = (values: PasswordFormValues) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
  };

  const isProfileSaving = updateProfileMutation.isPending;
  const isPasswordSaving = changePasswordMutation.isPending;

  const onPickImage = (file?: File | null) => {
    if (!file) return;

    // basic validation (optional)
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB");
      return;
    }

    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16 space-y-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-28 w-28 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile?.name || "Profile avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl font-semibold text-slate-600">
                  {profile?.name?.slice(0, 1)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Upload button */}
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickImage(e.target.files?.[0])}
                  disabled={profileLoading || isProfileSaving}
                />
                <span className="px-4 h-10 inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-sm font-semibold hover:opacity-90 transition">
                  Update photo
                </span>
              </label>

              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1e293b]">
                Personal Information
              </h1>
              <p className="text-slate-500">
                Update your details and keep your account secure.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[#1e293b] text-center">
                Profile Details
              </h2>
              <p className="text-sm text-slate-500 text-center">
                These details will be used across your Solace experience.
              </p>
            </div>

            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Full Name"
                            className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                            {...field}
                            disabled={profileLoading || isProfileSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email"
                            className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Phone Number"
                            className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                            {...field}
                            disabled={profileLoading || isProfileSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Address"
                            className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                            {...field}
                            disabled={profileLoading || isProfileSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Bio"
                          className="min-h-[120px] bg-slate-50 border-slate-200 rounded-lg"
                          {...field}
                          disabled={profileLoading || isProfileSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="min-w-[160px] h-11 rounded-full px-8 text-white font-semibold"
                    style={{
                      background: "linear-gradient(0deg, #263451 0%, #00297E 100%)",
                    }}
                    disabled={profileLoading || isProfileSaving}
                  >
                    {isProfileSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </section>

          {/* Password */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[#1e293b] text-center">
                Change Password
              </h2>
              <p className="text-sm text-slate-500 text-center">
                Keep your account secure by using a strong password.
              </p>
            </div>

            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Current Password"
                          className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                          {...field}
                          disabled={isPasswordSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="New Password"
                          className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                          {...field}
                          disabled={isPasswordSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm New Password"
                          className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                          {...field}
                          disabled={isPasswordSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center pt-2">
                  <Button
                    type="submit"
                    className="min-w-[160px] h-11 rounded-full px-8 text-white font-semibold"
                    style={{
                      background: "linear-gradient(0deg, #263451 0%, #00297E 100%)",
                    }}
                    disabled={isPasswordSaving}
                  >
                    {isPasswordSaving ? "Saving..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </Form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
