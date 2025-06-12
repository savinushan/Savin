"use client"

// Contact verification and mutual contact detection service
export interface ContactInfo {
  id: string
  name: string
  phone: string
  hasMyNumber: boolean // They have my number in their contacts
  iHaveTheirNumber: boolean // I have their number in my contacts
  isMutual: boolean // Both conditions are true
  isOnHey: boolean // They are registered on Hey
  lastSeen: Date
  online: boolean
}

export interface ContactSyncResult {
  totalContacts: number
  heyUsers: number
  mutualContacts: number
  contacts: ContactInfo[]
}

export class ContactVerificationService {
  private localContacts: Map<string, any> = new Map()
  private heyUsers: Map<string, ContactInfo> = new Map()
  private userPhone = ""

  constructor(userPhone: string) {
    this.userPhone = userPhone
  }

  // Simulate contact access (in real app, this would use Contacts API)
  async requestContactAccess(): Promise<boolean> {
    try {
      // Simulate permission request
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate user granting permission
          resolve(true)
        }, 1000)
      })
    } catch (error) {
      console.error("Contact access denied:", error)
      return false
    }
  }

  // Simulate reading device contacts
  async getDeviceContacts(): Promise<any[]> {
    // In a real app, this would use the Contacts API
    // For demo, we'll simulate some contacts
    const simulatedContacts = [
      { name: "Kasun Perera", phone: "+94712345678" },
      { name: "Nimali Silva", phone: "+94779876543" },
      { name: "Chaminda Fernando", phone: "+94705551234" },
      { name: "Sanduni Rajapaksa", phone: "+94768889999" },
      { name: "Pradeep Wickramasinghe", phone: "+94751112222" },
      { name: "Tharaka Jayasinghe", phone: "+94781113333" },
      { name: "Malini Rathnayake", phone: "+94724445555" },
      { name: "Ruwan Jayawardena", phone: "+94766667777" },
      { name: "Sachini Perera", phone: "+94788889999" },
      { name: "Dinesh Silva", phone: "+94701234567" },
    ]

    // Store in local map
    simulatedContacts.forEach((contact) => {
      this.localContacts.set(this.normalizePhone(contact.phone), contact)
    })

    return simulatedContacts
  }

  // Normalize phone numbers for comparison
  private normalizePhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "")

    // Convert to international format
    if (digits.startsWith("0")) {
      return "+94" + digits.substring(1)
    } else if (digits.startsWith("94")) {
      return "+" + digits
    }
    return phone
  }

  // Simulate server API call to check which contacts are on Hey
  async syncContactsWithHey(deviceContacts: any[]): Promise<ContactSyncResult> {
    // Simulate Hey users (people who have registered)
    const heyRegisteredUsers = [
      {
        id: "1",
        name: "Kasun Perera",
        phone: "+94712345678",
        online: true,
        hasMyNumber: true, // Kasun has my number in his contacts
        registeredAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        name: "Nimali Silva",
        phone: "+94779876543",
        online: true,
        hasMyNumber: true, // Nimali has my number
        registeredAt: new Date("2024-01-20"),
      },
      {
        id: "3",
        name: "Chaminda Fernando",
        phone: "+94705551234",
        online: false,
        hasMyNumber: false, // Chaminda doesn't have my number
        registeredAt: new Date("2024-02-01"),
      },
      {
        id: "4",
        name: "Sanduni Rajapaksa",
        phone: "+94768889999",
        online: true,
        hasMyNumber: true, // Sanduni has my number
        registeredAt: new Date("2024-02-10"),
      },
      {
        id: "5",
        name: "Tharaka Jayasinghe",
        phone: "+94781113333",
        online: true,
        hasMyNumber: false, // Tharaka doesn't have my number
        registeredAt: new Date("2024-02-15"),
      },
    ]

    const contacts: ContactInfo[] = []
    let mutualCount = 0

    // Process each device contact
    deviceContacts.forEach((deviceContact) => {
      const normalizedPhone = this.normalizePhone(deviceContact.phone)
      const heyUser = heyRegisteredUsers.find((u) => u.phone === normalizedPhone)

      if (heyUser) {
        const iHaveTheirNumber = true // We got this from device contacts
        const hasMyNumber = heyUser.hasMyNumber
        const isMutual = iHaveTheirNumber && hasMyNumber

        if (isMutual) mutualCount++

        const contactInfo: ContactInfo = {
          id: heyUser.id,
          name: deviceContact.name,
          phone: normalizedPhone,
          hasMyNumber,
          iHaveTheirNumber,
          isMutual,
          isOnHey: true,
          lastSeen: new Date(),
          online: heyUser.online,
        }

        contacts.push(contactInfo)
        this.heyUsers.set(heyUser.id, contactInfo)
      }
    })

    return {
      totalContacts: deviceContacts.length,
      heyUsers: contacts.length,
      mutualContacts: mutualCount,
      contacts: contacts.sort((a, b) => {
        // Sort by mutual first, then online, then name
        if (a.isMutual !== b.isMutual) return a.isMutual ? -1 : 1
        if (a.online !== b.online) return a.online ? -1 : 1
        return a.name.localeCompare(b.name)
      }),
    }
  }

  // Check if messaging is allowed with a specific contact
  canMessageContact(contactId: string): boolean {
    const contact = this.heyUsers.get(contactId)
    return contact ? contact.isMutual : false
  }

  // Get contact info
  getContactInfo(contactId: string): ContactInfo | null {
    return this.heyUsers.get(contactId) || null
  }

  // Get all mutual contacts
  getMutualContacts(): ContactInfo[] {
    return Array.from(this.heyUsers.values()).filter((contact) => contact.isMutual)
  }

  // Get contacts who have Hey but don't have my number
  getOneWayContacts(): ContactInfo[] {
    return Array.from(this.heyUsers.values()).filter(
      (contact) => contact.isOnHey && contact.iHaveTheirNumber && !contact.hasMyNumber,
    )
  }

  // Simulate server call to verify if someone has my number
  async verifyMutualContact(contactId: string): Promise<boolean> {
    // In real app, this would be a secure server call
    // Server would check if the contact has current user's number
    const contact = this.heyUsers.get(contactId)
    return contact ? contact.hasMyNumber : false
  }

  // Update contact's online status
  updateContactStatus(contactId: string, online: boolean) {
    const contact = this.heyUsers.get(contactId)
    if (contact) {
      contact.online = online
      contact.lastSeen = new Date()
      this.heyUsers.set(contactId, contact)
    }
  }
}
