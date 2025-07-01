import { type NextRequest, NextResponse } from "next/server";

interface LineMessage {
  type: string;
  text: string;
}

interface LineMessageRequest {
  to?: string;
  messages: LineMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    // Validate required environment variables
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
      return NextResponse.json(
        { error: "LINE_CHANNEL_ACCESS_TOKEN environment variable is not set" },
        { status: 500 },
      );
    }

    // Validate input
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Prepare LINE API request
    const lineApiUrl = "https://api.line.me/v2/bot/message/push";

    const lineMessageData: LineMessageRequest = {
      to: userId,
      messages: [
        {
          type: "text",
          text: message.trim(),
        },
      ],
    };

    // Send request to LINE API
    const response = await fetch(lineApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lineMessageData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LINE API Error:", errorText);

      let errorMessage = "Failed to send message to LINE API";

      if (response.status === 400) {
        errorMessage = "Invalid request. Check your message format or user ID.";
      } else if (response.status === 401) {
        errorMessage = "Invalid LINE Channel Access Token.";
      } else if (response.status === 403) {
        errorMessage = "Forbidden. Check your LINE Bot permissions.";
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    return NextResponse.json({
      success: true,
      message: "Message sent successfully to LINE!",
      lineResponse: responseData,
    });
  } catch (error) {
    console.error("Server error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to send messages." },
    { status: 405 },
  );
}
