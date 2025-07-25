import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { supabaseAdmin } from '@/lib/supabase'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Missing webhook secret' },
      { status: 500 }
    )
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url } = userData

  const primaryEmail = email_addresses.find((email: any) => email.id === userData.primary_email_address_id)
  
  if (!primaryEmail) {
    throw new Error('No primary email found')
  }

  const fullName = [first_name, last_name].filter(Boolean).join(' ')

  const { error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        id,
        email: primaryEmail.email_address,
        full_name: fullName || null,
        avatar_url: image_url || null,
      }
    ])

  if (error) {
    console.error('Error creating user in Supabase:', error)
    throw error
  }

  console.log(`User created: ${id}`)
}

async function handleUserUpdated(userData: any) {
  const { id, email_addresses, first_name, last_name, image_url } = userData

  const primaryEmail = email_addresses.find((email: any) => email.id === userData.primary_email_address_id)
  
  if (!primaryEmail) {
    throw new Error('No primary email found')
  }

  const fullName = [first_name, last_name].filter(Boolean).join(' ')

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      email: primaryEmail.email_address,
      full_name: fullName || null,
      avatar_url: image_url || null,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating user in Supabase:', error)
    throw error
  }

  console.log(`User updated: ${id}`)
}

async function handleUserDeleted(userData: any) {
  const { id } = userData

  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting user from Supabase:', error)
    throw error
  }

  console.log(`User deleted: ${id}`)
}
