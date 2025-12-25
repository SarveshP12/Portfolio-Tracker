import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', { status: 400 })
  }

  const eventType = evt.type
  console.log('Received webhook event:', eventType, evt.data)

  // Handle user.created event
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data

    if (!email_addresses || email_addresses.length === 0) {
      console.error('No email address found for user')
      return new Response('No email address', { status: 400 })
    }

    // Extract role and organization_id from unsafe_metadata
    const role = (unsafe_metadata as any)?.role || 'student'
    const organization_id = (unsafe_metadata as any)?.organization_id || null

    const { error } = await supabase.from('users').insert({
      user_id: id, // or whatever column name you're using
      email: email_addresses[0].email_address,
      first_name: first_name || null,
      last_name: last_name || null,
      role: role,
      organization_id: organization_id,
    })

    if (error) {
      console.error('Error inserting user into Supabase:', error)
      return new Response('Error inserting user', { status: 500 })
    }

    console.log('User created successfully:', id, 'with role:', role)
  }

  // Handle user.updated event
  else if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const updateData: any = {
      first_name: first_name || null,
      last_name: last_name || null,
    }

    if (email_addresses && email_addresses.length > 0) {
      updateData.email = email_addresses[0].email_address
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', id) // or whatever column name you're using

    if (error) {
      console.error('Error updating user in Supabase:', error)
      return new Response('Error updating user', { status: 500 })
    }

    console.log('User updated successfully:', id)
  }

  // Handle user.deleted event
  else if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      console.error('No user id found in delete event')
      return new Response('No user id', { status: 400 })
    }

    const { error } = await supabase.from('users').delete().eq('user_id', id) // or whatever column name you're using

    if (error) {
      console.error('Error deleting user from Supabase:', error)
      return new Response('Error deleting user', { status: 500 })
    }

    console.log('User deleted successfully:', id)
  }

  return new Response('Webhook processed', { status: 200 })
}
