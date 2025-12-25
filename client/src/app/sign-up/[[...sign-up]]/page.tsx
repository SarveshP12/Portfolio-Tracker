'use client'

import { SignUp, useSignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'

type Role = 'student' | 'admin' | null

interface Organization {
  id: string
  name: string
  org_code: string
}

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [organizationCode, setOrganizationCode] = useState('')
  const [organizationVerified, setOrganizationVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  // Fetch organizations when admin role is selected
  useEffect(() => {
    if (selectedRole === 'admin') {
      fetchOrganizations()
    }
  }, [selectedRole])

  const fetchOrganizations = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data, error: dbError } = await supabase
        .from('organizations')
        .select('id, name, org_code')
        .order('name', { ascending: true })

      if (dbError) {
        setError('Database error: ' + dbError.message)
        return
      }

      if (data && data.length > 0) {
        setOrganizations(data)
      } else {
        setError('No organizations found')
      }
    } catch (err) {
      setError('Failed to load organizations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrganizationSelect = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    if (org) {
      setSelectedOrganization(org)
      setError('')
    }
  }

  const handleVerifyOrganization = async () => {
    if (!selectedOrganization) {
      setError('Please select an organization')
      return
    }

    if (!organizationCode.trim()) {
      setError('Please enter the organization code')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      // Verify the code matches the selected organization directly
      const { data, error: dbError } = await supabase
        .from('organizations')
        .select('org_code')
        .eq('id', selectedOrganization.id)
        .eq('org_code', organizationCode.trim())
        .maybeSingle()

      if (dbError) {
        setError('Database error: ' + dbError.message)
        setOrganizationVerified(false)
        return
      }

      if (data) {
        setOrganizationVerified(true)
        setError('')
      } else {
        setError('Organization code does not match the selected organization')
        setOrganizationVerified(false)
      }
    } catch (err) {
      setError('Failed to verify organization code. Please try again.')
      setOrganizationVerified(false)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReset = () => {
    setSelectedRole(null)
    setSelectedOrganization(null)
    setOrganizationCode('')
    setOrganizationVerified(false)
    setError('')
  }

  // Show role selection first
  if (!selectedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Select your role to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setSelectedRole('student')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span className="font-semibold">Student</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setSelectedRole('admin')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="font-semibold">Admin</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For admin, show organization selection and code verification
  if (selectedRole === 'admin' && !organizationVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Sign Up</CardTitle>
            <CardDescription>Select your organization and enter the code to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization-select">Organization</Label>
              <Select
                onValueChange={handleOrganizationSelect}
                disabled={isLoading}
              >
                <SelectTrigger id="organization-select">
                  <SelectValue placeholder={isLoading ? "Loading organizations..." : "Select your organization"} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization-code">Organization Code</Label>
              <Input
                id="organization-code"
                type="text"
                placeholder="Enter your organization code"
                value={organizationCode}
                onChange={(e) => setOrganizationCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyOrganization()
                  }
                }}
                disabled={!selectedOrganization}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleVerifyOrganization}
                disabled={isVerifying || !selectedOrganization}
                className="flex-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show Clerk SignUp with role metadata
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {organizationVerified && selectedOrganization && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="font-medium">
                  Verified: {selectedOrganization.name}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        <SignUp
          unsafeMetadata={{
            role: selectedRole,
            organization_code: organizationCode,
          }}
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full shadow-none',
            },
          }}
        />
        <div className="text-center">
          <Button variant="link" onClick={handleReset} className="text-muted-foreground">
            ← Choose a different role
          </Button>
        </div>
      </div>
    </div>
  )
}
