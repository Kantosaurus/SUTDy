import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { google } from 'googleapis';
import { RepeatOption } from '../../components/Task';

const getGoogleAuth = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    throw new Error('No access token found');
  }

  oauth2Client.setCredentials({
    access_token: session.user.accessToken,
  });

  return oauth2Client;
};

const getRecurrence = (repeat: RepeatOption): string[] => {
  switch (repeat) {
    case 'weekly':
      return ['RRULE:FREQ=WEEKLY'];
    case 'biweekly':
      return ['RRULE:FREQ=WEEKLY;INTERVAL=2'];
    case 'monthly':
      return ['RRULE:FREQ=MONTHLY'];
    case 'annually':
      return ['RRULE:FREQ=YEARLY'];
    default:
      return [];
  }
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, startDate, endDate, description, repeat } = body;

    const auth = await getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: title,
      description,
      start: {
        dateTime: new Date(startDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(endDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      recurrence: repeat ? getRecurrence(repeat as RepeatOption) : undefined,
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
} 