import { analyzeMarket } from "@/lib/bls";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = analyzeMarket(body);
  return NextResponse.json(result);
}
