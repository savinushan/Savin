"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageCircle,
  UserCheck,
  UserX,
  Smartphone,
  Lock,
} from "lucide-react"
import {
  ContactVerificationService,
  type ContactInfo,
  type ContactSyncResult,
} from "@/lib/contact-verification-service"

interface ContactSyncInterfaceProps {
  userPhone: string
  userName: string
  onSyncComplete: (contacts: ContactInfo[]) => void
}

export function ContactSyncInterface({ userPhone, userName, onSyncComplete }: ContactSyncInterfaceProps) {
  const [syncStep, setSyncStep] = useState<"permission" | "reading" | "syncing" | "complete">("permission")
  const [progress, setProgress] = useState(0)
  const [syncResult, setSyncResult] = useState<ContactSyncResult | null>(null)
  const [contactService] = useState(() => new ContactVerificationService(userPhone))
  const [error, setError] = useState("")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const startContactSync = async () => {
    try {
      setError("")
      setSyncStep("permission")
      setProgress(10)

      // Request contact access
      const hasPermission = await contactService.requestContactAccess()
      if (!hasPermission) {
        setError("Contact access is required to find your friends on Hey")
        return
      }

      setSyncStep("reading")
      setProgress(30)

      // Read device contacts
      const deviceContacts = await contactService.getDeviceContacts()
      setProgress(60)

      setSyncStep("syncing")

      // Sync with Hey servers
      const result = await contactService.syncContactsWithHey(deviceContacts)
      setSyncResult(result)
      setProgress(100)

      setSyncStep("complete")

      // Pass contacts to parent
      setTimeout(() => {
        onSyncComplete(result.contacts)
      }, 2000)
    } catch (error) {
      console.error("Contact sync failed:", error)
      setError("Failed to sync contacts. Please try again.")
    }
  }

  const skipContactSync = () => {
    onSyncComplete([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center pb-8 pt-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-4 bg-blue-500/10 backdrop-blur-sm rounded-3xl border border-blue-500/20">
              <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Connect with Contacts</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
                Find friends who have your number and are on Hey
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50/80 dark:bg-blue-950/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Privacy Protected</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                  Your contacts are only used to find mutual connections. We only show people who have your number in
                  their contacts and are registered on Hey. Your contact list is never stored on our servers.
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-10 pb-10">
          {syncStep === "permission" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-3xl border border-green-200/50 dark:border-green-800/50">
                  <Smartphone className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Access Your Contacts</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                  Hey needs access to your contacts to find friends who have your number and are using the app. This
                  ensures you can only message people who know you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">What We Do</span>
                  </div>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Find mutual contacts on Hey</li>
                    <li>• Verify contact relationships</li>
                    <li>• Enable secure messaging</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200/50 dark:border-red-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="font-semibold text-red-900 dark:text-red-100">What We Don't Do</span>
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Store your contact list</li>
                    <li>• Share your contacts</li>
                    <li>• Allow random messaging</li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={skipContactSync}
                  className="flex-1 h-14 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={startContactSync}
                  className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all duration-300"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Access Contacts
                </Button>
              </div>
            </div>
          )}

          {(syncStep === "reading" || syncStep === "syncing") && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-6 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-sm rounded-3xl border border-blue-200/50 dark:border-blue-800/50">
                  <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {syncStep === "reading" ? "Reading Contacts..." : "Finding Hey Users..."}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {syncStep === "reading"
                    ? "Accessing your device contacts securely"
                    : "Checking which contacts are on Hey and have your number"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-gray-200/50 dark:bg-gray-700/50" />
              </div>
            </div>
          )}

          {syncStep === "complete" && syncResult && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-3xl border border-green-200/50 dark:border-green-800/50">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contacts Synced!</h3>
                <p className="text-gray-600 dark:text-gray-400">Found your mutual contacts who are on Hey</p>
              </div>

              {/* Sync Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{syncResult.totalContacts}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Contacts</div>
                </div>
                <div className="text-center p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{syncResult.heyUsers}</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">On Hey</div>
                </div>
                <div className="text-center p-4 bg-green-50/50 dark:bg-green-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {syncResult.mutualContacts}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Can Message</div>
                </div>
              </div>

              {/* Contact List Preview */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Your Hey Contacts</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {syncResult.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={`font-bold text-sm ${
                            contact.isMutual
                              ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300"
                              : "bg-gradient-to-br from-orange-100 to-red-100 text-orange-700 dark:from-orange-900 dark:to-red-900 dark:text-orange-300"
                          }`}
                        >
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 dark:text-white truncate">{contact.name}</h5>
                        <div className="flex items-center gap-2">
                          {contact.isMutual ? (
                            <>
                              <UserCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="text-xs text-green-600 dark:text-green-400">Can message</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                              <span className="text-xs text-orange-600 dark:text-orange-400">
                                Doesn't have your number
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.online && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        {contact.isMutual ? (
                          <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to your contacts in a moment...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
