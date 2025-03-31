import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import Warehouse from "../../models/Warehouses";

export async function GET(req) {
  await dbConnect();
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
    let response = {};

    if (id) {
      response = await Warehouse.findById(id);

      return NextResponse.json(
        {
          response,
          success: true,
        },
        { status: 200 }
      );
    }

    response = await Warehouse.find().sort({ name: 1 });

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
  const { warehouseCode, name, location, managers } = await req.json();

  try {
    let warehouse = new Warehouse({
      warehouseCode,
      name,
      location,
      managers,
    });
    await warehouse.save();
    return NextResponse.json(
      { warehouse, message: "Warehouse Saved Successfully!", success: true },
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

  const { id, warehouseCode, name, location, managers } = await req.json();

  try {
    let updateFields = {
      warehouseCode,
      name,
      location,
      managers,
    };

    let updatedWarehouse = await Warehouse.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, upsert: true }
    );
    await updatedWarehouse.save();
    return NextResponse.json(
      {
        updatedWarehouse,
        message: "Warehouse updated successfully!",
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
