<?php

namespace App\Http\Controllers;

use App\Jobs\SendContactEmail;
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
            'hp' => ['nullable', 'string', 'max:200'],
        ]);

        if (!empty($data['hp'])) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid submission.',
            ], 422);
        }

        $contactRequest = ContactRequest::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'],
            'status' => 'new',
        ]);

        $templateId = (string) config("services.sendgrid.contact_template_id");

        SendContactEmail::dispatch(
            $contactRequest->email,
            $contactRequest->name,
            $templateId,
            [
                "name" => $contactRequest->name,
                "email" => $contactRequest->email,
                "subject" => $contactRequest->subject,
                "message" => $contactRequest->message,
                "id" => $contactRequest->id,
            ]
        );

        return response()->json([
            'ok' => true,
            'id' => $contactRequest->id,
        ], 201);
    }
}
