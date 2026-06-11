import { NextRequest, NextResponse } from "next/server";
import { requireAgentApi } from "@/lib/auth-helpers";
import { findLeadByEmail } from "@/lib/store/leads";
import { getPropertyById, deleteProperty, updateProperty } from "@/lib/store/properties";
import { db, isDbConfigured } from "@/lib/db";
import { properties as propertiesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;
  const { id } = await params;
  const propertyId = Number(id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
  }

  try {
    // Check if agent is approved and not restricted
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json({ error: "Your account is not approved to manage listings." }, { status: 403 });
    }
    if (agent.postingRestricted) {
      return NextResponse.json({ error: "Your privileges have been restricted by the Administrator." }, { status: 403 });
    }

    let prop: any = null;
    if (isDbConfigured) {
      const dbProp = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.id, propertyId))
        .limit(1);
      if (dbProp.length > 0) {
        prop = dbProp[0];
      }
    } else {
      prop = await getPropertyById(propertyId);
    }

    if (!prop) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    // Verify ownership
    if (prop.agentEmail !== agentEmail) {
      return NextResponse.json({ error: "You are not authorized to edit this property." }, { status: 403 });
    }

    const body = await req.json();
    const { status, expiryDate } = body;

    const patch: any = {};
    if (status !== undefined) {
      if (status !== "active" && status !== "unlisted") {
        return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
      }

      const requiresVerify = agent.requireVerification ?? false;
      const targetStatus = (status === "active" && requiresVerify) ? "unlisted" : status;
      const pendingVerification = (status === "active" && requiresVerify);
      
      patch.status = targetStatus;
      patch.pendingVerification = pendingVerification;
    }

    if (body.hasOwnProperty("expiryDate")) {
      patch.expiryDate = expiryDate || null;
    }

    let updated: any = null;
    if (isDbConfigured) {
      const dbPatch: any = {};
      if (patch.status !== undefined) {
        dbPatch.status = patch.status === "unlisted" ? "draft" : patch.status;
      }
      if (patch.pendingVerification !== undefined) dbPatch.pendingVerification = patch.pendingVerification;
      if (patch.hasOwnProperty("expiryDate")) {
        dbPatch.expiryDate = patch.expiryDate ? new Date(patch.expiryDate) : null;
      }

      const [updatedDb] = await db
        .update(propertiesTable)
        .set(dbPatch)
        .where(eq(propertiesTable.id, propertyId))
        .returning();
      updated = {
        ...updatedDb,
        priceTHB: Number(updatedDb.priceTHB),
        priceUSD: updatedDb.priceUSD ? Number(updatedDb.priceUSD) : undefined,
        status: updatedDb.status === "draft" ? "unlisted" : updatedDb.status,
      };
    } else {
      updated = await updateProperty(propertyId, {
        ...patch,
        expiryDate: patch.expiryDate || undefined,
      });
    }

    if (!updated) {
      return NextResponse.json({ error: "Failed to update property status." }, { status: 500 });
    }

    return NextResponse.json({ success: true, property: updated });
  } catch (err) {
    console.error("Failed to update property status:", err);
    return NextResponse.json({ error: "Failed to update property status." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;
  const { id } = await params;
  const propertyId = Number(id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
  }

  try {
    // Check if agent is approved and not restricted
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json({ error: "Your account is not approved to manage listings." }, { status: 403 });
    }
    if (agent.postingRestricted) {
      return NextResponse.json({ error: "Your privileges have been restricted by the Administrator." }, { status: 403 });
    }

    let prop: any = null;
    if (isDbConfigured) {
      const dbProp = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.id, propertyId))
        .limit(1);
      if (dbProp.length > 0) {
        prop = dbProp[0];
      }
    } else {
      prop = await getPropertyById(propertyId);
    }

    if (!prop) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    // Verify ownership
    if (prop.agentEmail !== agentEmail) {
      return NextResponse.json({ error: "You are not authorized to delete this property." }, { status: 403 });
    }

    let success = false;
    if (isDbConfigured) {
      await db
        .delete(propertiesTable)
        .where(eq(propertiesTable.id, propertyId));
      success = true;
    } else {
      success = await deleteProperty(propertyId);
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to delete property." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete property:", err);
    return NextResponse.json({ error: "Failed to delete property." }, { status: 500 });
  }
}
