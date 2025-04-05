import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/events?username=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const events = await db.collection('events').find({ username }).toArray();
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events
export async function POST(request: Request) {
  try {
    const { events, username, calendarId } = await request.json();
    if (!events || !username || !calendarId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('events').insertMany(
      events.map((event: any) => ({
        ...event,
        username,
        calendarId,
        start: new Date(event.start),
        end: new Date(event.end),
        createdAt: new Date()
      }))
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save events' }, { status: 500 });
  }
}

// PUT /api/events
export async function PUT(request: Request) {
  try {
    const { id, updates, username } = await request.json();
    if (!id || !updates || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(id), username },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/events
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');
    const calendarId = searchParams.get('calendarId');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    let query: any = { username };

    if (id) {
      query._id = new ObjectId(id);
    } else if (calendarId) {
      query.calendarId = calendarId;
    } else {
      return NextResponse.json({ error: 'Either id or calendarId is required' }, { status: 400 });
    }

    const result = await db.collection('events').deleteMany(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete events' }, { status: 500 });
  }
} 