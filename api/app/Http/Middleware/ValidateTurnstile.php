<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class ValidateTurnstile
{
    public function handle(Request $request, Closure $next): Response
    {
        $enabled = filter_var(env('TURNSTILE_ENABLED', false), FILTER_VALIDATE_BOOL);

        if (!$enabled) {
            return $next($request);
        }

        $secret = env('TURNSTILE_SECRET_KEY');

        if (!$secret || !is_string($secret) || trim($secret) === '') {
            return response()->json([
                'ok' => false,
                'message' => 'Turnstile not configured.',
            ], 500);
        }

        $token = $request->input('turnstile_token')
            ?? $request->input('turnstileToken')
            ?? $request->input('cf_turnstile_response')
            ?? $request->input('cf-turnstile-response');

        if (!$token || !is_string($token) || trim($token) === '') {
            return response()->json([
                'ok' => false,
                'message' => 'Turnstile required.',
            ], 422);
        }

        try {
            $resp = Http::asForm()->timeout(4)->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $request->ip(),
            ]);

            $json = $resp->json();

            if (!is_array($json) || empty($json['success'])) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Turnstile failed.',
                ], 422);
            }
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'message' => 'Turnstile verification error.',
            ], 422);
        }

        return $next($request);
    }
}
