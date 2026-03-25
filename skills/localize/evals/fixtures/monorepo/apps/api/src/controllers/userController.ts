import { Request, Response } from 'express';
import { db } from '../db';

export async function getProfile(req: Request, res: Response) {
  const user = await db.users.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
}

export async function updateProfile(req: Request, res: Response) {
  const { name, email } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    const updated = await db.users.update(req.userId, { name, email });
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  const { confirmation } = req.body;

  if (confirmation !== 'DELETE') {
    return res.status(400).json({
      error: 'Please type DELETE to confirm account deletion',
    });
  }

  await db.users.delete(req.userId);
  res.json({ message: 'Your account has been permanently deleted' });
}
