import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import Reservation from "../../models/Reservations";
import Requirement from "../../models/InstituionRequirements";

export async function GET(req) {
  await dbConnect();
  let requirementId = req.nextUrl.searchParams.get("requirementId");
  //   const token = req.cookies.get("authToken");
  //   if (!token) {
  //     console.log("Token not found. Redirecting to login.");
  //     return NextResponse.json(
  //       { message: "Access denied. No token provided.", success: false },
  //       { status: 401 }
  //     );
  //   }

  //   const decoded = await verifyToken(token.value);
  //   const userRole = decoded.role;
  //   if (!decoded || !userRole) {
  //     return NextResponse.json(
  //       { message: "Invalid token.", success: false },
  //       { status: 403 }
  //     );
  //   }

  try {
    const warehouseId = "req.cookies.warehouseId";

    if (!warehouseId) {
      return NextResponse.json(
        { message: "Unauthorized access", success: false },
        { status: 403 }
      );
    }

    // ✅ Step 1: Find the Requirement Document
    let request = await Requirement.findOne({
      _id: requirementId,
      warehouseId,
    }).populate("requirements.medicineId"); // Medicine details bhi chahiye

    if (!request) {
      return NextResponse.json(
        { message: "Requirement not found", success: false },
        { status: 404 }
      );
    }

    // ✅ Step 2: Fetch Reserved Stock Details for This Requirement
    let reservations = await Reservation.find({
      warehouseId,
      requirementId,
    });

    // ✅ Step 3: Format Response with Batch-Wise Allocation
    let formattedReqs = request.requirements.map((med) => {
      let reservedStock = reservations.filter(
        (res) => res.medicineId.toString() === med.medicineId._id.toString()
      );

      let batchWiseStock = reservedStock.map((res) => ({
        batchName: res.batchName,
        expiryDate: res.expiryDate,
        reservedQuantity: res.reservedQuantity,
      }));

      return {
        medicineName: med.medicineId.name,
        medicineId: med.medicineId._id,
        quantityRequested: med.Quantity,
        allotedQuantity: med.allotedQuantity || 0,
        batchDetails: batchWiseStock, // Batch-wise stock details
      };
    });

    return NextResponse.json(
      {
        requestId: request._id,
        institutionId: request.institutionId,
        warehouseId: request.warehouseId,
        status: request.status,
        isStockDeducted: request.isStockDeducted,
        requirements: formattedReqs,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  await dbConnect();
  //   const token = req.cookies.get("authToken");
  //   if (!token) {
  //     console.log("Token not found. Redirecting to login.");
  //     return NextResponse.json(
  //       { message: "Access denied. No token provided.", success: false },
  //       { status: 401 }
  //     );
  //   }

  //   const decoded = await verifyToken(token.value);
  //   const userRole = decoded.role;
  //   if (!decoded || !userRole) {
  //     return NextResponse.json(
  //       { message: "Invalid token.", success: false },
  //       { status: 403 }
  //     );
  //   }

  const { requirementId } = await req.json();

  try {
    const warehouseId = "req.cookies.warehouseId";

    if (!warehouseId) {
      return NextResponse.json(
        { message: "Unauthorized access", success: false },
        { status: 403 }
      );
    }

    // ✅ Step 1: Find the Requirement Document
    let requirement = await Requirement.findOne({
      _id: requirementId,
      warehouseId,
    });

    if (!requirement) {
      return NextResponse.json(
        { message: "Requirement not found", success: false },
        { status: 404 }
      );
    }

    // ✅ Step 2: Fetch Reserved Stock Details for This Requirement
    for (let med of requirement.requirements) {
      let reservedStock = await Reservation.find({
        warehouseId,
        requirementId,
        medicineId: med.medicineId,
      });

      for (let batch of reservedStock) {
        // Deduct from warehouse stock
        await WarehouseStock.updateOne(
          {
            warehouseId,
            medicineId: batch.medicineId,
            batchName: batch.batchName,
          },
          { $inc: { "quantity.totalStrips": -batch.reservedQuantity } }
        );
      }
    }

    // ✅ Step 2: Delete Reservations Only for This Requirement
    await Reservation.deleteMany({ warehouseId, requirementId });

    // ✅ Step 3: Mark Requirement as Fulfilled
    requirement.isStockDeducted = true;
    await requirement.save();

    return NextResponse.json(
      {
        message: "Stock deducted successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
