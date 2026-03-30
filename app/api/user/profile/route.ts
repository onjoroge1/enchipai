import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiResponse, apiError, parseJsonBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const { name } = body;

    if (name !== undefined && typeof name !== "string") {
      return apiError("Invalid name", 400);
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim() || null;

    const user = await prisma.user.update({
      where: { id: authResult.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return apiResponse(user, 200, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return apiError("Internal server error", 500);
  }
}
