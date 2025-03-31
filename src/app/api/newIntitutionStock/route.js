import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import StockInstitution from "../../models/StockInstitutions";
import Logistic from "../../models/Logistics";

export async function GET(req) {
  await dbConnect();

  let page = req.nextUrl.searchParams.get("page");
  let warehouseId = req.nextUrl.searchParams.get("warehouseId");
  let institutionId = req.nextUrl.searchParams.get("institutionId");
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
    let query = {};
    if (institutionId) query.institutionId = institutionId;
    if (warehouseId) query["stocks.warehouseId"] = warehouseId;
    if (medicineId) query.medicineId = medicineId;

    const perPage = 50;
    const stocks = await StockInstitution.find(query)
      .populate("institutionId")
      .populate("medicineId")
      .populate("stocks.warehouseId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    return NextResponse.json({ success: true, data: stocks }, { status: 200 });
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
  const { shipmentId } = await req.json();

  const institutionIdFromCookies = "req.cookies.institutionId";

  try {
    if (!shipmentId) {
      return NextResponse.json(
        { success: false, message: "Shipment ID is required!" },
        { status: 400 }
      );
    }

    // 🔹 Find the logistics entry
    const logistics = await Logistic.findOne({ shipmentId })
      .populate("institution")
      .populate("medicines.medicine");

    if (!logistics) {
      return NextResponse.json(
        { success: false, message: "Shipment not found!" },
        { status: 404 }
      );
    }

    // 🔹 Check if institution matches
    if (logistics.institution._id.toString() !== institutionIdFromCookies) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access!" },
        { status: 403 }
      );
    }

    for (let med of logistics.medicines) {
      const { medicine, stocks } = med;

      for (let stock of stocks) {
        const {
          batchNumber,
          expiryDate,
          quantity,
          packetSize,
          sellingPrice,
          mrp,
        } = stock;

        const totalStrips = quantity;
        const stripsPerBox = packetSize.strips || 1;
        const boxes = Math.floor(totalStrips / stripsPerBox);
        const extra = totalStrips % stripsPerBox;
        const tablets = 0;

        // 🔹 Check if stock already exists for this institution & medicine
        let institutionStock = await StockInstitution.findOne({
          institutionId: logistics.institution._id,
          medicineId: medicine._id,
        });

        if (!institutionStock) {
          institutionStock = new StockInstitution({
            institutionId: logistics.institution._id,
            medicineId: medicine._id,
            stocks: [],
          });
        }

        // 🔹 Add new stock entry
        institutionStock.stocks.push({
          warehouseId: logistics.warehouse,
          batchName: batchNumber,
          expiryDate,
          packetSize,
          quantity: { boxes, extra, tablets, totalStrips },
          quantityReceived: totalStrips,
          purchasePrice: sellingPrice, // Selling price of warehouse = Purchase price of institution
          mrp,
          receivedDate: new Date(),
        });

        await institutionStock.save();
      }
    }

    // 🔹 Update logistics status to Delivered & Received
    logistics.status = "Delivered";
    logistics.receivedStatus = "Received";
    await logistics.save();

    return NextResponse.json(
      {
        success: true,
        message: "Stock updated successfully!",
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

export async function PUT(req) {
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
  const { medicineId, batchName, quantity } = await req.json();

  const institutionIdFromCookies = "req.cookies.institutionId";

  if (!medicineId || !batchName || !quantity) {
    return NextResponse.json(
      {
        success: false,
        message: "Medicine ID, Batch Name, and Quantity are required!",
      },
      { status: 400 }
    );
  }

  try {
    const institutionStock = await StockInstitution.findOne({
      institutionId: institutionIdFromCookies,
      medicineId: medicineId,
      "stocks.batchName": batchName,
    });

    if (!institutionStock) {
      return NextResponse.json(
        { message: "Stock entry not found", success: false },
        { status: 404 }
      );
    }

    // 🔹 Find stock inside array
    let stockIndex = institutionStock.stocks.findIndex(
      (stock) => stock.batchName === batchName
    );

    if (stockIndex === -1) {
      return NextResponse.json(
        { message: "Batch not found in institution record!", success: false },
        { status: 404 }
      );
    }

    // 🔹 Get strips per box (from packetSize)
    let stripsPerBox = institutionStock.stocks[stockIndex].packetSize.strips;

    if (!stripsPerBox || stripsPerBox <= 0) {
      return NextResponse.json(
        { message: "Invalid strips per box value!", success: false },
        { status: 400 }
      );
    }

    // 🔹 Auto-calculate Boxes & Extra Strips
    let totalStrips = quantity.totalStrips;
    let boxes = Math.floor(totalStrips / stripsPerBox); // Total full boxes
    let extra = totalStrips % stripsPerBox; // Remaining strips after full boxes

    // 🔹 Update the stock
    institutionStock.stocks[stockIndex].quantity = {
      boxes: boxes,
      extra: extra,
      tablets: quantity.tablets, // Tablets as received
      totalStrips: totalStrips,
    };

    await institutionStock.save();

    return NextResponse.json(
      {
        success: true,
        message: "Stock quantity updated successfully!",
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
