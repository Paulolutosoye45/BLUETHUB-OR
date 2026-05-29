import { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@bluethub/ui-kit";
import TitleBar from "@/shared/title-bar";
import {
  adminPermissionsService,
  getAllPermissionFlags,
  getPermissionName,
  type AdminPermissionDto,
} from "@/services/admin-permissions";
import { useAuthContext } from "@/contexts/auth-context";

const RegistrationAdmin = () => {
  const { user, isLoading: authLoading } = useAuthContext();

  const [permissions, setPermissions] = useState<AdminPermissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<number[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Check if current user is SuperAdministrator
  const isSuperAdmin = user?.roleName === "SuperAdministrator";

  const permissionFlags = getAllPermissionFlags();

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const { data } = await adminPermissionsService.getAllAdminPermissions(pageNumber, 10);
      const payload = (data as any)?.data ?? data;

      setPermissions(payload?.adminPermissions ?? []);
      setTotalPages(payload?.totalPages ?? 1);
      setTotalCount(payload?.totalCount ?? 0);
    } catch (error) {
      const err = error as { response?: { data?: { responseMessage?: string } }; message?: string };
      const message = err?.response?.data?.responseMessage ?? err?.message ?? "Failed to load admin permissions";
      toast.error(message);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPermissions();
  }, [pageNumber]);

  const startEdit = (admin: AdminPermissionDto) => {
    if (!isSuperAdmin) {
      toast.error("Only SuperAdministrators can edit permissions");
      return;
    }
    setEditingId(admin.id);
    setEditingPermissions([...admin.permissions]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingPermissions([]);
  };

  const togglePermission = (flag: number) => {
    setEditingPermissions((prev) =>
      prev.includes(flag)
        ? prev.filter((p) => p !== flag)
        : [...prev, flag]
    );
  };

  const savePermissions = async (admin: AdminPermissionDto) => {
    if (!isSuperAdmin) {
      toast.error("Only SuperAdministrators can assign permissions");
      return;
    }

    if (editingPermissions.length === 0) {
      toast.error("Select at least one permission");
      return;
    }

    setSavingId(admin.id);
    try {
      const { data } = await adminPermissionsService.assignAdminPermissions({
        adminUserId: admin.userId,
        permissions: editingPermissions,
      });

      const response = (data as any)?.data ?? {};
      toast.success(`Permissions updated for ${response.adminName}`);
      setEditingId(null);
      setEditingPermissions([]);
      void fetchPermissions();
    } catch (error) {
      const err = error as { response?: { data?: { responseMessage?: string } }; message?: string };
      const message = err?.response?.data?.responseMessage ?? err?.message ?? "Failed to update permissions";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-chestnut" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-5 sm:p-7">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-rose-900">Access Denied</h2>
              <p className="text-sm text-rose-700 mt-1">
                Only Super Administrators can manage admin permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 lg:p-7 font-poppins">
      <div className="lg:rounded-2xl border border-white/20 overflow-hidden bg-white/80 backdrop-blur-sm">
        <TitleBar title="Admin Permissions" hasVertical />

        <div className="p-3 sm:p-5 lg:p-7 space-y-5">
          {/* Header */}
          <div className="rounded-2xl bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff] border border-[#f3dccb] p-4 sm:p-5">
            <h1 className="text-lg sm:text-xl font-bold text-chestnut leading-tight">
              Manage Admin Permissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Assign and manage permissions for administrators in your school.
            </p>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 sm:px-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                  Admin Permissions ({totalCount})
                </h2>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
            </div>

            {!loading && permissions.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No admin permissions found.
              </div>
            )}

            {loading && (
              <div className="px-4 py-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-chestnut mx-auto" />
              </div>
            )}

            {!loading && permissions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Admin Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Permissions</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Created By</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {permissions.map((admin) => {
                      const isEditing = editingId === admin.id;

                      return (
                        <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-slate-800">{admin.userName}</p>
                              <p className="text-xs text-slate-500">{admin.roleName}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-slate-600 text-xs">{admin.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            {!isEditing ? (
                              <div className="flex flex-wrap gap-1">
                                {admin.permissions.length === 0 ? (
                                  <span className="text-xs text-slate-400">No permissions</span>
                                ) : (
                                  admin.permissions.map((perm) => (
                                    <span
                                      key={perm}
                                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 text-xs px-2 py-1"
                                    >
                                      {getPermissionName(perm)}
                                    </span>
                                  ))
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {permissionFlags.map(({ flag, name }) => (
                                  <label
                                    key={flag}
                                    className="flex items-center gap-2 text-xs cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editingPermissions.includes(flag)}
                                      onChange={() => togglePermission(flag)}
                                      className="rounded border-slate-300 text-chestnut focus:ring-chestnut"
                                    />
                                    <span className="text-slate-700">{name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-slate-600">{admin.createdByName || "-"}</p>
                            <p className="text-xs text-slate-400 mt-1">{admin.creationDate}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {!isEditing ? (
                              <Button
                                type="button"
                                onClick={() => startEdit(admin)}
                                className="h-8 rounded-lg bg-chestnut hover:bg-chestnut/90 text-white text-xs font-semibold px-3"
                              >
                                Edit
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 justify-center">
                                <Button
                                  type="button"
                                  onClick={() => savePermissions(admin)}
                                  disabled={savingId === admin.id}
                                  className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2 disabled:bg-slate-300"
                                >
                                  {savingId === admin.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  onClick={cancelEdit}
                                  disabled={savingId === admin.id}
                                  className="h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-2 disabled:opacity-50"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-4 py-4 sm:px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Page {pageNumber} of {totalPages} ({totalCount} total)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber === 1}
                    className="h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold px-2 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const page = pageNumber - 2 + i;
                    if (page < 1 || page > totalPages) return null;

                    return (
                      <Button
                        key={page}
                        type="button"
                        onClick={() => setPageNumber(page)}
                        className={`h-8 rounded-lg text-xs font-semibold px-3 ${
                          pageNumber === page
                            ? "bg-chestnut text-white"
                            : "border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}

                  <Button
                    type="button"
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNumber === totalPages}
                    className="h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold px-2 disabled:opacity-50"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-700">i</span>
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-medium">Available Permissions</p>
                <ul className="mt-2 space-y-1 text-xs">
                  {permissionFlags.map(({ flag, name }) => (
                    <li key={flag}>{name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationAdmin;
