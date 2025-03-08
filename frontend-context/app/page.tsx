"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Send, Menu, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Sample suggestions
const INITIAL_SUGGESTIONS = [
  "Tell me about yourself",
  "How can you help me?",
  "What's new today?",
  "Give me some ideas",
]

const FOLLOW_UP_SUGGESTIONS = ["Tell me more", "That's interesting", "Can you elaborate?", "What else can you do?"]

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: "/api/chat",
    initialMessages: [
      { id: "1", role: "system", content: "You are a helpful assistant." },
      { id: "2", role: "assistant", content: "Hello! How can I help you today?" },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [currentSuggestions, setCurrentSuggestions] = useState(INITIAL_SUGGESTIONS)

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
  }

  // Reset suggestions when a new message is sent
  useEffect(() => {
    if (messages.length > 0) {
      if (messages[messages.length - 1].role === "assistant") {
        setCurrentSuggestions(messages.length > 2 ? FOLLOW_UP_SUGGESTIONS : INITIAL_SUGGESTIONS)
        setShowSuggestions(true)
      }
    }
  }, [messages])

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 py-4 px-6 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="text-white">
          <Menu size={20} />
        </Button>
        <div className="flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dark_flag-aQ1hglQddObEIi6rRPUpfHwVQsPnY7.png"
            alt="Network Assistant Logo"
            width={24}
            height={24}
            className="invert brightness-200"
          />
          <span className="font-serif text-lg">Network Assistant</span>
        </div>
        <Button className="rounded-full bg-white text-black hover:bg-zinc-200 px-4 py-2 text-sm font-medium">
          LOGIN <LogIn className="ml-1 h-4 w-4" />
        </Button>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6 max-w-3xl mx-auto py-12">
          {messages.length <= 2 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dark_flag-aQ1hglQddObEIi6rRPUpfHwVQsPnY7.png"
                alt="Network Assistant Logo"
                width={80}
                height={80}
                className="invert brightness-200 mb-8"
              />
              <h1 className="text-5xl font-serif mb-2 text-white">Network Assistant</h1>
              <p className="text-xl mb-8">A Conversational Experience</p>
            </div>
          ) : (
            messages.slice(2).map((message) => (
              <div key={message.id} className={cn("max-w-[85%]", message.role === "user" ? "ml-auto" : "mr-auto")}>
                <div
                  className={cn(
                    "px-1 py-1 text-sm font-medium uppercase",
                    message.role === "user" ? "text-right" : "text-left",
                  )}
                >
                  {message.role === "user" ? "You" : "Network"}
                </div>
                <div className={cn("mt-1 text-lg", message.role === "user" ? "text-right" : "text-left")}>
                  {message.content}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="max-w-[85%] mr-auto">
              <div className="px-1 py-1 text-sm font-medium uppercase">Network</div>
              <div className="mt-1 text-lg">
                <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span
                  className="inline-block w-3 h-3 bg-white rounded-full animate-pulse ml-1"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="inline-block w-3 h-3 bg-white rounded-full animate-pulse ml-1"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area with Suggestions */}
      <div className="border-t border-zinc-800">
        {/* Suggestions Section */}
        {showSuggestions && !isLoading && (
          <div className="max-w-3xl mx-auto px-6 pt-6">
            <div className="flex flex-wrap gap-2">
              {currentSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 bg-zinc-900/50 rounded-full text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-6">
          <form
            onSubmit={(e) => {
              handleSubmit(e)
              setShowSuggestions(false)
            }}
            className="flex gap-4 max-w-3xl mx-auto"
          >
            <Input
              value={input}
              onChange={(e) => {
                handleInputChange(e)
                if (e.target.value === "") {
                  setShowSuggestions(true)
                } else {
                  setShowSuggestions(false)
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-white rounded-full px-6"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-full bg-white text-black hover:bg-zinc-200 px-6"
            >
              <Send size={18} className="mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

