import { NextResponse } from 'next/server';

// The target backend server base URL, derived from environment variable or defaulted.
const TARGET_SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:8001';

export async function GET() {
  try {
    const targetUrl = `${TARGET_SERVER_BASE_URL}/models/config`;

    // Make the actual request to the backend service
    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    // If the backend service responds with an error
    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: `Backend service responded with status: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    // Forward the response from the backend
    const modelConfig = await backendResponse.json();
    
    // Validate that we received a proper response
    if (!modelConfig || typeof modelConfig !== 'object') {
      console.error('Invalid response format from backend:', modelConfig);
      return NextResponse.json(
        { 
          error: 'Invalid response format from backend service',
          receivedData: modelConfig 
        },
        { status: 502 }
      );
    }
    
    return NextResponse.json(modelConfig);
  } catch (error) {
    console.error('Error fetching model configurations:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      error: 'Failed to fetch model configurations from backend',
      details: errorMessage,
      targetUrl: `${TARGET_SERVER_BASE_URL}/models/config`,
      timestamp: new Date().toISOString()
    };
    
    return new NextResponse(JSON.stringify(errorDetails), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
  }
}

// Handle OPTIONS requests for CORS if needed
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
