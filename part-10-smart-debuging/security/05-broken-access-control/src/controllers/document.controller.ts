// Document Controller - Contains BOLA Vulnerability
// EXERCISE: Find and fix the authorization issues

interface Document {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  isPrivate: boolean;
  sharedWith: string[];  // User IDs with access
  createdAt: Date;
  updatedAt: Date;
}

interface Request {
  params: Record<string, string>;
  body: Record<string, unknown>;
  user?: { id: string; role: string };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

// Mock database
const documents: Map<string, Document> = new Map([
  ['doc-1', {
    id: 'doc-1',
    ownerId: 'user-1',
    title: 'Private Financial Report',
    content: 'Q2 2024 earnings: $1.2M...',
    isPrivate: true,
    sharedWith: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-01'),
  }],
  ['doc-2', {
    id: 'doc-2',
    ownerId: 'user-2',
    title: 'Medical Records',
    content: 'Patient diagnosis: ...',
    isPrivate: true,
    sharedWith: ['user-3'],
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-05-10'),
  }],
]);

export class DocumentController {
  // VULNERABLE: No ownership or sharing check
  async getDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const doc = documents.get(id);

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // VULNERABLE: No check for ownership or sharing permissions
    // Private documents accessible to anyone with the ID
    res.status(200).json({ document: doc });
  }

  // VULNERABLE: Anyone can edit any document
  async updateDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const doc = documents.get(id);

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // VULNERABLE: No ownership check - anyone can modify
    const { title, content } = req.body as { title?: string; content?: string };

    if (title) doc.title = title;
    if (content) doc.content = content;
    doc.updatedAt = new Date();

    res.status(200).json({ document: doc });
  }

  // VULNERABLE: Anyone can delete any document
  async deleteDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const doc = documents.get(id);

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // VULNERABLE: No ownership check
    documents.delete(id);
    res.status(200).json({ message: 'Document deleted' });
  }

  // VULNERABLE: Anyone can share any document
  async shareDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const doc = documents.get(id);

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // VULNERABLE: Anyone can modify sharing settings
    const { shareWith } = req.body as { shareWith: string[] };
    doc.sharedWith = [...doc.sharedWith, ...shareWith];

    res.status(200).json({ document: doc });
  }
}

// What the fix should look like:
//
// function canAccessDocument(doc: Document, userId: string): boolean {
//   // Owner always has access
//   if (doc.ownerId === userId) return true;
//
//   // Public documents are accessible
//   if (!doc.isPrivate) return true;
//
//   // Check if user is in shared list
//   if (doc.sharedWith.includes(userId)) return true;
//
//   return false;
// }
//
// function canModifyDocument(doc: Document, userId: string): boolean {
//   // Only owner can modify
//   return doc.ownerId === userId;
// }
