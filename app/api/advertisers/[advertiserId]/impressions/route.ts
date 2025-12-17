import { NextRequest, NextResponse } from "next/server";
import { getCompanyImpressionCount } from "../../../../../utils/supabase_manager";

export async function GET(
    req: NextRequest,
    { params }: { params: { advertiserId: number } }
) {
    try {
      const { advertiserId } = params;
        const { data, error } = await getCompanyImpressionCount(advertiserId)

        if (error) {
            console.error("Error fetching impressions for advertiser:", error);
            return NextResponse.json({ error: error.message || "Failed to fetch impressions" }, { status: 500 });
        }

        return NextResponse.json({ data: data, error: null });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
