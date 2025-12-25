import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: Request) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const {
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      pincode,
      college_name,
      department,
      batch_year,
      roll_number,
      cgpa,
      tenth_percentage,
      twelfth_percentage,
      backlogs,
      skills,
      linkedin_url,
      github_url,
      portfolio_url,
    } = body

    // First, get the user's id from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single()

    if (userError || !userData) {
      console.error("Error fetching user:", userError)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Update basic user info in users table
    await supabase
      .from("users")
      .update({
        first_name,
        last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_id", user.id)

    // Check if student record exists
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", userData.id)
      .single()

    let studentData
    let studentError

    if (existingStudent) {
      // Update existing student record
      const result = await supabase
        .from("students")
        .update({
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          address,
          city,
          state,
          pincode,
          college_name,
          department,
          batch_year,
          roll_number,
          cgpa,
          tenth_percentage,
          twelfth_percentage,
          backlogs,
          skills,
          linkedin_url,
          github_url,
          portfolio_url,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.id)
        .select()
        .single()
      
      studentData = result.data
      studentError = result.error
    } else {
      // Insert new student record
      const result = await supabase
        .from("students")
        .insert({
          user_id: userData.id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          address,
          city,
          state,
          pincode,
          college_name,
          department,
          batch_year,
          roll_number,
          cgpa,
          tenth_percentage,
          twelfth_percentage,
          backlogs,
          skills,
          linkedin_url,
          github_url,
          portfolio_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      studentData = result.data
      studentError = result.error
    }

    if (studentError) {
      console.error("Error updating student profile:", studentError)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json(studentData)
  } catch (error) {
    console.error("Error in profile update:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", user.id)
      .single()

    if (userError || !userData) {
      console.error("Error fetching user:", userError)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get student data
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userData.id)
      .single()

    // Merge user and student data
    return NextResponse.json({
      ...userData,
      ...studentData,
    })
  } catch (error) {
    console.error("Error in profile fetch:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
