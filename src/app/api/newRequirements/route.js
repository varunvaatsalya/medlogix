import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import Reservation from "../../models/Reservations";
import Requirement from "../../models/InstituionRequirements";

export async function GET(req) {
  await dbConnect();
  let status = req.nextUrl.searchParams.get("status");
  const institutionId = "req.cookies.institutionId";
  const warehouseId = "req.cookies.warehouseId";

  if (!institutionId && !warehouseId) {
    return NextResponse.json(
      { message: "Unauthorized access!", success: false },
      { status: 401 }
    );
  }

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
    let query = {};
    if (institutionId) query.institutionId = institutionId;
    if (warehouseId) query.warehouseId = warehouseId;
    if (status) query.status = status; // Apply status filter if provided

    // 🔹 Fetch requirements based on filters
    const requirements = await Requirement.find(query)
      .populate("institutionId", "name") // Populate institution name
      .populate("warehouseId", "name location") // Populate warehouse name & location
      .populate("requirements.medicineId", "name") // Populate medicine details
      .sort({ requirementRaisedOn: -1 }); // Latest first

    return NextResponse.json(
      {
        data: requirements,
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
  // let manufacturer = req.nextUrl.searchParams.get("manufacturer");

  await dbConnect();

  // const token = req.cookies.get("authToken");
  // if (!token) {
  //   console.log("Token not found. Redirecting to login.");
  //   return NextResponse.json(
  //     { message: "Access denied. No token provided.", success: false },
  //     { status: 401 }
  //   );
  // }

  // const decoded = await verifyToken(token.value);
  // const userRole = decoded.role;
  // if (!decoded || !userRole) {
  //   return NextResponse.json(
  //     { message: "Invalid token.", success: false },
  //     { status: 403 }
  //   );
  // }
  // if (userRole !== "admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  const institutionId = "req.cookies.institutionId";
  if (!institutionId) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  const { medicines } = await req.json();

  try {
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "Invalid medicine request" });
    }

    // ✅ Step 3: Save the request in Requirement History
    const historyDoc = await RequirementHistory.create({
      institutionId,
      medicines,
      status: "Pending",
    });

    // ✅ Step 2: Warehouse Stock Fetch (Sorted by Expiry Date)
    let stockData = await WarehouseStock.find({
      medicineId: { $in: medicines.map((m) => m.medicineId) },
    }).populate("warehouseId");
    stockData.sort((a, b) => a.expiryDate - b.expiryDate); // Oldest stock first

    let allocations = [];
    let medicineFulfillment = {};

    medicines.forEach((med) => {
      medicineFulfillment[med.medicineId] = med.quantityRequested;
    });

    // ✅ Step 3: Allocate Stock with Persistent Reservation
    for (let stock of stockData) {
      const warehouseId = stock.warehouseId.toString();
      const medicineId = stock.medicineId.toString();

      // 🛠 Get reserved stock from database
      let reservation = await Reservation.findOne({
        warehouseId,
        medicineId,
      });

      let reservedQty = reservation ? reservation.reservedQuantity : 0;
      let availableStock = stock.quantity - reservedQty;

      if (availableStock <= 0) continue;

      let allocatableQty = Math.min(medicineFulfillment[medicineId], availableStock);

      // 🛠 Update reservation in database
      if (reservation) {
        reservation.reservedQuantity += allocatableQty;
        reservation.updatedAt = new Date();
        await reservation.save();
      } else {
        await Reservation.create({
          warehouseId,
          medicineId,
          reservedQuantity: allocatableQty,
        });
      }

      // 🛠 Reduce pending requirement
      medicineFulfillment[medicineId] -= allocatableQty;

      allocations.push({
        institutionId,
        warehouseId,
        requirements: [{ medicineId, quantity: allocatableQty }],
        status: medicineFulfillment[medicineId] === 0 ? "Fulfilled" : "Partial",
      });

      if (medicineFulfillment[medicineId] === 0) break;
    }

    // ✅ Step 4: Save Allocations
    await Requirement.insertMany(allocations);

    return NextResponse.json(
      {
        message: "Requirement created and allocated successfully!",
        history: historyDoc,
        allocations,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

