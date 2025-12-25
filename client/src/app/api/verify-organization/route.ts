import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { valid: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { organizationCode } = await req.json()

    if (!organizationCode) {
      return NextResponse.json(
        { valid: false, message: 'Organization code is required' },
        { status: 400 }
      )
    }

    const trimmedCode = String(organizationCode).trim()

    // Query the organization table to verify the code exists
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('org_code')
      .eq('org_code', trimmedCode)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { valid: false, message: 'Database error: ' + error.message },
        { status: 500 }
      )
    }

    if (!organization) {
      return NextResponse.json(
        { valid: false, message: 'Invalid organization code' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      message: 'Organization code is valid',
    })
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: 'An error occurred while verifying the organization code' },
      { status: 500 }
    )
  }
}
