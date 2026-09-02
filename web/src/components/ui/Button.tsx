import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // A simplistic implementation for the initial design system
    let baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    
    let variantStyles = "";
    if (variant === "default") variantStyles = "bg-primary text-primary-foreground shadow hover:bg-primary/90";
    else if (variant === "destructive") variantStyles = "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90";
    else if (variant === "outline") variantStyles = "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";
    else if (variant === "secondary") variantStyles = "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80";
    else if (variant === "ghost") variantStyles = "hover:bg-accent hover:text-accent-foreground";
    else if (variant === "link") variantStyles = "text-primary underline-offset-4 hover:underline";

    let sizeStyles = "";
    if (size === "default") sizeStyles = "h-9 px-4 py-2";
    else if (size === "sm") sizeStyles = "h-8 rounded-md px-3 text-xs";
    else if (size === "lg") sizeStyles = "h-10 rounded-md px-8";
    else if (size === "icon") sizeStyles = "h-9 w-9";

    const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${className || ""}`;

    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
