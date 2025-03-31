import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import StockWarehouse from "../../models/StockWarehouses";

export async function GET(req) {
  await dbConnect();
  let page = req.nextUrl.searchParams.get("page");
  let warehouseId = req.nextUrl.searchParams.get("warehouseId");
  let medicineId = req.nextUrl.searchParams.get("medicineId");

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
    const filter = {};
    if (warehouseId) filter.warehouseId = warehouseId;
    if (medicineId) filter.medicineId = medicineId;
    let limit = 50;

    const stocks = await StockWarehouse.find(filter)
      .populate("warehouseId medicineId") // Populate warehouse & medicine data
      .sort({ "stocks.createdAt": -1 }) // Sorting based on latest stock entry
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return NextResponse.json(
      {
        success: true,
        total: stocks.length,
        page: parseInt(page),
        limit: parseInt(limit),
        data: stocks,
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
  const { warehouseId, medicineId, stock } = await req.json();

  if (
    !warehouseId ||
    !medicineId ||
    !stock.batchNumber ||
    !stock.quantity ||
    !stock.packetSize ||
    !stock.packetSize.strips ||
    !stock.packetSize.tabletsPerStrip ||
    !stock.purchasePrice ||
    !stock.sellingPrice ||
    !stock.mrp ||
    !stock.expiryDate ||
    !stock.receivedDate
  ) {
    return NextResponse.json(
      { message: "All required fields must be provided!", success: false },
      { status: 400 }
    );
  }

  try {
    stock.createdAt = new Date();

    let warehouseStock = await StockWarehouse.findOne({
      warehouseId,
      medicineId,
    });

    if (warehouseStock) {
      warehouseStock.stocks.push(stock);
      await warehouseStock.save();
      return NextResponse.json(
        {
          success: true,
          message: "Stock updated successfully!",
          data: warehouseStock,
        },
        { status: 200 }
      );
    } else {
      // 🔹 If no entry found, create a new document
      warehouseStock = new StockWarehouse({
        warehouseId,
        medicineId,
        stocks: [stock],
      });

      await warehouseStock.save();
      return NextResponse.json(
        {
          success: true,
          message: "New stock entry created!",
          data: warehouseStock,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  // let minqty = req.nextUrl.searchParams.get("minqty");

  await dbConnect();

  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  // const decoded = await verifyToken(token.value);
  // const userRole = decoded.role;
  // const userEditPermission = decoded.editPermission;
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

  const { id, warehouseId, medicineId, stocks } = await req.json();

  if (!id || !warehouseId || !medicineId || !Array.isArray(stocks)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid input data!",
      },
      { status: 400 }
    );
  }

  try {
    let warehouseStock = await StockWarehouse.findOne({ _id, warehouseId, medicineId });

    if (!warehouseStock) {
      return res.status(404).json({ success: false, message: "Stock entry not found!" });
    }

    // 🔹 Replace the entire stocks array with the new one
    warehouseStock.stocks = stocks;
    await warehouseStock.save();
    return NextResponse.json(
      {
        success: true, message: "Stock updated successfully!", data: warehouseStock
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
