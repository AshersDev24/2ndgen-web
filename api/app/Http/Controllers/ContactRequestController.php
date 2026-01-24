<?php

namespace App\Http\Controllers;

use App\Models\ContactRequest;
use Illuminate\Http\Request;

class ContactRequestController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:180'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $contactRequest = ContactRequest::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'],
            'status' => 'new',
        ]);

        return response()->json([
            'ok' => true,
            'id' => $contactRequest->id,
        ], 201);
    }
}
