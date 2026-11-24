import { NextResponse } from "next/server";
import { getPublicEnvStatus } from "@/lib/env";

export async function GET() {
  const publicEnv = getPublicEnvStatus();
  return NextResponse.json({
    status: "ok",
    service: "personal-running-coach",
    publicEnvConfigured: publicEnv.configured,
    timestamp: new Date().toISOString(),
  });
}
