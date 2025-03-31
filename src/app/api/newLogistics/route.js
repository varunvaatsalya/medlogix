import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import Logistic from "../../models/Logistics";

function generateUID() {
  const prefix = "LI";
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  let uniqueDigit = `${year}${month}${date}${hours}${minutes}${seconds}`;

  const uniqueID = `${prefix}${uniqueDigit}`;
  return uniqueID;
}

export async function GET(req) {
  await dbConnect();
  let status = req.nextUrl.searchParams.get("status");
  let warehouse = req.nextUrl.searchParams.get("warehouse");
  let institution = req.nextUrl.searchParams.get("institution");
  let id = req.nextUrl.searchParams.get("id");

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
    let filters = {};
    if (status) filters.status = status;
    if (warehouse) filters.warehouse = warehouse;
    if (institution) filters.institution = institution;
    if (id) filters._id = id;

    let response = await Logistic.find(filters)
      .sort({ name: 1 })
      .populate({
        path: "warehouse",
        // select: "name location",
      })
      .populate({
        path: "institution",
        // select: "name location",
      })
      .populate({
        path: "medicines.medicine",
        // select: "name",
      });

    return NextResponse.json(
      {
        response,
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
  const { warehouse, institution, medicines, vehicles } = await req.json();

  let shipmentId = generateUID();

  try {
    let logistic = new Logistic({
      shipmentId,
      warehouse,
      institution,
      medicines,
      vehicles,
    });
    await logistic.save();
    return NextResponse.json(
      { logistic, message: "Logistic Saved Successfully!", success: true },
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
  // let status = req.nextUrl.searchParams.get("status");

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

  const { id, warehouse, institution, medicines, vehicles, status } =
    await req.json();

  try {
    let updateFields = {
      warehouse, institution, medicines, vehicles, status
    };
    let logistic = await Logistic.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, upsert: true }
    );
    await logistic.save();
    return NextResponse.json(
      { logistic, message: "Logistic updated successfully!", success: true },
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
