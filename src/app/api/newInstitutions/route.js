import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
// import { verifyToken } from "../../utils/jwt";
import Institution from "../../models/Institutions";

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
      response = await Institution.findById(id);

      return NextResponse.json(
        {
          response,
          success: true,
        },
        { status: 200 }
      );
    }

    response = await Institution.find().sort({ name: 1 });

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
  const { institutionCode, name, registrationNumber, location, incharge } =
    await req.json();

  try {
    let institution = new Institution({
      institutionCode,
      name,
      registrationNumber,
      location,
      incharge,
    });
    await institution.save();
    return NextResponse.json(
      { institution, message: "Institution Saved Successfully!", success: true },
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

  const { id, institutionCode, name, registrationNumber, location, incharge } =
    await req.json();

  try {
    let updateFields = {
      institutionCode,
      name,
      registrationNumber,
      location,
      incharge,
    };

    let updatedInstitution = await Institution.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, upsert: true }
    );
    await updatedInstitution.save();
    return NextResponse.json(
      {
        updatedInstitution,
        message: "Institution updated successfully!",
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
