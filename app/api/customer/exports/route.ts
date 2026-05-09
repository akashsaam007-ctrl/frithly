import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import {
  buildCustomerExportPayload,
  parseExportFilterState,
} from "@/lib/backend-api/customer-exports";

export async function GET(request: Request) {
  const customerContext = await getCurrentCustomerContext();

  if (!hasCustomerWorkspaceAccess(customerContext.customer)) {
    return Response.json(
      { error: "Your current plan does not include export access." },
      { status: 403 },
    );
  }

  const filters = parseExportFilterState(new URL(request.url).searchParams);
  const payload = await buildCustomerExportPayload(customerContext.companyName, filters);

  return new Response(payload.content, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${payload.filename}"`,
      "Content-Type": payload.contentType,
    },
    status: 200,
  });
}
