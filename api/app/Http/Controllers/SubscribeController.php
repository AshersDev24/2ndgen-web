<?php

namespace App\Http\Controllers;

use App\Jobs\SendWelcomeEmail;
use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscribeController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'hp' => ['nullable', 'string', 'max:200'],
        ]);

        if (!empty($data['hp'])) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid submission.',
            ], 422);
        }

        $subscriber = Subscriber::query()->firstOrNew(['email' => $data['email']]);
        $wasNew = !$subscriber->exists;

        $subscriber->status = 'active';
        $subscriber->save();

        if ($wasNew) {
            SendWelcomeEmail::dispatch($subscriber->email, null);
        }

        return response()->json([
            'ok' => true,
            'id' => $subscriber->id,
        ], 201);
    }
}
