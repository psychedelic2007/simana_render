"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple toast types without external dependencies
export interface ToastProps {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  className?: string
}

export type ToastActionElement = React.ReactElement<{
  altText: string
}>

// Simple toast components without Radix UI
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const ToastViewport: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
    />
  )
}

export const Toast: React.FC<ToastProps> = ({ className, variant = "default", ...props }) => {
  const baseStyles = "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg"
  const variantStyles = {
    default: "border bg-white text-black dark:bg-gray-800 dark:text-white",
    destructive: "border-red-500 bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-50"
  }
  
  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  )
}

export const ToastAction: React.FC<{ 
  className?: string; 
  altText: string; 
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ 
  className, 
  altText, 
  children,
  onClick
}) => (
  <button
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
      className
    )}
    aria-label={altText}
    onClick={onClick}
  >
    {children}
  </button>
)

export const ToastClose: React.FC<{ 
  className?: string;
  onClick?: () => void;
}> = ({ className, onClick }) => (
  <button
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    onClick={onClick}
  >
    <span className="sr-only">Close</span>
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
)

export const ToastTitle: React.FC<{ 
  className?: string; 
  children: React.ReactNode;
}> = ({ 
  className, 
  children 
}) => (
  <div className={cn("text-sm font-semibold", className)}>
    {children}
  </div>
)

export const ToastDescription: React.FC<{ 
  className?: string; 
  children: React.ReactNode;
}> = ({ 
  className, 
  children 
}) => (
  <div className={cn("text-sm opacity-90", className)}>
    {children}
  </div>
)
