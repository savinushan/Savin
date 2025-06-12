"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, MessageCircle, Shield, MapPin, Loader2, Sparkles, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface PhoneAuthProps {
  onAuthSuccess: (phone: string, name: string) => void
}

export function PhoneAuth({ onAuthSuccess }: PhoneAuthProps) {
  const [step, setStep] = useState<"phone" | "otp" | "profile" | "contacts">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [generatedOTP, setGeneratedOTP] = useState("")
  const [contactsPermission, setContactsPermission] = useState<"pending" | "granted" | "denied">("pending")

  // Sri Lankan phone number validation
  const validateSriLankanPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "")

    if (digits.startsWith("94")) {
      return digits.length === 11 && /^947[0-9]{8}$/.test(digits)
    } else if (digits.startsWith("0")) {
      return digits.length === 10 && /^07[0-9]{8}$/.test(digits)
    }
    return false
  }

  const formatPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, "")
    if (digits.startsWith("0")) {
      return "+94" + digits.substring(1)
    } else if (digits.startsWith("94")) {
      return "+" + digits
    }
    return phone
  }

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handlePhoneSubmit = async () => {
    setError("")
    setSuccessMessage("")

    if (!validateSriLankanPhone(phoneNumber)) {
      setError("Please enter a valid Sri Lankan mobile number (07X XXX XXXX)")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const newOTP = generateOTP()
      setGeneratedOTP(newOTP)

      setSuccessMessage(
        `📱 SMS Sent to ${formatPhoneNumber(phoneNumber)}: "Your Hey verification code is: ${newOTP}. This code will expire in 5 minutes."`,
      )
      setStep("otp")
      setIsLoading(false)

      console.log(`🔐 OTP for ${formatPhoneNumber(phoneNumber)}: ${newOTP}`)
    }, 2000)
  }

  const handleOtpSubmit = async () => {
    setError("")
    setSuccessMessage("")

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      if (otp === generatedOTP) {
        setSuccessMessage("Phone number verified successfully!")
        setStep("profile")
      } else {
        setError("Invalid OTP. Please check the code and try again.")
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleProfileSubmit = () => {
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    setStep("contacts")
  }

  const requestContactsAccess = async () => {
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      setContactsPermission("granted")
      setSuccessMessage("Contacts access granted! You can now chat with your contacts.")
      setIsLoading(false)

      setTimeout(() => {
        const formattedPhone = formatPhoneNumber(phoneNumber)
        onAuthSuccess(formattedPhone, name.trim())
      }, 1500)
    }, 2000)
  }

  const skipContactsAccess = () => {
    setContactsPermission("denied")
    const formattedPhone = formatPhoneNumber(phoneNumber)
    onAuthSuccess(formattedPhone, name.trim())
  }

  const handleResendOTP = async () => {
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    setTimeout(() => {
      const newOTP = generateOTP()
      setGeneratedOTP(newOTP)
      setOtp("")

      setSuccessMessage(
        `📱 New SMS Sent: "Your Hey verification code is: ${newOTP}. This code will expire in 5 minutes."`,
      )
      setIsLoading(false)

      console.log(`🔐 New OTP for ${formatPhoneNumber(phoneNumber)}: ${newOTP}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-black dark:via-gray-950 dark:to-blue-950 flex transition-all duration-500">
      {/* Left Side - Apple-style Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 via-purple-600/90 to-indigo-700/90 dark:from-blue-600/95 dark:via-purple-700/95 dark:to-indigo-800/95"></div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white/15 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/20 rounded-full blur-md animate-pulse delay-500"></div>

        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>

        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <div className="flex items-center gap-5 mb-12">
            <div className="p-4 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1
                className="text-7xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                Hey
              </h1>
              <p className="text-blue-100/90 text-xl font-medium tracking-wide">Connect • Chat • Share</p>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Contact Integration</h3>
                <p className="text-blue-100/80 leading-relaxed">Seamlessly connect with people from your contacts</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Instant Messaging</h3>
                <p className="text-blue-100/80 leading-relaxed">Real-time conversations with beautiful design</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Privacy First</h3>
                <p className="text-blue-100/80 leading-relaxed">End-to-end encryption for all conversations</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Sri Lanka Exclusive</h3>
                <p className="text-blue-100/80 leading-relaxed">Built for the Sri Lankan community</p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-3">
            <Badge className="bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
              🇱🇰 Sri Lanka Only
            </Badge>
            <Badge className="bg-white/15 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
              ✨ Apple Design
            </Badge>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20">
            <MessageCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1
              className="text-4xl font-black text-gray-900 dark:text-white"
              style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              Hey
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sri Lanka Chat</p>
          </div>
        </div>

        <Card className="w-full max-w-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-0 shadow-2xl shadow-black/5 dark:shadow-black/20 rounded-3xl">
          <CardHeader className="text-center pb-8 pt-16 lg:pt-12">
            <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
              <Badge className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300">
                🇱🇰 Sri Lanka Only
              </Badge>
            </div>

            <div className="space-y-3">
              <h2
                className="text-3xl font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" }}
              >
                {step === "phone" && "Welcome to Hey"}
                {step === "otp" && "Verify Your Number"}
                {step === "profile" && "Complete Your Profile"}
                {step === "contacts" && "Connect Your Contacts"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {step === "phone" && "Enter your Sri Lankan mobile number to get started"}
                {step === "otp" && "We've sent a verification code to your phone"}
                {step === "profile" && "Just one more step to join the conversation"}
                {step === "contacts" && "Allow access to find friends who are already on Hey"}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 px-10 pb-10">
            {step === "phone" && (
              <>
                <div className="space-y-4">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-lg text-gray-500 font-medium">+94</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="77 123 4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-20 h-14 text-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-2xl backdrop-blur-sm transition-all duration-300"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">We'll send you a verification code via SMS</p>
                </div>

                {error && (
                  <div className="p-5 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="p-5 bg-green-50/80 dark:bg-green-950/30 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 rounded-2xl">
                    <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
                  </div>
                )}

                <Button
                  onClick={handlePhoneSubmit}
                  className="w-full h-14 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="text-center space-y-6">
                  <div className="inline-flex p-5 bg-blue-50/80 dark:bg-blue-950/30 backdrop-blur-sm rounded-3xl border border-blue-200/50 dark:border-blue-800/50">
                    <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Code sent to</p>
                    <p className="font-semibold text-xl text-gray-900 dark:text-white">
                      {formatPhoneNumber(phoneNumber)}
                    </p>
                  </div>
                </div>

                {successMessage && (
                  <div className="p-5 bg-green-50/80 dark:bg-green-950/30 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 rounded-2xl">
                    <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-3xl tracking-[0.5em] h-16 font-mono bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-2xl backdrop-blur-sm transition-all duration-300"
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Enter the 6-digit code from the SMS above
                  </p>
                </div>

                {error && (
                  <div className="p-5 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleOtpSubmit}
                  className="w-full h-14 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("phone")}
                    className="flex-1 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300"
                    disabled={isLoading}
                  >
                    Change Number
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResendOTP}
                    className="flex-1 h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Resend Code"}
                  </Button>
                </div>
              </>
            )}

            {step === "profile" && (
              <>
                <div className="text-center space-y-6">
                  <div className="inline-flex p-5 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-sm rounded-3xl border border-blue-200/50 dark:border-blue-800/50">
                    <span className="text-4xl">👋</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">Almost there!</h3>
                    <p className="text-gray-600 dark:text-gray-400">What should we call you in the chat?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your display name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={25}
                    className="h-14 text-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-2xl backdrop-blur-sm transition-all duration-300"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This is how others will see you in the chat
                  </p>
                </div>

                {error && (
                  <div className="p-5 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleProfileSubmit}
                  className="w-full h-14 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={!name.trim()}
                >
                  Continue to Contacts
                </Button>
              </>
            )}

            {step === "contacts" && (
              <>
                <div className="text-center space-y-6">
                  <div className="inline-flex p-5 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-sm rounded-3xl border border-blue-200/50 dark:border-blue-800/50">
                    <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-2">Find Your Friends</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Allow Hey to access your contacts to find friends who are already using the app
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-5 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="p-5 bg-green-50/80 dark:bg-green-950/30 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 rounded-2xl">
                    <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={requestContactsAccess}
                    className="w-full h-14 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Accessing Contacts...
                      </>
                    ) : (
                      "Allow Contact Access"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={skipContactsAccess}
                    className="w-full h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300"
                    disabled={isLoading}
                  >
                    Skip for Now
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Your contacts are only used to find friends on Hey and are never stored on our servers
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
