"use client"
import Link from "next/link"
import { ArrowRight, CheckCircle, Lock, Shield, UserCheck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast" // adjust this import path based on your setup

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const router = useRouter()

  const getUserInfo = async () => {
    const token = localStorage.getItem("authToken")
    console.log("Token:", token)
    if (!token) {
      toast({ title: "No authentication token found" })
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/user", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP Error: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      setIsLoggedIn(true)
      setEmail(result.email)
      setName(result.name)
      setToken(token)

      toast({ title: "You are Successfully Logged In" })
    } catch (error) {
      toast({
        title: "Server Error",
      })
    }
  }

  useEffect(() => {
    getUserInfo()
  }, [])
const Logout = async () => {
  localStorage.setItem("authToken", "null");


    // Optionally clear user-related state
    setIsLoggedIn(false);
    setEmail("");
    setName("");
    setToken("");

    // Show feedback
    toast({
      title: "Logged out successfully",
    });
    router.push("/");
}
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">AuthFlow</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/#faq" className="text-gray-300 hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
          {isLoggedIn ? (
  <Button
    variant="ghost"
    className="text-gray-300 hover:text-white"
    onClick={Logout}
  >
    LogOut
  </Button>
) : (
  <Link href="/Login">
    <Button variant="ghost" className="text-gray-300 hover:text-white">
      Login
    </Button>
  </Link>
)}

            <Link href="/Signup">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 border-b border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Secure Your App With <span className="text-purple-500">Modern Auth</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
            Understand the difference between authentication and authorization with our clear guide.
          </p>

          {isLoggedIn && (
            <div className="bg-gray-800 text-left p-6 rounded-xl mb-6 max-w-2xl mx-auto">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p className="truncate"><strong>Token:</strong> {token}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/Signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:text-white w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Authentication vs Authorization</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Understanding the difference is crucial for building secure applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-lg">
              <div className="h-14 w-14 rounded-full bg-purple-900/30 flex items-center justify-center mb-6">
                <UserCheck className="h-7 w-7 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Authentication</h3>
              <p className="text-gray-400 mb-6">
                Verifies the identity of users trying to access a system by requiring credentials like username and password.
              </p>
              <ul className="space-y-3">
                {["Login credentials", "Multi-factor authentication", "Biometric verification", "Single sign-on"].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-lg">
              <div className="h-14 w-14 rounded-full bg-blue-900/30 flex items-center justify-center mb-6">
                <Lock className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Authorization</h3>
              <p className="text-gray-400 mb-6">
                Determines what resources an authenticated user can access and what actions they can perform.
              </p>
              <ul className="space-y-3">
                {["Role-based access control", "Permission management", "Access policies", "Resource protection"].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Common questions about authentication and authorization
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "What's the main difference between authentication and authorization?",
                answer: "Authentication verifies who a user is, while authorization determines what resources a user can access."
              },
              {
                question: "Why is authentication important?",
                answer: "Authentication ensures that only legitimate users can access your system, protecting sensitive data and functionality from unauthorized access."
              },
              {
                question: "What are common authentication methods?",
                answer: "Common methods include password-based authentication, multi-factor authentication (MFA), biometric authentication, and social Login."
              },
              {
                question: "What is role-based access control?",
                answer: "Role-based access control (RBAC) is an authorization approach that assigns permissions to users based on their roles within an organization."
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                <h3 className="text-xl font-bold mb-3">{item.question}</h3>
                <p className="text-gray-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Implement Secure Authentication?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Get started with our secure, easy-to-implement authentication system today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/Signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/Login">
              <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:text-white w-full sm:w-auto">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <Shield className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold">AuthFlow</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/#faq" className="text-gray-400 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/Login" className="text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/Signup" className="text-gray-400 hover:text-white transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} AuthFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
