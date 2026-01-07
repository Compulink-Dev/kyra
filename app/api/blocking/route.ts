import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai"; // This should now work

export async function POST() { // Remove unused request parameter
  try {
    // Call your AI function
    const result = await generateContent();
    
    return NextResponse.json({ 
      success: true, 
      message: "Content generated",
      result 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in blocking API:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to generate content" 
    }, { status: 500 });
  }
}

// Optionally, add other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    message: "This endpoint only accepts POST requests" 
  }, { status: 405 });
}