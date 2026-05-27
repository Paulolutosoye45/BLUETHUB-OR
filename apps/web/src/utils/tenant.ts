export function getTenantId(): string {
  return (import.meta.env.VITE_TENANT_ID as string) || "green";
}

export const X_Tenant_ID = getTenantId();
