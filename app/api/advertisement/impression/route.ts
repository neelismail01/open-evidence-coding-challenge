import { NextRequest, NextResponse } from "next/server";
import { insertRowsToTable } from "../../../../utils/supabase_manager";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { campaign_category_id, bid } = body;
        if (!campaign_category_id || !bid) {
            console.error("A campaign_category_id and bid were not provided in the body.");
            return NextResponse.json({ error: "campaign_category_id and bid are required" }, { status: 400 });
        }

        const { data, error: insertError } = await insertRowsToTable(
            "impressions",
            [{ "campaign_category_id": campaign_category_id, "bid": bid }]
        )

        if (insertError) {
            console.error("Error inserting into impressions table:", insertError);
            return NextResponse.json({ error: insertError.message || "Failed to insert impression data" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
