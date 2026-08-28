<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="theme-color" content="#1B4B6B" />
    <meta name="description" content="سَنَد | SANAD — نظام إدارة المبيعات والفواتير والمشتريات" />

    {{-- CSRF Token --}}
    <meta name="csrf-token" content="{{ csrf_token() }}" />

    {{-- Title --}}
    <title inertia>{{ config('app.name', 'سَنَد | SANAD') }}</title>

    {{-- Fonts: Cairo من Google (preconnect للأداء) --}}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    {{-- Vite Assets --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    {{-- Inertia Head --}}
    @inertiaHead
</head>
<body class="antialiased">
    {{-- Inertia App Mount Point --}}
    @inertia
</body>
</html>
