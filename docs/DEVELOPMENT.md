# Geliştirme Kılavuzu

## Projeye Başlama

### 1. Proje Yapısını Anla
- `/dokuzbes` - Flutter Frontend
- `/backend` - Node.js API
- `/database` - PostgreSQL Migrations
- `/docs` - Dokumentasyon

### 2. Development Environment

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Docker Containers
docker-compose up -d

# Terminal 3: Flutter
cd dokuzbes
flutter run
```

## Yeni Feature Ekleme

### Örnek: "Notes" Feature'ı Eklemek

#### 1. Database Migration
```bash
# database/003_create_notes_table.sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Backend Model
```javascript
// backend/src/models/noteModel.js
class Note {
  constructor(id, userId, title, content, createdAt, updatedAt) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDatabase(row) {
    return new Note(
      row.id,
      row.user_id,
      row.title,
      row.content,
      row.created_at,
      row.updated_at
    );
  }
}

module.exports = Note;
```

#### 3. Backend Service
```javascript
// backend/src/services/noteService.js
const pool = require('../config/database');
const Note = require('../models/noteModel');

class NoteService {
  async createNote(userId, title, content) {
    const query = `
      INSERT INTO notes (user_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, title, content]);
    return Note.fromDatabase(result.rows[0]);
  }

  async getNotesByUser(userId) {
    const query = `
      SELECT * FROM notes
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map(Note.fromDatabase);
  }

  async deleteNote(noteId, userId) {
    const query = `
      DELETE FROM notes
      WHERE id = $1 AND user_id = $2;
    `;
    await pool.query(query, [noteId, userId]);
  }
}

module.exports = new NoteService();
```

#### 4. Backend Controller
```javascript
// backend/src/controllers/noteController.js
const noteService = require('../services/noteService');
const { sendSuccess, sendError } = require('../utils/response');
const { STATUS_CODES } = require('../config/constants');

class NoteController {
  async create(req, res) {
    try {
      const { title, content } = req.body;
      const userId = req.user.id;

      const note = await noteService.createNote(userId, title, content);
      sendSuccess(res, note, 'Note created', STATUS_CODES.CREATED);
    } catch (error) {
      sendError(res, error.message, STATUS_CODES.INTERNAL_ERROR, error);
    }
  }

  async getAll(req, res) {
    try {
      const userId = req.user.id;
      const notes = await noteService.getNotesByUser(userId);
      sendSuccess(res, notes);
    } catch (error) {
      sendError(res, error.message, STATUS_CODES.INTERNAL_ERROR, error);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await noteService.deleteNote(id, userId);
      sendSuccess(res, null, 'Note deleted');
    } catch (error) {
      sendError(res, error.message, STATUS_CODES.INTERNAL_ERROR, error);
    }
  }
}

module.exports = new NoteController();
```

#### 5. Backend Routes
```javascript
// backend/src/routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const noteController = require('../controllers/noteController');

router.post('/', verifyToken, (req, res) => noteController.create(req, res));
router.get('/', verifyToken, (req, res) => noteController.getAll(req, res));
router.delete('/:id', verifyToken, (req, res) => noteController.delete(req, res));

module.exports = router;
```

#### 6. Ana Route'a Ekle
```javascript
// backend/src/routes/index.js
router.use('/api/notes', require('./noteRoutes'));
```

#### 7. Flutter Model
```dart
// dokuzbes/lib/models/note_model.dart
class Note {
  final int id;
  final int userId;
  final String title;
  final String content;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Note({
    required this.id,
    required this.userId,
    required this.title,
    required this.content,
    required this.createdAt,
    this.updatedAt,
  });

  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      title: json['title'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null 
        ? DateTime.parse(json['updated_at'] as String)
        : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'content': content,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}
```

#### 8. Flutter Service
```dart
// dokuzbes/lib/services/note_service.dart
import 'package:dokuzbes/models/note_model.dart';
import 'package:dokuzbes/services/api_client.dart';

class NoteService {
  final ApiClient _apiClient = ApiClient();

  Future<Note> createNote(String title, String content) async {
    return _apiClient.post(
      '/api/notes',
      body: {
        'title': title,
        'content': content,
      },
      requireAuth: true,
      parser: (json) => Note.fromJson(json),
    );
  }

  Future<List<Note>> getNotes() async {
    return _apiClient.get(
      '/api/notes',
      requireAuth: true,
      parser: (json) {
        final list = json is List ? json : [json];
        return (list as List).map((note) => Note.fromJson(note)).toList();
      },
    );
  }

  Future<void> deleteNote(int noteId) async {
    return _apiClient.delete(
      '/api/notes/$noteId',
      requireAuth: true,
      parser: (_) => null,
    );
  }
}
```

#### 9. Flutter Provider
```dart
// dokuzbes/lib/providers/note_provider.dart
import 'package:flutter/material.dart';
import 'package:dokuzbes/models/note_model.dart';
import 'package:dokuzbes/services/note_service.dart';

class NoteProvider with ChangeNotifier {
  final NoteService _noteService = NoteService();
  List<Note> _notes = [];
  bool _isLoading = false;

  List<Note> get notes => _notes;
  bool get isLoading => _isLoading;

  Future<void> fetchNotes() async {
    _isLoading = true;
    notifyListeners();

    try {
      _notes = await _noteService.getNotes();
    } catch (e) {
      print('Error fetching notes: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addNote(String title, String content) async {
    try {
      final note = await _noteService.createNote(title, content);
      _notes.add(note);
      notifyListeners();
    } catch (e) {
      print('Error adding note: $e');
    }
  }

  Future<void> deleteNote(int noteId) async {
    try {
      await _noteService.deleteNote(noteId);
      _notes.removeWhere((note) => note.id == noteId);
      notifyListeners();
    } catch (e) {
      print('Error deleting note: $e');
    }
  }
}
```

#### 10. Flutter Screen
```dart
// dokuzbes/lib/screens/notes_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dokuzbes/providers/note_provider.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({Key? key}) : super(key: key);

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => context.read<NoteProvider>().fetchNotes(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notes')),
      body: Consumer<NoteProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return ListView.builder(
            itemCount: provider.notes.length,
            itemBuilder: (context, index) {
              final note = provider.notes[index];
              return ListTile(
                title: Text(note.title),
                subtitle: Text(note.content),
                trailing: IconButton(
                  icon: const Icon(Icons.delete),
                  onPressed: () => provider.deleteNote(note.id),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to create note screen
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

## Code Standards

### Backend
- Controllers: HTTP layer
- Services: Business logic
- Models: Data layer
- Error handling: Centralized
- Response format: Standardized JSON

### Frontend
- Models: Data representation
- Services: API communication
- Providers: State management
- Screens: UI pages
- Widgets: Reusable components

## Testing

### Backend
```bash
npm test
```

### Frontend
```bash
flutter test
```

## Git Workflow

```bash
# Feature branch oluştur
git checkout -b feature/notes

# Değişiklikleri commit et
git add .
git commit -m "feat: add notes feature"

# Push et
git push origin feature/notes

# Pull request oluştur
```
