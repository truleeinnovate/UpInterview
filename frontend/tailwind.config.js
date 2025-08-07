/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Replace HSL variables with concrete values or define them properly
        border: "#e5e7eb", // Example concrete value
        input: "#ffffff", 
        ring: "#3b82f6",
        background: "#ffffff",
        foreground: "#111827",
        
        // Your primary color scale (good)
        primary: {
          50: '#f0f9fa',
          100: '#d9f1f4',
          200: '#b8e3ea',
          300: '#8bceda',
          400: '#58b0c2',
          500: '#217989',
          600: '#1e6b79',
          700: '#1c5964',
          800: '#1c4a53',
          900: '#1c3f47',
        },
        
        // Either define these properly or use concrete values
        secondary: {
          DEFAULT: "#9ca3af", // Example concrete value
          foreground: "#111827"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff"
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280"
        },
        accent: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff"
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111827"
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827"
        },
        
        // Your custom colors (good)
        'custom-blue': '#217989',
        'custom-bg': '#F5F9FA',
        'toggle-bg': '#DEF5FB',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    screens: {
      'sm': {'min': '320px', 'max': '639px'},
      'md': {'min': '640px', 'max': '1023px'},
      'lg': {'min': '1024px', 'max': '1279px'},
      'xl': {'min': '1280px', 'max': '1535px'},
      '2xl': {'min': '1536px'},
    },
  },
   plugins: [
    require('@tailwindcss/forms'),
  ],
}