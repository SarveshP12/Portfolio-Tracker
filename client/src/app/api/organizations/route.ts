import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id, name, org_code')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Database error: ' + error.message, organizations: [] },
        { status: 500 }
      )
    }

    return NextResponse.json({ organizations: organizations || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching organizations' },
      { status: 500 }
    )
  }
}
