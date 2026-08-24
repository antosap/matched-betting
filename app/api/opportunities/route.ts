import { NextRequest, NextResponse } from "next/server";
import { getLiveOpportunities } from "@/lib/providers/opportunityProvider";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const backStake = Number(searchParams.get("stake") ?? "100");
  const minRoi = Number(searchParams.get("minRoi") ?? "0");

  if (!Number.isFinite(backStake) || backStake <= 0) {
    return NextResponse.json(
      { error: "Invalid stake" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(minRoi)) {
    return NextResponse.json(
      { error: "Invalid minimum ROI" },
      { status: 400 }
    );
  }

  try {
    const result = await getLiveOpportunities(backStake, minRoi);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Provider request failed";

    const status =
      message === "QUOTE_PROVIDER_NOT_CONFIGURED" ? 503 : 502;

    return NextResponse.json(
      {
        error:
          status === 503
            ? "Quote provider not configured"
            : "Quote provider unavailable",
        code: message,
      },
      { status }
    );
  }
}
