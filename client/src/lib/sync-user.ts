import { currentUser } from '@clerk/nextjs/server'
import { supabase } from './supabase'

export async function syncUserToSupabase() {
  const user = await currentUser()
  
  if (!user) return null

  // Check if user already exists in Supabase
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', user.id)
    .single()

  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update({
        email: user.emailAddresses[0]?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    return data
  }

  // Insert new user
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar_url: user.imageUrl,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting user:', JSON.stringify(error, null, 2))
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    return null
  }

  return data
}

export async function getCurrentSupabaseUser() {
  const user = await currentUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', user.id)
    .single()

  return data
}
