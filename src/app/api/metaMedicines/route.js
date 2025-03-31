import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import Manufacturer from "../../models/Manufacturers";
import Salt from "../../models/Salts";

export async function GET(req) {
  await dbConnect();
  let manufacturer = req.nextUrl.searchParams.get("manufacturer");
  let salts = req.nextUrl.searchParams.get("salts");

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
//   let editPermission = decoded.editPermission;
//   console.log(editPermission);
//   if (!decoded || !userRole) {
//     return NextResponse.json(
//       { message: "Invalid token.", success: false },
//       { status: 403 }
//     );
//   }

  try {
    const response = {};
    if (manufacturer == "1") {
      response.manufacturers = await Manufacturer.find().sort({ name: 1 });
    }
    if (salts == "1") {
      response.salts = await Salt.find().sort({ name: 1 });
    }

    if (!manufacturer && !salts) {
      response.manufacturers = await Manufacturer.find().sort({ name: 1 });
      response.salts = await Salt.find().sort({ name: 1 });
    }

    return NextResponse.json(
      {
        response,
        userRole,
        editPermission,
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
  let manufacturer = req.nextUrl.searchParams.get("manufacturer");
  let salts = req.nextUrl.searchParams.get("salts");
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
//   if (userRole !== "admin") {
//     return NextResponse.json(
//       { message: "Access denied. admins only.", success: false },
//       { status: 403 }
//     );
//   }
  const { name, medicalRepresentator, useCase } =
    await req.json();

  try {
    let response;
    if (manufacturer == "1") {
      response = new Manufacturer({ name, medicalRepresentator });
    } else if (salts == "1") {
      response = new Salt({ name, useCase });
    }
    if (response) await response.save();
    return NextResponse.json({ response, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  let manufacturer = req.nextUrl.searchParams.get("manufacturer");
  let salts = req.nextUrl.searchParams.get("salts");
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
//   if (userRole !== "admin") {
//     return NextResponse.json(
//       { message: "Access denied. admins only.", success: false },
//       { status: 403 }
//     );
//   }
  const {
    id,
    name,
    medicalRepresentator,
    useCase,
  } = await req.json();

  try {
    let response;
    if (manufacturer == "1") {
      response = await Manufacturer.findByIdAndUpdate(
        id,
        { name, medicalRepresentator },
        { new: true }
      );
    
    } else if (salts == "1") {
      response = await Salt.findByIdAndUpdate(
        id,
        { name, useCase },
        { new: true }
      );
    }

    return NextResponse.json({ response, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
