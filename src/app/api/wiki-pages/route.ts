import { NextResponse } from 'next/server';
import PAGES_LIST from '../../../config/pages.json';

export async function GET() {
  try {
    // Convert pages list to just the slugs for easier lookup
    const slugs = PAGES_LIST.map(path => path.replace('/c/', '').replace('/', ''));
    
    return NextResponse.json({ pages: slugs });
  } catch (error) {
    console.error('Error loading pages list:', error);
    return NextResponse.json({ error: 'Failed to load pages list' }, { status: 500 });
  }
}